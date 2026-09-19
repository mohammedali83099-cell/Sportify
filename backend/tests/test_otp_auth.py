import unittest
import asyncio
from services.otp_service import otp_service
from services.email_service import email_service


class TestOTPService(unittest.TestCase):
    def setUp(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

    def tearDown(self):
        self.loop.close()

    def test_generate_code_format(self):
        code = otp_service.generate_code()
        self.assertEqual(len(code), 6)
        self.assertTrue(code.isdigit())
        self.assertTrue(100000 <= int(code) <= 999999)

    def test_otp_store_and_verify_success(self):
        async def run_test():
            email = "test.athlete@sportify.app"
            purpose = "registration"
            code = "849201"

            # Store OTP
            await otp_service.store_otp(email, purpose, code)

            # Verify OTP
            is_valid, msg = await otp_service.verify_otp(email, purpose, code)
            self.assertTrue(is_valid)
            self.assertIn("successful", msg.lower())

            # Replay attempt must fail (code was consumed)
            replay_valid, replay_msg = await otp_service.verify_otp(email, purpose, code)
            self.assertFalse(replay_valid)

        self.loop.run_until_complete(run_test())

    def test_otp_incorrect_code_and_brute_force_lockout(self):
        async def run_test():
            email = "bruteforce.test@sportify.app"
            purpose = "login"
            code = "123456"

            await otp_service.store_otp(email, purpose, code)

            # 4 failed attempts
            for i in range(1, 5):
                is_valid, msg = await otp_service.verify_otp(email, purpose, "000000")
                self.assertFalse(is_valid)
                self.assertIn("remaining", msg.lower())

            # 5th failed attempt should invalidate the OTP
            is_valid, msg = await otp_service.verify_otp(email, purpose, "000000")
            self.assertFalse(is_valid)
            self.assertIn("too many failed attempts", msg.lower())

            # Even entering the correct code now should fail
            is_valid, msg = await otp_service.verify_otp(email, purpose, code)
            self.assertFalse(is_valid)

        self.loop.run_until_complete(run_test())

    def test_email_service_fallback(self):
        async def run_test():
            # Test that local dev fallback prints cleanly without exception
            success = await email_service.send_otp("dev.test@sportify.app", "654321", "registration")
            self.assertTrue(success)

        self.loop.run_until_complete(run_test())


if __name__ == "__main__":
    unittest.main()
