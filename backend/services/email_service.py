import os
import logging
import httpx
from typing import Optional
from config import settings

logger = logging.getLogger("sportify.email")


def _generate_otp_html(otp_code: str, purpose: str = "registration") -> str:
    action_text = (
        "complete your athlete registration"
        if purpose == "registration"
        else "sign in to your athlete account"
    )
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sportify Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07080C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F1F5F9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #07080C; min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #0C0E14; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.03em; color: #FFFFFF; text-transform: uppercase;">
                SPORT<span style="color: #10B981;">IFY</span>
              </span>
              <p style="margin: 6px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #64748B;">
                Athletic Intelligence & Biomechanics
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.02em;">
                Your Verification Code
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94A3B8;">
                Use the one-time code below to {action_text}. This code will expire in <strong>{settings.OTP_EXPIRE_MINUTES} minutes</strong>.
              </p>

              <!-- OTP Code Display -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #11141C; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 12px; padding: 20px;">
                    <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 36px; font-weight: 800; letter-spacing: 0.28em; color: #38BDF8; display: inline-block; padding-left: 0.28em;">
                      {otp_code}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 12px; line-height: 1.5; color: #64748B;">
                If you did not request this verification code, please ignore this email. Never share your one-time password with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #080A0F; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; Sportify Development Platform &bull; Train for what your game demands.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


class EmailService:
    """
    Lightweight, asynchronous transactional email service.
    Integrates directly with the Resend HTTPS REST API using httpx with zero heavy SDK bloat.
    Gracefully falls back to formatted terminal output for frictionless local development.
    """

    @staticmethod
    async def send_otp(to_email: str, otp_code: str, purpose: str = "registration") -> bool:
        subject = (
            f"Sportify Registration Code: {otp_code}"
            if purpose == "registration"
            else f"Sportify Sign-In Code: {otp_code}"
        )
        html_content = _generate_otp_html(otp_code, purpose)

        resend_key = (settings.RESEND_API_KEY or os.getenv("RESEND_API_KEY", "")).strip()
        from_email = (settings.EMAIL_FROM or os.getenv("EMAIL_FROM", "Sportify <onboarding@resend.dev>")).strip()

        if resend_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(
                        "https://api.resend.com/emails",
                        headers={
                            "Authorization": f"Bearer {resend_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "from": from_email,
                            "to": [to_email],
                            "subject": subject,
                            "html": html_content,
                        },
                    )
                    if response.status_code in (200, 201):
                        logger.info(f"Successfully sent OTP email to {to_email} via Resend")
                        print(
                            f"\n[RESEND SUCCESS] Successfully dispatched OTP email to {to_email} via Resend API (HTTP {response.status_code}).\n",
                            flush=True,
                        )
                        return True
                    else:
                        error_msg = f"Resend API rejected dispatch (HTTP {response.status_code}): {response.text}"
                        logger.error(error_msg)
                        print(f"\n[RESEND ERROR] {error_msg}\n", flush=True)
            except Exception as e:
                logger.error(f"Failed to dispatch email via Resend API: {e}")
                print(f"\n[RESEND EXCEPTION] {e}\n", flush=True)

        # Local development / fallback terminal display
        print(
            "\n" + "=" * 62 + "\n"
            " [SPORTIFY AUTH OTP DISPATCHER - LOCAL DEV CONSOLE]\n"
            f" Target Email : {to_email}\n"
            f" Purpose      : {purpose.upper()}\n"
            f" >>> 6-DIGIT OTP CODE : {otp_code} <<< (Valid for {settings.OTP_EXPIRE_MINUTES} min)\n"
            + "=" * 62 + "\n",
            flush=True,
        )
        logger.info(f"[DEV CONSOLE] OTP for {to_email}: {otp_code}")
        return True


email_service = EmailService()
