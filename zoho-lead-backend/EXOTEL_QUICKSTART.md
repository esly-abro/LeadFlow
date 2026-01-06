# 🚀 QUICK START - Enable Exotel Calling

## You're Almost Done! Just 2 Steps:

### Step 1: Get Your Exophone
1. Visit: https://my.exotel.com/nil6910
2. Click "Phone Numbers" or "Exophones" in the menu
3. Copy your virtual number (e.g., 02248940XXX or similar)

### Step 2: Update .env File

Open this file:
```
zoho-lead-backend\.env
```

Add these lines at the end (or update if they exist):

```bash
# Exotel Configuration
EXOTEL_ENABLED=true
EXOTEL_ACCOUNT_SID=nil6910
EXOTEL_API_KEY=5681199f2b0b804d57c37298b8d6295d55164417c373fbef
EXOTEL_API_TOKEN=8b67707d5818b9dc231fbcffbe4e56ee69867c4b5f47eaa3
EXOTEL_SUBDOMAIN=api.exotel.com
EXOTEL_EXOPHONE=YOUR_EXOPHONE_HERE
EXOTEL_APP_ID=
EXOTEL_CALL_DELAY_MS=60000
EXOTEL_CALL_TYPE=trans
EXOTEL_MAX_RETRIES=3
```

**Replace `YOUR_EXOPHONE_HERE` with your actual Exophone number!**

### That's It!

The server will auto-reload and you should see:
```
📞 Exotel IVR calling is ENABLED
   Call delay: 60000ms (60s)
```

Now whenever a new lead is created, they'll get a call in 1 minute! 📞

---

## Optional: Configure IVR Flow

If you want calls to go through a custom IVR:
1. Create an IVR app in Exotel dashboard
2. Get the App ID
3. Set `EXOTEL_APP_ID=your_app_id` in .env

---

## Test It

Create a test lead with YOUR phone number:

```bash
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d "{\"source\": \"Website\", \"name\": \"Test Lead\", \"phone\": \"YOUR_PHONE\", \"email\": \"test@example.com\"}"
```

You should get a call in 60 seconds! ✨

Check stats: http://localhost:3000/exotel/stats

---

For detailed documentation, see [EXOTEL_SETUP.md](./EXOTEL_SETUP.md)
