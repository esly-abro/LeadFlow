# 🔧 Fix IVR Button Press Error

## Problem
When pressing "1" in the call, you get "application error occurred" because the webhook points to demo.twilio.com

## Solution: Use ngrok to expose your local server

### Step 1: Install ngrok
```powershell
# Download from: https://ngrok.com/download
# Or use chocolatey:
choco install ngrok
```

### Step 2: Run ngrok
```powershell
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

### Step 3: Update TwiML
I'll update the code to use an environment variable for the webhook URL.

Add to your `.env`:
```
BASE_URL=https://abc123.ngrok.io
```

### Step 4: Test Again
1. Restart server
2. Create new lead
3. Answer call
4. Press 1
5. Lead status will update to "Interested" in Zoho!

---

## Alternative: Use Twilio Functions (No ngrok needed)

If you don't want to use ngrok, we can deploy the IVR logic as a Twilio Function directly in your Twilio account.
