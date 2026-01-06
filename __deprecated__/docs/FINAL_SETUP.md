# 🚀 FINAL SETUP - Let's Get This Running!

## Your Exophone Numbers
You have 2 numbers available:
- **Mobile**: `09513886363` ⭐ (Recommended for calling leads)
- **Landline**: `04446312650`

Both have "nil6910 Landing Flow" assigned.

---

## Step 1: Update .env File

Open: `zoho-lead-backend\.env`

**Update these two lines:**

```bash
EXOTEL_EXOPHONE=09513886363
EXOTEL_APP_ID=
```

**Why leave APP_ID empty?** 
- You already have "nil6910 Landing Flow" assigned to this number
- For now, we'll use direct calling (lead gets a call)
- After testing, we'll create the custom IVR flow

**Your complete Exotel section should be:**

```bash
EXOTEL_ENABLED=true
EXOTEL_ACCOUNT_SID=nil6910
EXOTEL_API_KEY=5681199f2b0b804d57c37298b8d6295d55164417c373fbef
EXOTEL_API_TOKEN=8b67707d5818b9dc231fbcffbe4e56ee69867c4b5f47eaa3
EXOTEL_SUBDOMAIN=api.exotel.com
EXOTEL_EXOPHONE=09513886363
EXOTEL_APP_ID=
EXOTEL_CALL_DELAY_MS=60000
EXOTEL_CALL_TYPE=trans
EXOTEL_MAX_RETRIES=3
```

**Save the file** - server will auto-reload!

---

## Step 2: Verify Server Reloaded

Check the terminal - you should see:
```
📞 Exotel IVR calling is ENABLED
   Call delay: 60000ms (60s)
```

---

## Step 3: Test with YOUR Phone

Run this command (replace YOUR_PHONE with your actual number):

```bash
curl -X POST http://localhost:3000/leads -H "Content-Type: application/json" -H "X-API-Key: your_api_key_here" -d "{\"source\": \"Website\", \"name\": \"Test Lead\", \"phone\": \"YOUR_PHONE_NUMBER\", \"email\": \"test@example.com\"}"
```

**Example:**
```bash
curl -X POST http://localhost:3000/leads -H "Content-Type: application/json" -H "X-API-Key: your_api_key_here" -d "{\"source\": \"Website\", \"name\": \"John Doe\", \"phone\": \"9876543210\", \"email\": \"test@example.com\"}"
```

**What should happen:**
1. Lead is created in Zoho CRM
2. After 60 seconds, you receive a call from `09513886363`
3. You'll hear the "nil6910 Landing Flow" message

---

## Step 4: Create Custom IVR Flow (After Testing)

Once basic calling works, create the JK Real Estate IVR:

### Option A: Modify Existing Flow

1. Go to https://my.exotel.com/nil6910
2. Click **"Passthru"** or **"Flows"**
3. Find **"nil6910 Landing Flow"**
4. Click **"Edit"** or **"Create New"**

### Option B: Create New Flow

1. Click **"Create New Flow"**
2. Name: `JK Real Estate Lead IVR`
3. Build the flow:

**Message 1 (Play/Say):**
```
Hello, this is an automated call from J K Real Estate. 
We noticed you showed interest in properties. 
We have some exciting options that match your requirements. 
Our properties feature modern amenities, prime locations, and competitive pricing.
Would you like to schedule a site visit?
```

**Gather Input:**
```
Press 1 to schedule a visit with our team
Press 2 to receive more information via WhatsApp  
Press 3 if you're not interested at this time
```

**Button Actions:**
- **Press 1**: Connect to your sales number: `YOUR_SALES_TEAM_NUMBER`
- **Press 2**: Play message "We will send you information on WhatsApp" → Hangup
- **Press 3**: Play message "Thank you" → Hangup

4. **Save and Get App ID**
5. **Update .env**: `EXOTEL_APP_ID=your_new_app_id`

---

## Step 5: Advanced - IVR Response Webhooks (Optional)

To track what users press and trigger actions:

In your IVR flow settings:
- **Action URL**: `http://YOUR_PUBLIC_URL/exotel/ivr-response`
- **Method**: POST

This will log responses and can:
- Update Zoho CRM when user presses 1 (Site Visit)
- Send WhatsApp when user presses 2
- Mark as "Not Interested" when user presses 3

**Note**: Your backend must be publicly accessible for webhooks. For local testing, use ngrok:
```bash
ngrok http 3000
```

---

## Quick Checklist

- [ ] Update EXOTEL_EXOPHONE=09513886363 in .env
- [ ] Save .env file (server auto-reloads)
- [ ] Check terminal shows "Exotel IVR calling is ENABLED"
- [ ] Test with curl command using your phone number
- [ ] Wait 60 seconds
- [ ] You receive a call!
- [ ] Create custom IVR flow in Exotel dashboard
- [ ] Get App ID and update EXOTEL_APP_ID

---

## Troubleshooting

**Not receiving calls?**
- Check logs for "Call initiated successfully"
- Verify Exophone is correct: `09513886363`
- Ensure phone number format is correct (10 digits)
- Check Exotel dashboard for call logs

**Need help?**
- Check stats: http://localhost:3000/exotel/stats
- View logs in terminal
- Visit Exotel dashboard: https://my.exotel.com/nil6910

---

## Ready to Go Live?

Once testing is complete:
1. Create the custom JK Real Estate IVR flow
2. Set up webhook URL (use ngrok or deploy backend)
3. Configure sales team number for Press 1
4. Set up WhatsApp integration for Press 2
5. Test with multiple numbers
6. Monitor and optimize!

🎉 **You're all set!** Update that .env file and let's test it!
