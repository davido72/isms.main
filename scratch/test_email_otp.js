const SUPABASE_URL = "https://cfwwmqbhqgytypypkyce.supabase.co";
const ANON_KEY = "sb_publishable_erwDqEwgrgcEIKHWCQQU7w_U-ZWOQTw";

async function testOtpEndpoints() {
    console.log("=== Testing Supabase Auth OTP capabilities ===");


    const testEmail = `dev.test.${Date.now()}@isms.edu.gh`;
    console.log("Testing signInWithOtp for:", testEmail);
    const otpRes = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
        method: "POST",
        headers: {
            "apikey": ANON_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: testEmail,
            create_user: true,
            data: {
                role: "student",
                full_name: "Test OTP Student"
            }
        })
    });
    console.log("OTP send status:", otpRes.status);
    const otpData = await otpRes.json().catch(() => ({}));
    console.log("OTP send response:", otpData);


    console.log("\nTesting verify endpoint structure (expecting 400 for invalid token)...");
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
        method: "POST",
        headers: {
            "apikey": ANON_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: testEmail,
            token: "123456",
            type: "email"
        })
    });
    console.log("Verify status with dummy token:", verifyRes.status);
    const verifyData = await verifyRes.json().catch(() => ({}));
    console.log("Verify response with dummy token:", verifyData);
}

testOtpEndpoints().catch(console.error);
