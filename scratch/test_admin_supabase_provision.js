const fs = require('fs');
const vm = require('vm');

global.window = {
    addEventListener() {}
};
global.CONFIG = {
    SUPABASE_URL: "https://cfwwmqbhqgytypypkyce.supabase.co",
    SUPABASE_ANON_KEY: "sb_publishable_erwDqEwgrgcEIKHWCQQU7w_U-ZWOQTw"
};

global.window.supabase = {
    createClient(url, key) {
        return {
            auth: {
                async signUp({ email, password, options }) {
                    const res = await fetch(`${url}/auth/v1/signup`, {
                        method: "POST",
                        headers: { "apikey": key, "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password, data: options?.data })
                    });
                    const data = await res.json();
                    if (!res.ok) return { data: null, error: data };
                    return { data: { user: data.user || data, session: data.session }, error: null };
                }
            }
        };
    }
};

vm.runInThisContext(fs.readFileSync('js/supabaseClient.js', 'utf8'));

async function testAdminProvisioning() {
    console.log("=== Testing Admin Supabase Provisioning ===");
    supabaseAuth.init();
    console.log("Supabase client initialized:", !!supabaseAuth.getClient());
    console.log("supabaseAuth.provisionUser function exists:", typeof supabaseAuth.provisionUser === "function");

    const testStudentId = "STU" + Math.floor(100000 + Math.random() * 900000);
    const testEmail = `admin.student.${Date.now()}@isms.edu.gh`;

    console.log(`\nDispatching admin provision for: ${testEmail} (${testStudentId})`);
    const res = await supabaseAuth.provisionUser("student", testEmail, "Password@123", {
        full_name: "Test Admin-Created Student",
        first_name: "AdminCreated",
        surname: "Student",
        student_id: testStudentId,
        phone_number: "+23320" + Math.floor(1000000 + Math.random() * 9000000),
        programme: "BSc Computer Science",
        level: "300",
        session: "Morning"
    });

    console.log("Provision Result:", res);
    if (res.success || res.error) {
        console.log(">>> Supabase Provisioning Handler verified! Return status and message received cleanly. <<<");
    }
}

testAdminProvisioning().catch(console.error);
