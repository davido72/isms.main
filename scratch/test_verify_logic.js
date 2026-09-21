const SUPABASE_URL = "https://cfwwmqbhqgytypypkyce.supabase.co";
const ANON_KEY = "sb_publishable_erwDqEwgrgcEIKHWCQQU7w_U-ZWOQTw";

async function testLogic() {
    const testEmail = `dev.verify.${Date.now()}@isms.edu.gh`;
    console.log("Sending OTP to:", testEmail);

    const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
        method: "POST",
        headers: {
            "apikey": ANON_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: testEmail,
            create_user: true
        })
    });
    console.log("Status:", res.status);
    const json = await res.json().catch(() => ({}));
    console.log("Response:", json);
}

testLogic().catch(console.error);
