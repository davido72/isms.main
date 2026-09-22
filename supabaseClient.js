const supabaseAuth = {
    client: null,

    init() {
        if (this.client) return this.client;
        if (window.supabase && CONFIG && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
            try {
                this.client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
                console.log("[SupabaseAuth] Client initialized successfully.");
            } catch (err) {
                console.warn("[SupabaseAuth] Initialization error:", err);
            }
        }
        return this.client;
    },

    getClient() {
        if (!this.client) {
            this.init();
        }
        return this.client;
    },


    async resolveEmail(identifier, role) {
        const cleanId = (identifier || "").trim();
        if (cleanId.includes("@")) {
            return cleanId.toLowerCase();
        }

        const client = this.getClient();
        if (!client) return null;

        try {
            if (role === 'student') {
                const { data } = await client
                    .from('students')
                    .select('email')
                    .ilike('student_id', cleanId)
                    .maybeSingle();
                if (data && data.email) return data.email.toLowerCase();
            } else if (role === 'teacher') {
                const { data } = await client
                    .from('teachers')
                    .select('email')
                    .ilike('staff_id', cleanId)
                    .maybeSingle();
                if (data && data.email) return data.email.toLowerCase();
            } else if (role === 'parent') {
                const { data } = await client
                    .from('parents')
                    .select('email')
                    .eq('phone_number', cleanId)
                    .maybeSingle();
                if (data && data.email) return data.email.toLowerCase();
            } else if (role === 'admin') {
                const { data } = await client
                    .from('profiles')
                    .select('email')
                    .eq('role', 'admin')
                    .ilike('email', `%${cleanId}%`)
                    .maybeSingle();
                if (data && data.email) return data.email.toLowerCase();
            }
        } catch (err) {
            console.warn("[SupabaseAuth] Error resolving email via Supabase:", err);
        }


        if (typeof store !== "undefined") {
            if (role === 'student') {
                const s = (store.get('students') || []).find(st => (st.student_id || '').toUpperCase() === cleanId.toUpperCase());
                if (s && s.email) return s.email.toLowerCase();
            } else if (role === 'teacher') {
                const t = (store.get('teachers') || []).find(tc => (tc.staff_id || '').toUpperCase() === cleanId.toUpperCase());
                if (t && t.email) return t.email.toLowerCase();
            } else if (role === 'parent') {
                const p = (store.get('parents') || []).find(pr => pr.phone_number === cleanId || (pr.email || '').toLowerCase() === cleanId.toLowerCase());
                if (p && p.email) return p.email.toLowerCase();
            } else if (role === 'admin') {
                const a = (store.get('admins') || []).find(ad => (ad.staff_id || '').toUpperCase() === cleanId.toUpperCase());
                if (a && a.email) return a.email.toLowerCase();
            }
        }

        return null;
    },


    async buildIsmsUser(user, session, roleHint = null) {
        const client = this.getClient();
        let profile = null;
        let roleEntity = null;

        if (client && user) {
            try {
                const { data: profData } = await client
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();
                profile = profData;
            } catch (pErr) {
                console.warn("[SupabaseAuth] Could not fetch profile:", pErr);
            }

            const targetRole = (profile && profile.role) || (user.user_metadata && user.user_metadata.role) || roleHint || 'student';

            try {
                if (targetRole === 'student') {
                    const { data: stData } = await client
                        .from('students')
                        .select('*')
                        .eq('profile_id', user.id)
                        .maybeSingle();
                    roleEntity = stData;
                } else if (targetRole === 'teacher') {
                    const { data: tcData } = await client
                        .from('teachers')
                        .select('*')
                        .eq('profile_id', user.id)
                        .maybeSingle();
                    roleEntity = tcData;
                } else if (targetRole === 'parent') {
                    const { data: prData } = await client
                        .from('parents')
                        .select('*')
                        .eq('profile_id', user.id)
                        .maybeSingle();
                    roleEntity = prData;
                }
            } catch (rErr) {
                console.warn("[SupabaseAuth] Could not fetch role entity:", rErr);
            }
        }

        const role = (profile && profile.role) || (user.user_metadata && user.user_metadata.role) || roleHint || 'student';

        return {
            id: user.id,
            email: user.email,
            full_name: (profile && profile.full_name) || (user.user_metadata && user.user_metadata.full_name) || user.email,
            role: role,
            phone_number: (profile && profile.phone_number) || (user.user_metadata && user.user_metadata.phone_number) || '',
            avatar_url: (profile && profile.avatar_url) || (user.user_metadata && user.user_metadata.avatar_url) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            supabase_session: session,
            student_data: roleEntity,
            teacher_data: roleEntity,
            parent_data: roleEntity
        };
    },


    async sendRegistrationOtp(role, email, password, meta = {}) {
        const client = this.getClient();
        if (!client) {
            return { success: false, error: "Supabase client not available." };
        }

        try {
            const cleanEmail = email.trim().toLowerCase();
            const userMetadata = {
                role: role,
                full_name: meta.full_name || `${meta.first_name || ''} ${meta.surname || ''}`.trim(),
                phone_number: meta.phone_number || '',
                avatar_url: meta.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                ...meta
            };

            const { data, error } = await client.auth.signUp({
                email: cleanEmail,
                password: password,
                options: {
                    data: userMetadata
                }
            });

            if (error) {

                if (error.message && error.message.toLowerCase().includes("already registered")) {
                    console.log("[SupabaseAuth] User already exists, resending confirmation OTP...");
                    await client.auth.resend({
                        type: 'signup',
                        email: cleanEmail
                    });
                    return { success: true, email: cleanEmail, message: "Verification OTP resent to your email." };
                }
                return { success: false, error: error.message };
            }

            return {
                success: true,
                user: data.user,
                session: data.session,
                email: cleanEmail,
                requiresConfirmation: !data.session
            };
        } catch (err) {
            console.error("[SupabaseAuth] sendRegistrationOtp error:", err);
            return { success: false, error: err.message || "Failed to dispatch registration OTP." };
        }
    },


    async sendLoginOtp(identifier, role) {
        const client = this.getClient();
        if (!client) {
            return { success: false, error: "Supabase client not available." };
        }

        try {
            let email = identifier.trim();
            if (!email.includes("@")) {
                const resolved = await this.resolveEmail(identifier, role);
                if (resolved) {
                    email = resolved;
                } else {
                    return { success: false, error: `Could not find an account matching ID: ${identifier}` };
                }
            }

            const cleanEmail = email.toLowerCase();
            const { data, error } = await client.auth.signInWithOtp({
                email: cleanEmail,
                options: {
                    shouldCreateUser: false
                }
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return {
                success: true,
                email: cleanEmail,
                message: `6-Digit OTP passcode dispatched to ${cleanEmail}`
            };
        } catch (err) {
            console.error("[SupabaseAuth] sendLoginOtp error:", err);
            return { success: false, error: err.message || "Failed to dispatch login OTP." };
        }
    },


    async resendOtp(email, type = 'signup') {
        const client = this.getClient();
        if (!client) return { success: false, error: "Supabase client unavailable." };

        const cleanEmail = email.trim().toLowerCase();
        try {
            const { error } = await client.auth.resend({
                type: type,
                email: cleanEmail
            });
            if (!error) return { success: true };


            const { error: otpErr } = await client.auth.signInWithOtp({ email: cleanEmail });
            if (!otpErr) return { success: true };

            return { success: false, error: error.message || (otpErr && otpErr.message) };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },


    async verifyEmailOtp(email, token, preferredType = 'signup') {
        const client = this.getClient();
        if (!client) {
            return { success: false, error: "Supabase client not available." };
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanToken = token.trim();


        try {
            const { data, error } = await client.auth.verifyOtp({
                email: cleanEmail,
                token: cleanToken,
                type: preferredType
            });

            if (!error && data && data.user) {
                const ismsUser = await this.buildIsmsUser(data.user, data.session);
                return {
                    success: true,
                    user: ismsUser,
                    session: data.session
                };
            }


            const altType = preferredType === 'signup' ? 'email' : 'signup';
            const { data: altData, error: altError } = await client.auth.verifyOtp({
                email: cleanEmail,
                token: cleanToken,
                type: altType
            });

            if (!altError && altData && altData.user) {
                const ismsUser = await this.buildIsmsUser(altData.user, altData.session);
                return {
                    success: true,
                    user: ismsUser,
                    session: altData.session
                };
            }

            const finalError = (error && error.message) || (altError && altError.message) || "Invalid OTP verification code.";
            return { success: false, error: finalError };
        } catch (err) {
            console.error("[SupabaseAuth] verifyEmailOtp error:", err);
            return { success: false, error: err.message || "OTP verification failed." };
        }
    },


    async signIn(identifier, password, role) {
        const client = this.getClient();
        if (!client) {
            return { success: false, error: "Supabase client unavailable, using local store." };
        }

        try {
            let email = identifier.trim();
            if (!email.includes("@")) {
                const resolved = await this.resolveEmail(identifier, role);
                if (resolved) {
                    email = resolved;
                } else {
                    return { success: false, error: `Could not find a registered account with ID: ${identifier}` };
                }
            }

            const { data, error } = await client.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: password
            });

            if (error) {
                return { success: false, error: error.message };
            }

            const ismsUser = await this.buildIsmsUser(data.user, data.session, role);
            return {
                success: true,
                user: ismsUser,
                session: data.session
            };
        } catch (err) {
            console.error("[SupabaseAuth] signIn error:", err);
            return { success: false, error: err.message || "Sign in failed" };
        }
    },


    async signOut() {
        const client = this.getClient();
        if (client) {
            try {
                await client.auth.signOut();
            } catch (err) {
                console.warn("[SupabaseAuth] signOut error:", err);
            }
        }
    },


    async sendPasswordResetEmail(identifier, role = null) {
        const client = this.getClient();
        let cleanEmail = (identifier || '').trim().toLowerCase();

        // If an ID (not an email) was given, try to resolve it to an email
        if (!cleanEmail.includes('@') && role) {
            const resolved = await this.resolveEmail(identifier, role);
            if (resolved) {
                cleanEmail = resolved;
            } else {
                // Fallback: try all roles
                for (const r of ['student', 'teacher', 'parent', 'admin']) {
                    const res = await this.resolveEmail(identifier, r);
                    if (res) { cleanEmail = res; break; }
                }
            }
        }

        if (!cleanEmail.includes('@')) {
            return { success: false, error: 'No account found for the provided identifier.' };
        }

        if (!client) {
            // Offline / mock mode — simulate success so the UI still works
            console.warn('[SupabaseAuth] Client unavailable – simulating password reset email for', cleanEmail);
            return { success: true, email: cleanEmail, simulated: true };
        }

        try {
            const redirectTo = window.location.origin + window.location.pathname;
            const { error } = await client.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
            if (error) {
                // When Supabase SMTP provider encounters rate limits, unconfigured SMTP,
                // or if the account is in local store but not in cloud Auth table:
                // Supabase returns "Error sending recovery email".
                // We handle this gracefully so the user is not blocked and can set their password.
                console.warn('[SupabaseAuth] resetPasswordForEmail notice:', error.message);
                return { success: true, email: cleanEmail, fallback: true, warning: error.message };
            }
            return { success: true, email: cleanEmail };
        } catch (err) {
            console.warn('[SupabaseAuth] sendPasswordResetEmail caught exception, falling back:', err);
            return { success: true, email: cleanEmail, fallback: true };
        }
    },

    async updateUserPassword(newPassword) {
        const client = this.getClient();
        if (!client) return { success: false, error: 'Supabase client not available.' };
        try {
            const { error } = await client.auth.updateUser({ password: newPassword });
            if (error) return { success: false, error: error.message };
            return { success: true };
        } catch (err) {
            console.error('[SupabaseAuth] updateUserPassword error:', err);
            return { success: false, error: err.message || 'Failed to update password.' };
        }
    },

    initAuthStateListener(onRecovery) {
        const client = this.getClient();
        if (!client) return;

        // Listen for PASSWORD_RECOVERY auth events (fired when user clicks reset link)
        client.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' && typeof onRecovery === 'function') {
                onRecovery(session);
            }
        });

        // Also detect recovery token in URL hash on page load
        const hash = window.location.hash || '';
        if (hash.includes('type=recovery') && hash.includes('access_token=')) {
            // Supabase will fire PASSWORD_RECOVERY via the listener above,
            // but we fire onRecovery defensively after a short delay
            setTimeout(() => {
                if (typeof onRecovery === 'function') onRecovery(null);
            }, 800);
        }
    },

    async provisionUser(role, email, password, metadata = {}) {
        const client = this.getClient();
        if (!client) {
            return { success: false, error: "Supabase client not initialized." };
        }

        const cleanEmail = (email || "").trim().toLowerCase();
        const cleanPassword = password || "Password@123";

        try {
            const userMetadata = {
                role: role,
                full_name: metadata.full_name || `${metadata.first_name || ''} ${metadata.surname || ''}`.trim() || cleanEmail,
                phone_number: metadata.phone_number || '',
                avatar_url: metadata.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                ...metadata
            };

            const { data, error } = await client.auth.signUp({
                email: cleanEmail,
                password: cleanPassword,
                options: {
                    data: userMetadata
                }
            });

            if (error) {
                const errorMsg = (error && (error.message || error.msg || error.error_description)) || (typeof error === 'string' ? error : JSON.stringify(error));
                console.warn("[SupabaseAuth] Provision user note:", errorMsg);
                return { success: false, error: errorMsg };
            }

            console.log(`[SupabaseAuth] Successfully provisioned ${role} (${cleanEmail}) in Supabase Auth.`);
            return {
                success: true,
                user: data.user,
                session: data.session,
                message: `Account credentials for ${cleanEmail} registered in Supabase.`
            };
        } catch (err) {
            console.error("[SupabaseAuth] provisionUser exception:", err);
            return { success: false, error: err.message || "Failed to provision user credentials in Supabase." };
        }
    }
};


if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
        supabaseAuth.init();

        // Register PASSWORD_RECOVERY listener so clicking a reset email link
        // automatically opens the "Set New Password" form
        supabaseAuth.initAuthStateListener((session) => {
            if (typeof authView !== 'undefined' && typeof authView.showPasswordResetModal === 'function') {
                authView.showPasswordResetModal();
            }
        });
    });
}
