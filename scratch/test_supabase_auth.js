const SUPABASE_URL = "https://cfwwmqbhqgytypypkyce.supabase.co";
const ANON_KEY = "sb_publishable_erwDqEwgrgcEIKHWCQQU7w_U-ZWOQTw";

async function testSupabaseAuth() {
    console.log("=== 1. Testing Supabase Auth Signup ===");
    const testEmail = `student.test.${Date.now()}@isms.edu.gh`;
    const testPassword = "Password@2026!";
    const testStudentId = "STU" + Math.floor(100000 + Math.random() * 900000);

    const signupBody = {
        email: testEmail,
        password: testPassword,
        data: {
            role: "student",
            full_name: "Kofi Test Student",
            first_name: "Kofi",
            surname: "Student",
            phone_number: "+23324" + Math.floor(1000000 + Math.random() * 9000000),
            student_id: testStudentId,
            programme: "BSc Computer Science",
            level: "100",
            session: "Morning"
        }
    };

    const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
            "apikey": ANON_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(signupBody)
    });

    const signupData = await signupRes.json();
    console.log("Signup Status:", signupRes.status);
    console.log("Signup User ID:", signupData.id || (signupData.user && signupData.user.id));

    if (!signupRes.ok) {
        console.error("Signup failed:", signupData);
        return;
    }

    const userId = signupData.id || (signupData.user && signupData.user.id);

    console.log("\n=== 2. Verifying Automatic Trigger in profiles & students ===");

    const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
        headers: {
            "apikey": ANON_KEY,
            "Authorization": `Bearer ${ANON_KEY}`
        }
    });
    const profData = await profRes.json();
    console.log("Profile row created by trigger:", JSON.stringify(profData, null, 2));


    const stuRes = await fetch(`${SUPABASE_URL}/rest/v1/students?profile_id=eq.${userId}`, {
        headers: {
            "apikey": ANON_KEY,
            "Authorization": `Bearer ${ANON_KEY}`
        }
    });
    const stuData = await stuRes.json();
    console.log("Student row created by trigger:", JSON.stringify(stuData, null, 2));

    console.log("\n=== 3. Testing Supabase Auth Sign In (Password Grant) ===");
    const signinRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
            "apikey": ANON_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: testEmail,
            password: testPassword
        })
    });

    const signinData = await signinRes.json();
    console.log("Signin Status:", signinRes.status);
    if (signinRes.ok) {
        console.log("Signin SUCCESS! Access token received for user:", signinData.user ? signinData.user.id : "OK");
    } else {
        console.log("Signin Response (e.g. if email confirmation is required):", signinData);
    }
}

testSupabaseAuth().catch(console.error);
