# ⚠️ IMPORTANT - Configure Twilio Webhook

Before testing, you need to set the webhook URL in your Twilio console:

## What I saw in your screenshot:
❌ Current URL: `https://demo.twilio.com/welcome/voice/`

## What it should be:
For now (local testing), leave it as is. The calls will still work, but you'll hear Twilio's demo message instead of our custom IVR.

**For production or to test custom IVR:**
1. Use ngrok: `ngrok http 3000`  
2. Get the ngrok URL (e.g., `https://abc123.ngrok.io`)
3. Set webhook to: `https://abc123.ngrok.io/twilio/ivr-greeting`

## ✅ Ready to Test!

Your configuration:
- Twilio Phone: `[YOUR_TWILIO_PHONE]`
- Account SID: `[YOUR_ACCOUNT_SID]`
- Status: ENABLED

**IMPORTANT**: Make sure you've verified your test number in:
- Twilio Console → Phone Numbers → Verified Caller IDs

## Test Command:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/leads" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"source":"Website","name":"Twilio Test","phone":"6381143136","email":"test@example.com"}' `
  -UseBasicParsing
```

**You should receive a call in 60 seconds!** 📞

The call will play Twilio's demo message (since webhook is still pointing to demo.twilio.com).
After verifying calls work, we can set up the custom IVR.
