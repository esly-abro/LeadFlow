# Zoho CRM Lead Backend - Complete Technical Documentation

## Token Lifecycle Explanation

### How OAuth Tokens Work

1. **Initial Setup**
   - You have a `refresh_token` (never expires unless revoked)
   - No `access_token` initially

2. **First API Request**
   ```
   → tokenManager.getAccessToken() called
   → No token in cache
   → Call Zoho OAuth endpoint with refresh_token
   → Receive access_token (valid for 3600 seconds = 1 hour)
   → Cache access_token + expiry time
   → Return access_token
   ```

3. **Subsequent Requests (Within 1 Hour)**
   ```
   → tokenManager.getAccessToken() called
   → Check if cached token exists
   → Check if token expired
   → Token still valid → Return cached token
   ```

4. **Request After Token Expires**
   ```
   → tokenManager.getAccessToken() called
   → Token expired (or 60 seconds before expiry)
   → Automatically refresh using refresh_token
   → Cache new access_token
   → Return new access_token
   ```

5. **401 INVALID_TOKEN Error**
   ```
   → Zoho API returns 401
   → zohoClient catches error
   → Call tokenManager.refreshAccessToken() (force refresh)
   → Retry original request with new token
   ```

### Token Storage

**In Memory (Current Implementation):**
- `accessToken`: String (JWT token)
- `expiresAt`: Timestamp (Date.now() + 3600000)
- `refreshToken`: From environment variable
- **Limitation:** Token lost on server restart (not an issue, will auto-refresh)

**For Production (Optional Enhancement):**
- Store in Redis for multi-instance deployments
- Share token across multiple server instances

---

## Duplicate Detection Explanation

### Why It's Critical

Without duplicate detection, the same person filling multiple forms creates multiple lead records, causing:
- Data pollution
- Confusion for sales team
- Duplicate follow-ups
- Inaccurate analytics

### How It Works

#### Step 1: Search by Email (Primary)

```javascript
// Zoho API call
GET /crm/v2/Leads/search?criteria=(Email:equals:john@example.com)

// If found:
{
  "data": [{
    "id": "4876876000001234567",
    "Email": "john@example.com",
    "Last_Name": "John Doe",
    ...
  }]
}

// If not found:
{
  "code": "NO_DATA_FOUND",
  "message": "No data found"
}
```

**Action:** If found → UPDATE that lead with new data

#### Step 2: Search by Phone (Secondary)

Only if email search returned no results:

```javascript
GET /crm/v2/Leads/search?criteria=(Phone:equals:+919876543210)
```

**Action:** If found → UPDATE that lead with new data

#### Step 3: No Duplicate Found

```javascript
// Neither email nor phone matched
// Action: CREATE new lead
POST /crm/v2/Leads
```

### Edge Cases Handled

**Case 1: Email changes**
```
First submission: email=old@email.com, phone=9876543210
→ Creates lead ID 123

Second submission: email=new@email.com, phone=9876543210
→ Finds lead ID 123 by phone
→ Updates lead with new email
```

**Case 2: Phone changes**
```
First submission: email=john@email.com, phone=9876543210
→ Creates lead ID 123

Second submission: email=john@email.com, phone=9999999999
→ Finds lead ID 123 by email
→ Updates lead with new phone
```

**Case 3: Both change**
```
First submission: email=old@email.com, phone=9876543210
→ Creates lead ID 123

Second submission: email=new@email.com, phone=9999999999
→ No match found
→ Creates NEW lead (different person)
```

---

## Lead Normalization Explanation

### Input Flexibility

Accept leads from ANY source with ANY format:

```json
// Meta Ads format
{
  "source": "meta_ads",
  "full_name": "Rajesh Kumar",
  "email_address": "rajesh@gmail.com",
  "mobile_number": "9876543210",
  "ad_campaign": "Diwali Sale"
}
```

### Normalization Process

```javascript
// 1. Extract and clean name
"Rajesh Kumar" → {
  Last_Name: "Rajesh Kumar",
  First_Name: "Rajesh"
}

// 2. Normalize phone
"9876543210" → "+919876543210"
" 98765 43210 " → "+919876543210"
"+91 98765 43210" → "+919876543210"

// 3. Map source
"meta_ads" → "Facebook"
"google_ads" → "Google AdWords"

// 4. Set defaults
Company: "Unknown"  // Required by Zoho but not by us

// 5. Build description from extra fields
{
  campaign: "Diwali Sale",
  ad_id: "123"
}
→ Description: "Campaign: Diwali Sale | Ad ID: 123"
```

### Output (Zoho Format)

```json
{
  "Last_Name": "Rajesh Kumar",
  "First_Name": "Rajesh",
  "Company": "Unknown",
  "Email": "rajesh@gmail.com",
  "Phone": "+919876543210",
  "Mobile": "+919876543210",
  "Lead_Source": "Facebook",
  "Description": "Campaign: Diwali Sale | Ad ID: 123"
}
```

---

## Error Scenarios & Handling

### 1. Missing Environment Variables

**Error:**
```
Error: Missing required environment variables: ZOHO_CLIENT_ID, ZOHO_REFRESH_TOKEN
Please check your .env file
```

**When:** On server startup  
**Fix:** Add missing variables to `.env`

### 2. Invalid Refresh Token

**Error:**
```
Token refresh failed: invalid_refresh_token
```

**When:** First API request or token refresh  
**Cause:** 
- Wrong refresh_token in `.env`
- Token revoked in Zoho
- Token from wrong data center (e.g., .com instead of .in)

**Fix:** Regenerate refresh_token from Zoho

### 3. Rate Limiting

**Error:**
```
Rate limited, retry after 2 seconds
```

**When:** Too many requests to Zoho API  
**Handling:** Automatic retry after delay  
**Prevention:** Implement request queuing

### 4. Validation Errors

**Error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Name is required",
    "Invalid email format"
  ]
}
```

**When:** POST /leads with invalid data  
**Fix:** Correct request payload

### 5. Zoho API Errors

**Error:**
```json
{
  "success": false,
  "error": "Failed to create lead in Zoho CRM",
  "code": "MANDATORY_NOT_FOUND",
  "details": {
    "message": "required field not found: Company"
  }
}
```

**When:** Zoho rejects the lead data  
**Fix:** Check Zoho CRM field requirements

---

## Source Mapping Configuration

### Current Mappings

```javascript
// In src/services/leadNormalizer.js

const SOURCE_MAPPING = {
  'meta_ads': 'Facebook',
  'google_ads': 'Google AdWords',
  'website': 'Website',
  'whatsapp': 'WhatsApp',
  'linkedin': 'LinkedIn',
  'referral': 'Employee Referral'
};
```

### Adding New Sources

**Method 1: Edit Code**
```javascript
// src/services/leadNormalizer.js
const SOURCE_MAPPING = {
  // ... existing mappings
  'instagram': 'Instagram',
  'twitter': 'Twitter',
  'tiktok': 'TikTok'
};
```

**Method 2: Dynamic (Future Enhancement)**
```javascript
// API endpoint to add mappings
POST /admin/sources
{
  "key": "instagram",
  "value": "Instagram"
}
```

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] Test all endpoints locally
- [ ] Verify Zoho credentials are correct
- [ ] Test token refresh mechanism
- [ ] Test duplicate detection with real data
- [ ] Load test with expected traffic
- [ ] Setup error monitoring (Sentry, etc.)
- [ ] Configure log rotation
- [ ] Setup alerts for errors

### Deployment

- [ ] Set `NODE_ENV=production`
- [ ] Use PM2 or Docker for process management
- [ ] Setup NGINX reverse proxy
- [ ] Enable SSL/TLS (HTTPS)
- [ ] Configure firewall rules
- [ ] Setup log aggregation (ELK, etc.)
- [ ] Configure auto-restart on crash
- [ ] Setup health check monitoring

### Post-Deployment

- [ ] Monitor logs for errors
- [ ] Check token refresh is working
- [ ] Verify leads are creating in Zoho
- [ ] Monitor API response times
- [ ] Setup backup strategy
- [ ] Document runbook for common issues

---

## Integration Examples

### Meta Ads Webhook

```javascript
// Webhook receiver for Meta Ads
app.post('/webhooks/meta', async (req, res) => {
  const { entry } = req.body;
  
  // Extract lead data from webhook
  const leadData = entry[0].changes[0].value;
  
  // Transform to our format
  const normalizedData = {
    source: 'meta_ads',
    name: leadData.field_data.find(f => f.name === 'full_name').values[0],
    email: leadData.field_data.find(f => f.name === 'email').values[0],
    phone: leadData.field_data.find(f => f.name === 'phone_number').values[0],
    extra: {
      ad_id: leadData.ad_id,
      campaign: leadData.campaign_name
    }
  };
  
  // Send to our lead ingestion endpoint
  await axios.post('http://localhost:3000/leads', normalizedData);
  
  res.sendStatus(200);
});
```

### Website Form

```html
<!-- HTML Form -->
<form id="leadForm">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <input type="tel" name="phone" required>
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('leadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  const response = await fetch('http://your-backend.com/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'website',
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone')
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert('Thank you! We will contact you soon.');
  }
});
</script>
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Request Rate**
   - Leads per minute
   - Peak hours
   - Source distribution

2. **Success Rate**
   - % of successful creations
   - % of updates
   - % of errors

3. **Response Time**
   - Average API response time
   - P95, P99 latency
   - Zoho API response time

4. **Errors**
   - Token refresh failures
   - Validation errors
   - Zoho API errors
   - Duplicate detection failures

### Log Analysis

```bash
# Count leads by source
grep "Lead normalized successfully" logs/combined.log | grep -o '"source":"[^"]*"' | sort | uniq -c

# Count actions (created vs updated)
grep "Lead processed successfully" logs/combined.log | grep -o '"action":"[^"]*"' | sort | uniq -c

# Find all errors
grep "ERROR" logs/error.log

# Monitor token refreshes
grep "Refreshing Zoho access token" logs/combined.log
```

---

## FAQ

**Q: What happens if the server crashes during lead processing?**  
A: The lead is lost. For production, implement a queue system (Bull/RabbitMQ) for resilience.

**Q: Can I run multiple instances of this backend?**  
A: Yes, but token caching is in-memory. Consider Redis for shared token storage.

**Q: How do I handle custom Zoho fields?**  
A: Edit `leadNormalizer.js` → `_mapExtraFields()` to map extra data to custom fields.

**Q: Does this work with Zoho CRM other regions?**  
A: Yes, change `ZOHO_API_DOMAIN` and `ZOHO_ACCOUNTS_URL` in `.env`.

**Q: How to handle leads without email?**  
A: Phone is sufficient. Duplicate detection will work on phone.

**Q: What if I need to update other modules (Contacts, Deals)?**  
A: Create similar clients (`contactsClient.js`, `dealsClient.js`) using the same pattern.

---

## Support & Maintenance

### Regular Tasks

- **Daily:** Check error logs
- **Weekly:** Review lead creation stats
- **Monthly:** Verify token refresh working
- **Quarterly:** Update dependencies

### Troubleshooting Commands

```bash
# Check if server is running
curl http://localhost:3000/health

# View real-time logs
tail -f logs/combined.log

# Check recent errors
tail -n 50 logs/error.log

# Test token
curl http://localhost:3000/health | jq '.token'

# Count today's leads
grep "$(date +%Y-%m-%d)" logs/combined.log | grep "Lead processed successfully" | wc -l
```

---

**End of Documentation**
