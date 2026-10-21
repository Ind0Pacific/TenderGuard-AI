import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import twilio from 'twilio';
import { getTwilioConfig } from '@/lib/twilioClient';

const envFilePath = path.join(process.cwd(), '.env');

export async function GET() {
  const cfg = getTwilioConfig();

  return NextResponse.json({
    isConfigured: cfg.isConfigured,
    authMode: cfg.authMode,
    accountSidMasked: cfg.accountSid ? `${cfg.accountSid.slice(0, 6)}...${cfg.accountSid.slice(-4)}` : '',
    apiKeySidMasked: cfg.apiKeySid ? `${cfg.apiKeySid.slice(0, 6)}...${cfg.apiKeySid.slice(-4)}` : '',
    fromNumber: cfg.fromNumber || '',
    messagingServiceSid: cfg.messagingServiceSid || '',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      accountSid: rawAccountSid,
      authToken,
      apiKeySid: rawApiKeySid,
      apiKeySecret,
      fromNumber,
      messagingServiceSid,
      verifyServiceSid,
    } = body;

    const accountSid = rawAccountSid?.trim() || '';
    const apiKeySid = rawApiKeySid?.trim() || '';

    // Handle user passing SK... into Account SID field
    if (accountSid.startsWith('SK') && !apiKeySid) {
      return NextResponse.json(
        {
          error:
            'You entered an API Key SID (starts with "SK"). Twilio API Keys require: (1) API Key SID, (2) API Secret, and (3) your main Account SID (starts with "AC", found on your Twilio Console home page). Alternatively, simply enter your primary Account SID (AC...) and Auth Token.',
          isApiKeyDetected: true,
          detectedApiKey: accountSid,
        },
        { status: 400 }
      );
    }

    let client: twilio.Twilio;

    // Mode A: API Key SID (SK...) + API Secret + Account SID (AC...)
    if ((apiKeySid.startsWith('SK') || accountSid.startsWith('SK')) && apiKeySecret && accountSid.startsWith('AC')) {
      const activeKeySid = apiKeySid || accountSid;
      try {
        client = twilio(activeKeySid, apiKeySecret.trim(), { accountSid: accountSid.trim() });
        await client.api.v2010.accounts(accountSid.trim()).fetch();
      } catch (twErr: any) {
        return NextResponse.json(
          { error: `Twilio API Key authentication failed: ${twErr.message || 'Invalid Secret or Account SID'}` },
          { status: 401 }
        );
      }

      process.env.TWILIO_API_KEY_SID = activeKeySid;
      process.env.TWILIO_API_KEY_SECRET = apiKeySecret.trim();
      process.env.TWILIO_ACCOUNT_SID = accountSid.trim();
    }
    // Mode B: Standard Account SID (AC...) + Auth Token
    else if (accountSid && authToken) {
      if (!accountSid.startsWith('AC')) {
        return NextResponse.json(
          { error: 'Invalid Twilio Account SID. The primary Account SID must start with "AC". Check your Twilio Console home page.' },
          { status: 400 }
        );
      }

      try {
        client = twilio(accountSid.trim(), authToken.trim());
        await client.api.v2010.accounts(accountSid.trim()).fetch();
      } catch (twErr: any) {
        return NextResponse.json(
          { error: `Twilio authentication failed: ${twErr.message || 'Invalid Account SID or Auth Token'}` },
          { status: 401 }
        );
      }

      process.env.TWILIO_ACCOUNT_SID = accountSid.trim();
      process.env.TWILIO_AUTH_TOKEN = authToken.trim();
    } else {
      return NextResponse.json(
        { error: 'Twilio Account SID (starts with "AC") and Auth Token are required.' },
        { status: 400 }
      );
    }

    if (fromNumber) process.env.TWILIO_PHONE_NUMBER = fromNumber.trim();
    if (messagingServiceSid) process.env.TWILIO_MESSAGING_SERVICE_SID = messagingServiceSid.trim();
    if (verifyServiceSid) process.env.TWILIO_VERIFY_SERVICE_SID = verifyServiceSid.trim();

    // Persist to .env file
    if (fs.existsSync(envFilePath)) {
      let envContent = fs.readFileSync(envFilePath, 'utf-8');

      const updateOrAdd = (key: string, val: string) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}="${val}"`);
        } else {
          envContent += `\n${key}="${val}"`;
        }
      };

      if (process.env.TWILIO_ACCOUNT_SID) updateOrAdd('TWILIO_ACCOUNT_SID', process.env.TWILIO_ACCOUNT_SID);
      if (process.env.TWILIO_AUTH_TOKEN) updateOrAdd('TWILIO_AUTH_TOKEN', process.env.TWILIO_AUTH_TOKEN);
      if (process.env.TWILIO_API_KEY_SID) updateOrAdd('TWILIO_API_KEY_SID', process.env.TWILIO_API_KEY_SID);
      if (process.env.TWILIO_API_KEY_SECRET) updateOrAdd('TWILIO_API_KEY_SECRET', process.env.TWILIO_API_KEY_SECRET);
      if (fromNumber) updateOrAdd('TWILIO_PHONE_NUMBER', fromNumber.trim());
      if (messagingServiceSid) updateOrAdd('TWILIO_MESSAGING_SERVICE_SID', messagingServiceSid.trim());
      if (verifyServiceSid) updateOrAdd('TWILIO_VERIFY_SERVICE_SID', verifyServiceSid.trim());

      fs.writeFileSync(envFilePath, envContent, 'utf-8');
    }

    return NextResponse.json({
      success: true,
      message: 'Twilio credentials verified and connected! Live SMS is now active.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update Twilio configuration' },
      { status: 500 }
    );
  }
}
