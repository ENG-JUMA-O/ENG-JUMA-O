
import "dotenv/config";
import sendSms from "../src/services/sms/sms.service.js";

const mobile = process.env.TEST_SMS_MOBILE;
const message =
  process.env.TEST_SMS_MESSAGE ||
  "Hello! This is a test from my SMS API.";

if (!mobile) {
  console.error("ERROR: TEST_SMS_MOBILE is missing from .env");
  process.exit(1);
}

try {
  console.log("Sending test SMS...");
  console.log(`Recipient: ${mobile}`);

  const result = await sendSms({ mobile, message });

  console.log("\nSMS API response:");
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("\nSMS test failed:", error.message);

  if (error.providerCode) {
    console.error("Mobitech status code:", error.providerCode);
  }

  process.exitCode = 1;
}
