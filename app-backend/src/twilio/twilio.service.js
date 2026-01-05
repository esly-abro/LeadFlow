const twilio = require('twilio');

// Twilio credentials - MUST be set in environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_TWIML_APP_SID = process.env.TWILIO_TWIML_APP_SID;
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;

// Validate required environment variables
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.warn('Warning: Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
}

// Initialize Twilio client (only if credentials are available)
const client = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN 
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

// Generate Access Token for browser-based calling
function generateAccessToken(identity = 'agent') {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const accessToken = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET,
    { identity: identity }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: TWILIO_TWIML_APP_SID,
    incomingAllow: true,
  });

  accessToken.addGrant(voiceGrant);

  return accessToken.toJwt();
}

// Make an outbound call
async function makeCall(toNumber, fromNumber = TWILIO_PHONE_NUMBER) {
  try {
    // Clean the phone number
    let cleanNumber = toNumber.replace(/[\s\-\(\)]/g, '');
    
    // Add country code if not present (assume India)
    if (!cleanNumber.startsWith('+')) {
      if (cleanNumber.startsWith('91')) {
        cleanNumber = '+' + cleanNumber;
      } else {
        cleanNumber = '+91' + cleanNumber;
      }
    }

    const call = await client.calls.create({
      url: 'http://demo.twilio.com/docs/voice.xml', // TwiML instructions
      to: cleanNumber,
      from: fromNumber,
    });

    return {
      success: true,
      callSid: call.sid,
      status: call.status,
      to: cleanNumber,
      from: fromNumber,
    };
  } catch (error) {
    console.error('Twilio call error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get call status
async function getCallStatus(callSid) {
  try {
    const call = await client.calls(callSid).fetch();
    return {
      success: true,
      status: call.status,
      duration: call.duration,
      startTime: call.startTime,
      endTime: call.endTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get call history
async function getCallHistory(limit = 20) {
  try {
    const calls = await client.calls.list({ limit });
    return {
      success: true,
      calls: calls.map(call => ({
        sid: call.sid,
        to: call.to,
        from: call.from,
        status: call.status,
        duration: call.duration,
        startTime: call.startTime,
        direction: call.direction,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  generateAccessToken,
  makeCall,
  getCallStatus,
  getCallHistory,
  TWILIO_PHONE_NUMBER,
};
