import { useState, useEffect, useRef, useCallback } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { getAccessToken } from '../../services/twilio';

interface UseTwilioCallOptions {
  onCallStarted?: () => void;
  onCallEnded?: () => void;
  onError?: (error: string) => void;
}

export function useTwilioCall(options: UseTwilioCallOptions = {}) {
  const [device, setDevice] = useState<Device | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOnCall, setIsOnCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const activeCallRef = useRef<Call | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Twilio Device
  const initializeDevice = useCallback(async () => {
    try {
      setError(null);
      const { token } = await getAccessToken();
      
      const newDevice = new Device(token, {
        codecPreferences: [Call.Codec.PCMU, Call.Codec.Opus],
        enableRingingState: true,
      });

      newDevice.on('registered', () => {
        console.log('Twilio Device registered');
        setIsReady(true);
      });

      newDevice.on('error', (err) => {
        console.error('Twilio Device error:', err);
        setError(err.message);
        options.onError?.(err.message);
      });

      newDevice.on('tokenWillExpire', async () => {
        const { token: newToken } = await getAccessToken();
        newDevice.updateToken(newToken);
      });

      await newDevice.register();
      setDevice(newDevice);
    } catch (err: any) {
      console.error('Failed to initialize Twilio:', err);
      setError(err.message);
      options.onError?.(err.message);
    }
  }, [options]);

  // Make a call
  const makeCall = useCallback(async (phoneNumber: string) => {
    if (!device || !isReady) {
      setError('Phone not ready. Please wait...');
      return false;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Clean the phone number
      let cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
      if (!cleanNumber.startsWith('+')) {
        if (cleanNumber.startsWith('91')) {
          cleanNumber = '+' + cleanNumber;
        } else {
          cleanNumber = '+91' + cleanNumber;
        }
      }

      const call = await device.connect({
        params: {
          To: cleanNumber,
        },
      });

      activeCallRef.current = call;

      call.on('accept', () => {
        console.log('Call accepted');
        setIsConnecting(false);
        setIsOnCall(true);
        setCallDuration(0);
        options.onCallStarted?.();

        // Start duration timer
        timerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      });

      call.on('disconnect', () => {
        console.log('Call disconnected');
        handleCallEnd();
      });

      call.on('cancel', () => {
        console.log('Call cancelled');
        handleCallEnd();
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
        setError(err.message);
        handleCallEnd();
      });

      call.on('reject', () => {
        console.log('Call rejected');
        handleCallEnd();
      });

      return true;
    } catch (err: any) {
      console.error('Failed to make call:', err);
      setError(err.message);
      setIsConnecting(false);
      return false;
    }
  }, [device, isReady, options]);

  // Handle call end
  const handleCallEnd = useCallback(() => {
    setIsConnecting(false);
    setIsOnCall(false);
    activeCallRef.current = null;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    options.onCallEnded?.();
  }, [options]);

  // Hang up
  const hangUp = useCallback(() => {
    if (activeCallRef.current) {
      activeCallRef.current.disconnect();
    }
    handleCallEnd();
  }, [handleCallEnd]);

  // Mute/Unmute
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = useCallback(() => {
    if (activeCallRef.current) {
      const newMuteState = !isMuted;
      activeCallRef.current.mute(newMuteState);
      setIsMuted(newMuteState);
    }
  }, [isMuted]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (device) {
        device.destroy();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [device]);

  return {
    initializeDevice,
    makeCall,
    hangUp,
    toggleMute,
    isReady,
    isConnecting,
    isOnCall,
    isMuted,
    callDuration,
    formattedDuration: formatDuration(callDuration),
    error,
  };
}
