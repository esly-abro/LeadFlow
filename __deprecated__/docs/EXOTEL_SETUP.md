# Exotel IVR Integration - Setup Guide

## Overview
The Exotel IVR integration automatically calls new leads within 1 minute of creation. This feature has been fully implemented and is ready to use.

## Prerequisites
1. Active Exotel account
2. Exophone (virtual number) configured
3. API credentials from Exotel dashboard

## Configuration Steps

### Step 1: Update .env File

Add the following configuration to your `.env` file in the `zoho-lead-backend` directory:

```bash
# Exotel Configuration (IVR Calling)
EXOTEL_ENABLED=true
EXOTEL_ACCOUNT_SID=nil6910
EXOTEL_API_KEY=5681199f2b0b804d57c37298b8d6295d55164417c373fbef
EXOTEL_API_TOKEN=8b67707d5818b9dc231fbcffbe4e56ee69867c4b5f47eaa3
EXOTEL_SUBDOMAIN=api.exotel.com
EXOTEL_EXOPHONE=YOUR_VIRTUAL_NUMBER_HERE
EXOTEL_APP_ID=YOUR_APP_ID_HERE_OPTIONAL
EXOTEL_CALL_DELAY_MS=60000
EXOTEL_CALL_TYPE=trans
EXOTEL_MAX_RETRIES=3
```

### Step 2: Get Your Exophone

**Required Action:** 
1. Log into your Exotel dashboard at https://my.exotel.com/nil6910
2. Navigate to "Phone Numbers" or "Exophones"
3. Copy your virtual number (format: usually 10 digits)
4. Update `EXOTEL_EXOPHONE` in your .env file

Example:
```bash
EXOTEL_EXOPHONE=0XXXXXXXXX
```

### Step 3: Configure IVR Flow (Optional)

If you want calls to go through an IVR flow:

1. Create an IVR flow/app in Exotel dashboard under "Passthru" or "Apps"
2. Copy the App ID
3. Update `EXOTEL_APP_ID` in your .env file

If you don't set an App ID, calls will be direct (connect lead to agent number).

### Step 4: Restart the Server

After updating the .env file:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

You should see:
```
📞 Exotel IVR calling is ENABLED
   Call delay: 60000ms (60s)
```

## How It Works

### Call Flow

1. **Lead Creation**: Someone submits a lead via POST /leads
2. **Lead Processing**: Lead is normalized and saved to Zoho CRM
3. **Call Scheduled**: If the lead has a phone number, a call is scheduled with 1-minute delay
4. **Call Execution**: After 60 seconds, Exotel API is called
5. **Phone Rings**: Lead's phone rings with your Exophone as caller ID
6. **IVR/Connection**: Lead is connected to your IVR flow or agent
7. **Status Update**: Exotel sends callback with call status

### Architecture

```
Lead Submitted → Zoho CRM → Call Scheduler (60s delay) → Exotel API → Lead's Phone
                                                             ↓
                                                    Status Callback
```

## Testing

### 1. Test with Your Own Number

Create a test lead with your phone number:

```bash
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "source": "Website",
    "name": "Test Lead",
    "phone": "YOUR_PHONE_NUMBER",
    "email": "test@example.com"
  }'
```

You should receive a call within 1 minute.

### 2. Check Call Stats

Monitor scheduled and completed calls:

```bash
curl http://localhost:3000/exotel/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "pending": 2,
    "total": 15,
    "byStatus": {
      "pending": 2,
      "success": 10,
      "failed": 2,
      "skipped": 1
    }
  }
}
```

### 3. Monitor Logs

Watch the console for these log messages:

```
[INFO] Scheduling call { callId: 'call_123_1234567890', phoneNumber: '098***21', delayMs: 60000 }
[INFO] Executing call { attempt: 1, phoneNumber: '098***21' }
[INFO] Call initiated successfully { callSid: 'abc123', status: 'queued' }
```

## Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `EXOTEL_ENABLED` | Enable/disable Exotel calling | `false` | Yes |
| `EXOTEL_ACCOUNT_SID` | Your account SID | - | Yes |
| `EXOTEL_API_KEY` | API key from dashboard | - | Yes |
| `EXOTEL_API_TOKEN` | API token from dashboard | - | Yes |
| `EXOTEL_SUBDOMAIN` | API subdomain (region) | `api.exotel.com` | Yes |
| `EXOTEL_EXOPHONE` | Your virtual number | - | Yes |
| `EXOTEL_APP_ID` | IVR flow/app ID | `null` | No |
| `EXOTEL_CALL_DELAY_MS` | Delay before calling (ms) | `60000` (1min) | No |
| `EXOTEL_CALL_TYPE` | Call type | `trans` | No |
| `EXOTEL_MAX_RETRIES` | Max retry attempts | `3` | No |

## Important Notes

### Rate Limits
- Exotel allows **200 calls per minute**
- The system doesn't enforce this limit currently
- For high volume, implement rate limiting

### Call Scheduling
- Uses **in-memory queue** with setTimeout
- Scheduled calls are **lost if server restarts**
- For production with high volume, consider Redis-backed queue

### Phone Number Format
- System auto-formats Indian mobile numbers
- 10-digit numbers starting with 6-9 get '0' prefix
- Example: `9876543210` → `09876543210`

### Status Callbacks
Status callbacks are logged but not yet integrated with Zoho CRM. 

**Future Enhancement:** Add call notes to Zoho leads after call completion.

## Troubleshooting

### No Calls Being Made

1. **Check if Exotel is enabled**:
   ```bash
   # Should show "Exotel IVR calling is ENABLED"
   ```

2. **Verify credentials**:
   - Account SID matches dashboard
   - API key and token are correct
   - Exophone is set

3. **Check logs**:
   Look for errors like:
   ```
   [ERROR] Exotel API call failed
   ```

### Calls Failing

1. **Phone number format**: Ensure numbers are valid Indian mobile numbers
2. **DND numbers**: Calls to DND numbers may fail
3. **Exophone not configured**: Set EXOTEL_EXOPHONE in .env

### Server Restart Loses Scheduled Calls

This is expected with the current in-memory implementation. For production:
- Use Redis-backed queue (Bull/BullMQ)
- Or use database-backed scheduler

## Next Steps

1. ✅ Get your Exophone from Exotel dashboard
2. ✅ Update .env file with Exophone
3. ✅ Optionally configure IVR flow/app ID
4. ✅ Restart the server
5. ✅ Test with your phone number
6. 🎯 Monitor logs and stats
7. 🎯 Configure IVR flow in Exotel for better lead experience

## Support

- **Exotel Dashboard**: https://my.exotel.com/nil6910
- **Exotel Docs**: https://developer.exotel.com
- **Check Stats**: http://localhost:3000/exotel/stats
