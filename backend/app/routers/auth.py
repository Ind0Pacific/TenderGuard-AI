import os
import random
import re
from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/auth", tags=["Authentication & Twilio OTP"])

# In-memory store for OTPs (or SQLite backed)
otp_store: Dict[str, Dict] = {}

class SendOtpRequest(BaseModel):
    phoneNumber: str = Field(..., description="E.164 or 10-digit mobile number")

class VerifyOtpRequest(BaseModel):
    phoneNumber: str = Field(..., description="Mobile number")
    otp: str = Field(..., description="6-digit verification code")

def normalize_phone(phone: str) -> Optional[str]:
    cleaned = re.sub(r"\D", "", phone)
    if len(cleaned) == 10 and cleaned[0] in "6789":
        return f"+91{cleaned}"
    elif len(cleaned) == 12 and cleaned.startswith("91") and cleaned[2] in "6789":
        return f"+{cleaned}"
    elif 11 <= len(cleaned) <= 15:
        return f"+{cleaned}"
    return None

def trigger_twilio_sms(to_number: str, otp_code: str) -> Dict:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    from_number = os.getenv("TWILIO_PHONE_NUMBER", "").strip()
    verify_service_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID", "").strip()

    if account_sid and auth_token and not account_sid.startswith("your_"):
        try:
            from twilio.rest import Client
            client = Client(account_sid, auth_token)

            # Option A: Twilio Verify Service
            if verify_service_sid and verify_service_sid.startswith("VA"):
                verification = client.verify.v2.services(verify_service_sid).verifications.create(
                    to=to_number, channel="sms"
                )
                return {"mode": "TWILIO_VERIFY_API", "sid": verification.sid, "status": "sent"}

            # Option B: Direct Twilio Programmable SMS
            if from_number:
                body = f"[TenderGuard AI] Your statutory tender login verification OTP is: {otp_code}. Valid for 10 minutes."
                message = client.messages.create(
                    body=body,
                    from_=from_number,
                    to=to_number
                )
                return {"mode": "TWILIO_SMS", "sid": message.sid, "status": "sent"}
        except Exception as e:
            print(f"[Twilio Python Error]: {e}")

    # Fallback Simulation when Twilio credentials are in configuration
    print(f"\n📲 [TWILIO SMS GATEWAY (Python)] Dispatched OTP [{otp_code}] to {to_number}")
    return {"mode": "SIMULATED", "status": "sent"}

@router.post("/send-otp")
def send_otp(request: SendOtpRequest):
    normalized = normalize_phone(request.phoneNumber)
    if not normalized:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid 10-digit mobile number."
        )

    # Generate 6-digit random code
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Store OTP
    otp_store[normalized] = {
        "code": code,
        "expires_at": expires_at,
        "attempts": 0
    }

    # Dispatch via Twilio
    dispatch_res = trigger_twilio_sms(normalized, code)

    return {
        "success": True,
        "message": f"Verification code sent to {normalized}",
        "phoneNumber": normalized,
        "deliveryMode": dispatch_res.get("mode"),
        "realOtp": code,
        "expiresInSeconds": 600
    }

@router.post("/verify-otp")
def verify_otp(request: VerifyOtpRequest):
    normalized = normalize_phone(request.phoneNumber)
    if not normalized:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mobile number format."
        )

    clean_otp = str(request.otp).strip()

    # Twilio Verify API check if active
    verify_service_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID", "").strip()
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()

    is_verified = False

    if verify_service_sid and account_sid and auth_token and not account_sid.startswith("your_"):
        try:
            from twilio.rest import Client
            client = Client(account_sid, auth_token)
            check = client.verify.v2.services(verify_service_sid).verification_checks.create(
                to=normalized, code=clean_otp
            )
            if check.status == "approved":
                is_verified = True
        except Exception:
            pass

    # Check local OTP store or dev bypass 123456
    stored = otp_store.get(normalized)
    if not is_verified and stored:
        if datetime.utcnow() > stored["expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="OTP has expired (10 minute limit). Please request a new code."
            )
        if stored["code"] == clean_otp or clean_otp == "123456":
            is_verified = True
            otp_store.pop(normalized, None)
    elif not is_verified and clean_otp == "123456":
        is_verified = True

    if not is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP code. Please enter the exact 6-digit code sent to your phone number."
        )

    return {
        "success": True,
        "message": "Authenticated successfully",
        "vendor": {
            "phoneNumber": normalized,
            "status": "AUTHENTICATED"
        },
        "redirectTo": "/dashboard"
    }
