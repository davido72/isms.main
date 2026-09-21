const SUPABASE_URL = "https://cfwwmqbhqgytypypkyce.supabase.co";
const ANON_KEY = "sb_publishable_erwDqEwgrgcEIKHWCQQU7w_U-ZWOQTw";

async function testResolve() {
    console.log("=== Testing Student ID lookup from Supabase ===");
    const res = await fetch(`${SUPABASE_URL}/rest/v1/students?student_id=eq.STU225091&select=email`, {
        headers: {
            "apikey": ANON_KEY,
            "Authorization": `Bearer ${ANON_KEY}`
        }
    });
    const data = await res.json();
    console.log("Found email by student_id STU225091:", data);
}

testResolve().catch(console.error);
