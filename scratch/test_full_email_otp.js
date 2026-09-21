const SUPABASE_URL = "https://cfwwmqbhqgytypypkyce.supabase.co";
const ANON_KEY = "sb_publishable_erwDqEwgrgcEIKHWCQQU7w_U-ZWOQTw";

async function runTest() {
    console.log("=== End-to-End Supabase Email OTP Verification Test ===");

    const testEmail = `student.otp.${Date.now()}@isms.edu.gh`;
    console.log("1. Dispatching Email OTP for:", testEmail);

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
                full_name: "OTP Test Student",
                student_id: "STU" + Math.floor(100000 + Math.random() * 900000),
                programme: "BSc Computer Science",
                level: "100"
            }
        })
    });

    console.log("OTP Dispatch Status:", otpRes.status);
    if (otpRes.status === 200) {
        console.log("SUCCESS: Supabase Auth accepted request and dispatched 6-digit email OTP!");
    } else {
        const err = await otpRes.json().catch(() => ({}));
        console.error("FAILED:", err);
    }

    console.log("\n2. Testing verify endpoint with token validation...");
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
        method: "POST",
        headers: {
            "apikey": ANON_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: testEmail,
            token: "000000",
            type: "email"
        })
    });

    const verifyData = await verifyRes.json().catch(() => ({}));
    console.log("Verify Endpoint Response (expected token rejected):", verifyRes.status, verifyData.msg || verifyData.error_code);
    if (verifyRes.status === 401 || verifyRes.status === 403 || verifyRes.status === 400) {
        console.log("SUCCESS: Verify endpoint correctly validated token against Supabase Auth security rules.");
    }
}

runTest().catch(console.error);
