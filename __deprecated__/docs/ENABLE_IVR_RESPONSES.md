# 🚀 Quick Setup - Enable IVR Button Responses

## What You Need to Do

### Step 1: Install ngrok

```powershell
# Open PowerShell as Administrator and run:
choco install ngrok -y

# Or download from: https://ngrok.com/download
# Extract and add to PATH
```

### Step 2: Start ngrok

```powershell
# In a NEW terminal window:
ngrok http 3000
```

**You'll see something like:**
```
Forwarding  https://abc123-def456.ngrok-free.app -> http://localhost:3000
```

### Step 3: Update .env

Copy the `https://...ngrok-free.app` URL and update your `.env`:

```bash
BASE_URL=https://abc123-def456.ngrok-free.app
```

### Step 4: Restart Server

In the zoho-lead-backend terminal, type: `rs` and press Enter

### Step 5: Test!

1. Create a new lead from the UI
2. Answer the call
3. Press 1
4. ✅ Lead status will update to "Interested" in Zoho CRM!

---

## What Happens When User Presses Buttons

- **Press 1**: Lead marked as "Interested" → Connect to sales team
- **Press 2**: Lead receives WhatsApp info
- **Press 3**: Lead marked as "Not Interested"

All responses are logged and lead status is updated in Zoho CRM automatically! 🎉
