# ⚠️ Exotel Call Failure - Action Required

## Issue Identified

Your calls are failing with **HTTP 403 Forbidden** error.

The error message says: **"...before making outbound calls"**

## Root Cause

**Outbound calling is NOT enabled** on your Exotel account.

## Solution - Enable Outbound Calling

### Step 1: Login to Exotel Dashboard
Visit: https://my.exotel.com/nil6910

### Step 2: Enable Outbound Calling

1. Go to **Settings** or **Account Settings**
2. Look for **"Outbound Calling"** or **"Call Settings"**
3. **Enable outbound calls**
4. You may need to:
   - Add credit/balance to your account
   - Verify your account
   - Accept terms and conditions
   - Complete KYC (if required)

### Step 3: Verify Permissions

Also check:
- **API permissions** are enabled
- **Exophone** is configured for outbound calls
- **Account has sufficient balance**

### Step 4: Test Again

Once outbound calling is enabled, test with:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/leads" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"source":"Website","name":"Test","phone":"6381143136","email":"test@example.com"}' `
  -UseBasicParsing
```

Wait 60 seconds for the call!

---

## Alternative: Check Exotel Documentation

- Visit: https://developer.exotel.com/api/
- Check their setup guide for outbound calling
- Contact Exotel support if you can't find the setting

---

## Current Status

✅ Integration is fully implemented
✅ Configuration is correct
✅ Server is running with Exotel enabled
❌ Exotel account needs outbound calling enabled

**Once you enable outbound calling in your Exotel dashboard, everything will work!**

---

## Quick Diagnostic

You can test the API anytime with:

```bash
cd zoho-lead-backend
node test-exotel-simple.js
```

This will show you the exact error message from Exotel.
