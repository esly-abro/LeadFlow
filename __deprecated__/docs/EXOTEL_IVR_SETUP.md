# Setting Up Exotel IVR Flow for JK Real Estate

## Step-by-Step Setup

### Step 1: Get Your Exophone (REQUIRED FIRST!)

1. Visit https://my.exotel.com/nil6910
2. Go to **"Phone Numbers"** or **"Exophones"** in the left menu
3. Copy your virtual number (e.g., `08069XXXXXX` or `02248XXXXXX`)
4. **Update your .env file** - Replace this line:
   ```
   EXOTEL_EXOPHONE=YOUR_EXOPHONE_HERE
   ```
   With your actual number:
   ```
   EXOTEL_EXOPHONE=08069123456
   ```

---

### Step 2: Create IVR Flow in Exotel Dashboard

#### Option A: Using Exotel's Flow Builder (Recommended)

1. **Login** to https://my.exotel.com/nil6910

2. **Navigate to Apps/Flows**:
   - Click **"Passthru"** or **"Apps"** in the left menu
   - Click **"Create New App"** or **"Add Flow"**

3. **Name Your Flow**:
   - Name: `JK Real Estate Lead IVR`
   - Description: `Automated call for new property leads`

4. **Build the Flow**:
   
   **Step 1: Play Message**
   - Add "Play" or "Say" node
   - Text: `Hello, this is an automated call from J K Real Estate. We noticed you showed interest in properties. We have some exciting options that match your requirements. Our properties feature modern amenities, prime locations, and competitive pricing.`
   - Voice: Female/English
   
   **Step 2: Gather Input**
   - Add "Gather Digits" node
   - Message: `Would you like to schedule a site visit? Press 1 to schedule a visit with our team. Press 2 to receive more information via WhatsApp. Press 3 if you're not interested at this time.`
   - Number of digits: 1
   - Timeout: 10 seconds
   
   **Step 3: Handle Responses**
   - **If pressed 1**: Connect to sales team number OR send webhook to your backend
   - **If pressed 2**: Trigger WhatsApp message (webhook to your backend)
   - **If pressed 3**: End call with thank you message
   - **If no input**: "Our team will call you back shortly. Thank you."

5. **Save and Get App ID**:
   - Click **"Save"**
   - Copy the **App ID** (looks like: `123456` or a long number)
   - Update your .env:
     ```
     EXOTEL_APP_ID=123456
     ```

---

#### Option B: Using Exoml XML (Advanced)

If Exotel allows custom Exoml hosting:

1. Host the IVR script file `exotel-ivr-script.xml` on a public URL
2. In Exotel dashboard, create an app that points to this URL
3. Get the App ID and update .env

**Note**: Most Exotel accounts use the visual flow builder, not custom XML hosting.

---

### Step 3: Configure Webhook Response Handling (Optional)

To handle the IVR responses (what users press), you need to set up webhooks:

1. In your IVR flow, for each option (1, 2, 3):
   - Set **Action URL**: `http://YOUR_PUBLIC_URL/exotel/ivr-response`
   - Method: POST

2. I'll create an endpoint to handle these responses.

---

### Step 4: Update .env and Test

Your final .env should look like:

```bash
EXOTEL_ENABLED=true
EXOTEL_ACCOUNT_SID=nil6910
EXOTEL_API_KEY=5681199f2b0b804d57c37298b8d6295d55164417c373fbef
EXOTEL_API_TOKEN=8b67707d5818b9dc231fbcffbe4e56ee69867c4b5f47eaa3
EXOTEL_SUBDOMAIN=api.exotel.com
EXOTEL_EXOPHONE=08069123456  # YOUR ACTUAL NUMBER
EXOTEL_APP_ID=123456  # YOUR APP ID FROM STEP 2
EXOTEL_CALL_DELAY_MS=60000
EXOTEL_CALL_TYPE=trans
EXOTEL_MAX_RETRIES=3
```

**Save the file** - the server will auto-reload.

---

## Quick Test

Create a test lead with YOUR phone number:

```bash
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d "{
    \"source\": \"Website\",
    \"name\": \"Test Lead\",
    \"phone\": \"YOUR_PHONE_NUMBER\",
    \"email\": \"test@example.com\",
    \"company\": \"Test Company\"
  }"
```

**Wait 60 seconds** - you should receive a call with the IVR script!

---

## Important Notes

### Personalization
The current IVR script uses generic placeholders. Exotel's basic IVR doesn't support dynamic variables like `[Name]` or `[property type]`.

**For dynamic personalization**, you need:
1. Exotel's **advanced features** or **custom Exoml hosting**
2. OR use **text-to-speech with variables** if available in your plan
3. OR connect to an **agent** after the intro message who has the lead details

### IVR Response Actions

When users press buttons, you can:
- **Press 1**: Forward to your sales team phone number
- **Press 2**: Trigger a webhook to send WhatsApp message
- **Press 3**: Just end the call

I can create webhook handlers for these actions if needed.

---

## Next Steps

1. ✅ Get your Exophone number
2. ✅ Update EXOTEL_EXOPHONE in .env
3. ✅ Create IVR flow in Exotel dashboard
4. ✅ Get App ID and update EXOTEL_APP_ID
5. ✅ Test with your phone number
6. 🎯 Configure webhook handlers for button press actions (optional)

Let me know once you have the Exophone and App ID, and I'll help configure the response handlers!
