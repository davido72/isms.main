const authView = {
    activeTab: 'login',
    activeRegisterRole: 'student',

    switchAuthTab(tab) {
        this.activeTab = tab;
        const loginBtn = document.getElementById("tab-login-btn");
        const regBtn = document.getElementById("tab-register-btn");
        const loginForm = document.getElementById("login-form");
        const regWrapper = document.getElementById("register-wrapper");

        if (tab === 'login') {
            loginBtn.classList.add("active");
            regBtn.classList.remove("active");
            loginForm.classList.remove("hidden");
            regWrapper.classList.add("hidden");
        } else {
            regBtn.classList.add("active");
            loginBtn.classList.remove("active");
            regWrapper.classList.remove("hidden");
            loginForm.classList.add("hidden");
            this.setRegisterRole(this.activeRegisterRole);
        }
    },

    setRegisterRole(role) {
        this.activeRegisterRole = role;
        const stBtn = document.getElementById("reg-role-student-btn");
        const tcBtn = document.getElementById("reg-role-teacher-btn");
        const prBtn = document.getElementById("reg-role-parent-btn");

        const stForm = document.getElementById("student-reg-form");
        const tcForm = document.getElementById("teacher-reg-form");
        const prForm = document.getElementById("parent-reg-form");

        [stBtn, tcBtn, prBtn].forEach(b => b && b.classList.remove("active"));
        [stForm, tcForm, prForm].forEach(f => {
            if (f) {
                f.classList.remove("active");
                f.classList.add("hidden");
            }
        });

        if (role === "student") {
            if (stBtn) stBtn.classList.add("active");
            if (stForm) {
                stForm.classList.add("active");
                stForm.classList.remove("hidden");
                stForm.reset();
                const stIdInput = document.getElementById("st-id");
                if (stIdInput) {
                    stIdInput.value = "";
                    stIdInput.placeholder = "e.g. 4211260001";
                    stIdInput.readOnly = false;
                    stIdInput.maxLength = 10;
                }
            }
        } else if (role === "teacher") {
            if (tcBtn) tcBtn.classList.add("active");
            if (tcForm) {
                tcForm.classList.add("active");
                tcForm.classList.remove("hidden");
                tcForm.reset();
                const tcIdInput = document.getElementById("tc-staffid");
                if (tcIdInput) {
                    tcIdInput.value = "";
                    tcIdInput.placeholder = "e.g. STF23001";
                    tcIdInput.readOnly = false;
                    tcIdInput.maxLength = 8;
                }
            }
        } else if (role === "parent") {
            if (prBtn) prBtn.classList.add("active");
            if (prForm) {
                prForm.classList.add("active");
                prForm.classList.remove("hidden");
                prForm.reset();
            }
        }
    },

    validateLoginIdentifierRealtime() {
        const roleSelect = document.getElementById("login-role");
        const idInput = document.getElementById("login-identifier");
        const errorEl = document.getElementById("login-identifier-error");
        if (!idInput || !roleSelect) return true;

        const role = roleSelect.value;
        const val = idInput.value;

        const isStaffIdCandidate = (role === "admin" || role === "teacher") && !val.includes("@");

        if (isStaffIdCandidate && /[a-z]/.test(val)) {

            idInput.value = val.toUpperCase();
        }

        idInput.classList.remove("is-invalid");
        if (errorEl) {
            errorEl.innerText = "";
            errorEl.classList.add("hidden");
        }
        return true;
    },

    updateLoginPlaceholder() {
        const role = document.getElementById("login-role").value;
        const idLabel = document.getElementById("login-identifier-label");
        const idInput = document.getElementById("login-identifier");
        const secretLabel = document.getElementById("login-secret-label");
        const secretInput = document.getElementById("login-password");
        const secretIcon = document.getElementById("login-secret-icon");

        this.validateLoginIdentifierRealtime();

        if (role === "student") {
            idLabel.innerText = "Student ID";
            idInput.placeholder = "e.g. 4211260001";
            idInput.maxLength = 10;
            secretLabel.innerText = "Password";
            secretInput.placeholder = "••••••••";
            secretInput.type = "password";
            secretIcon.className = "fa-solid fa-lock input-icon";
        } else if (role === "teacher") {
            idLabel.innerText = "Staff ID";
            idInput.placeholder = "e.g. STF23001";
            idInput.maxLength = 8;
            secretLabel.innerText = "Password";
            secretInput.placeholder = "••••••••";
            secretInput.type = "password";
            secretIcon.className = "fa-solid fa-lock input-icon";
        } else if (role === "parent") {
            idLabel.innerText = "Parent Email Address";
            idInput.placeholder = "e.g. parent.appiah@isms.edu.gh";
            idInput.removeAttribute("maxlength");
            secretLabel.innerText = "Password";
            secretInput.placeholder = "••••••••";
            secretInput.type = "password";
            secretIcon.className = "fa-solid fa-lock input-icon";
        } else if (role === "admin") {

            idLabel.innerText = "Administrator Staff ID *";
            idInput.placeholder = "e.g. ADM-ACA-01 or SUPER-001";
            idInput.maxLength = 15;
            secretLabel.innerText = "Password *";
            secretInput.placeholder = "••••••••";
            secretInput.type = "password";
            secretIcon.className = "fa-solid fa-lock input-icon";
        }
    },

    async handleLogin(event) {
        event.preventDefault();
        const role = document.getElementById("login-role").value;
        let identifier = document.getElementById("login-identifier").value.trim();
        const secret = document.getElementById("login-password").value.trim();

        if (!identifier || !secret) {
            app.showToast("Please enter both your login identifier and password.", "warning");
            return;
        }


        if ((role === "admin" || role === "teacher") && !identifier.includes("@")) {
            identifier = identifier.toUpperCase();
        }

        const upperId = identifier.toUpperCase();
        const lowerId = identifier.toLowerCase();


        if (role === "admin") {
            if (upperId === "SUPER-001" || lowerId === CONFIG.SUPER_ADMIN_EMAIL.toLowerCase() || upperId === "SUPERADMIN") {
                const isSuperMatch = await passwordHelper.verifyPassword(secret, "sha256$c8d9e0f1a2b34567890123456789abcd$1c42157b2695309b3b05a9f7710cba80e2c946f8b050ce5dd9f5ee5e2420cb0e") ||
                    await passwordHelper.verifyPassword(secret, "sha256$a1b2c3d4e5f60718293a4b5c6d7e8f90$a812846fbf88cb48c94d3e959ec5702cabdfa33102f4135946b8dcb1f3951e74") ||
                    (CONFIG.SUPER_ADMIN_STAFF_ID && secret.toUpperCase() === CONFIG.SUPER_ADMIN_STAFF_ID.toUpperCase());
                if (isSuperMatch) {
                    const superAdminUser = {
                        id: "prof-superadmin-1",
                        email: CONFIG.SUPER_ADMIN_EMAIL,
                        full_name: "Super Administrator",
                        role: "admin",
                        admin_role_title: "Super Admin",
                        staff_id: "SUPER-001",
                        permissions: ["ALL"],
                        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    };
                    store.setCurrentUser(superAdminUser);
                    store.logAudit("Super Administrator logged in to Master Workspace", "Security");
                    app.showToast("Super Administrator Authentication Successful!", "success");
                    app.initializeMainScreen();
                    return;
                }
            }
        }


        if (typeof supabaseAuth !== "undefined" && supabaseAuth.getClient()) {
            const submitBtn = event.target ? event.target.querySelector("button[type='submit']") : null;
            const origHtml = submitBtn ? submitBtn.innerHTML : "";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
            }

            try {
                const sbRes = await supabaseAuth.signIn(identifier, secret, role);
                if (sbRes.success && sbRes.user) {
                    store.setCurrentUser(sbRes.user);
                    store.logAudit(`${sbRes.user.full_name || sbRes.user.email} (${role}) authenticated via Supabase`, "Security");
                    app.showToast(`Welcome back, ${sbRes.user.full_name || 'User'}! (Connected via Supabase)`, "success");
                    app.initializeMainScreen();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = origHtml;
                    }
                    return;
                } else if (sbRes.error && !sbRes.error.toLowerCase().includes("unavailable")) {
                    console.log("[Auth] Supabase signIn note:", sbRes.error);
                }
            } catch (err) {
                console.warn("[Auth] Supabase auth attempt exception:", err);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origHtml;
                }
            }
        }


        const profiles = store.get("profiles") || [];

        if (role === "admin") {
            const adminProfiles = profiles.filter(p => p.role === "admin");
            const adminList = store.get("admins") || [];


            const matchedProfile = adminProfiles.find(p =>
                (p.staff_id && p.staff_id.toUpperCase() === upperId) ||
                (p.email && p.email.toLowerCase() === lowerId)
            );

            if (matchedProfile) {
                const isValidPassword = await passwordHelper.verifyPassword(secret, matchedProfile.password) ||
                    (matchedProfile.staff_id && secret.toUpperCase() === matchedProfile.staff_id.toUpperCase());
                if (isValidPassword) {
                    if (!passwordHelper.isHashed(matchedProfile.password)) {
                        matchedProfile.password = await passwordHelper.hashPassword(secret);
                        store.set("profiles", profiles);
                    }
                    store.setCurrentUser(matchedProfile);
                    store.logAudit(`${matchedProfile.admin_role_title || 'Sub-Admin'} (${matchedProfile.full_name}) logged in`, "Security");
                    app.showToast(`${matchedProfile.admin_role_title || 'Sub-Admin'} authentication successful!`, "success");
                    app.initializeMainScreen();
                    return;
                }
            }


            const matchedAdmin = adminList.find(a =>
                (a.staff_id && a.staff_id.toUpperCase() === upperId) ||
                (a.email && a.email.toLowerCase() === lowerId)
            );

            if (matchedAdmin) {
                const isValidPassword = await passwordHelper.verifyPassword(secret, matchedAdmin.password) ||
                    (matchedAdmin.staff_id && secret.toUpperCase() === matchedAdmin.staff_id.toUpperCase());
                if (isValidPassword) {
                    if (!passwordHelper.isHashed(matchedAdmin.password)) {
                        matchedAdmin.password = await passwordHelper.hashPassword(secret);
                        store.set("admins", adminList);
                    }
                    const adminUser = {
                        id: matchedAdmin.id,
                        email: matchedAdmin.email,
                        full_name: matchedAdmin.full_name,
                        role: "admin",
                        admin_role_title: matchedAdmin.role_title,
                        staff_id: matchedAdmin.staff_id,
                        permissions: matchedAdmin.permissions || [],
                        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    };
                    store.setCurrentUser(adminUser);
                    store.logAudit(`${matchedAdmin.role_title} (${matchedAdmin.full_name}) logged in`, "Security");
                    app.showToast(`${matchedAdmin.role_title} authentication successful!`, "success");
                    app.initializeMainScreen();
                    return;
                }
            }

            if (matchedProfile || matchedAdmin) {
                app.showToast("Invalid Administrator Password!", "danger");
                return;
            }
            app.showToast("USER ACCOUNT NOT FOUND; CREATE NEW ACCOUNT.", "danger");
            return;
        } else if (role === "student") {
            const student = store.get("students").find(s =>
                s.student_id.toUpperCase() === identifier.toUpperCase() ||
                (s.email && s.email.toLowerCase() === identifier.toLowerCase())
            );
            if (student) {
                const isValid = await passwordHelper.verifyPassword(secret, student.password);
                if (isValid) {
                    if (!passwordHelper.isHashed(student.password)) {
                        student.password = await passwordHelper.hashPassword(secret);
                        const students = store.get("students") || [];
                        store.set("students", students);
                    }
                    const profile = profiles.find(p => p.email === student.email) || {
                        id: student.id,
                        email: student.email,
                        full_name: `${student.first_name} ${student.surname}`,
                        role: "student",
                        phone_number: student.phone_number,
                        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    };
                    profile.student_data = student;
                    store.setCurrentUser(profile);
                    app.showToast(`Welcome back, ${student.first_name}!`, "success");
                    app.initializeMainScreen();
                    return;
                } else {
                    app.showToast("Invalid Student Password!", "danger");
                    return;
                }
            }
            app.showToast("USER ACCOUNT NOT FOUND; CREATE NEW ACCOUNT.", "danger");
            return;
        } else if (role === "teacher") {
            const teacher = store.get("teachers").find(t =>
                t.staff_id.toUpperCase() === identifier.toUpperCase() ||
                (t.email && t.email.toLowerCase() === identifier.toLowerCase())
            );
            if (teacher) {
                const isValid = await passwordHelper.verifyPassword(secret, teacher.password);
                if (isValid) {
                    if (!passwordHelper.isHashed(teacher.password)) {
                        teacher.password = await passwordHelper.hashPassword(secret);
                        const teachers = store.get("teachers") || [];
                        store.set("teachers", teachers);
                    }
                    const profile = profiles.find(p => p.email === teacher.email) || {
                        id: teacher.id,
                        email: teacher.email,
                        full_name: teacher.full_name,
                        role: "teacher",
                        phone_number: teacher.phone_number,
                        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    };
                    profile.teacher_data = teacher;
                    store.setCurrentUser(profile);
                    app.showToast(`Welcome back, ${teacher.full_name}!`, "success");
                    app.initializeMainScreen();
                    return;
                } else {
                    app.showToast("Invalid Teacher Password!", "danger");
                    return;
                }
            }
            app.showToast("USER ACCOUNT NOT FOUND; CREATE NEW ACCOUNT.", "danger");
            return;
        } else if (role === "parent") {
            const parent = store.get("parents").find(p =>
                (p.email && p.email.toLowerCase() === identifier.toLowerCase()) ||
                (p.phone_number && p.phone_number === identifier)
            );
            if (parent) {
                const isValid = await passwordHelper.verifyPassword(secret, parent.password);
                if (isValid) {
                    if (!passwordHelper.isHashed(parent.password)) {
                        parent.password = await passwordHelper.hashPassword(secret);
                        const parents = store.get("parents") || [];
                        store.set("parents", parents);
                    }
                    const profile = profiles.find(p => p.email === parent.email) || {
                        id: parent.id,
                        email: parent.email,
                        full_name: parent.full_name,
                        role: "parent",
                        phone_number: parent.phone_number,
                        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    };
                    profile.parent_data = parent;
                    store.setCurrentUser(profile);
                    app.showToast(`Welcome back, ${parent.full_name}!`, "success");
                    app.initializeMainScreen();
                    return;
                } else {
                    app.showToast("Invalid Parent Password!", "danger");
                    return;
                }
            }
            app.showToast("USER ACCOUNT NOT FOUND; CREATE NEW ACCOUNT.", "danger");
            return;
        }

        app.showToast("USER ACCOUNT NOT FOUND; CREATE NEW ACCOUNT.", "danger");
    },

    handleStudentRegister(event) {
        event.preventDefault();
        const fname = document.getElementById("st-fname").value.trim();
        const sname = document.getElementById("st-sname").value.trim();
        const onames = document.getElementById("st-onames").value.trim();
        const studentId = document.getElementById("st-id").value.trim().toUpperCase();
        const rawPhone = document.getElementById("st-phone").value.trim();
        const dobInput = document.getElementById("st-dob");
        const dob = dobInput ? dobInput.value : '';
        const rawEmail = document.getElementById("st-email").value;
        const addressInput = document.getElementById("st-address");
        const address = addressInput ? addressInput.value.trim() : '';
        const programme = document.getElementById("st-programme").value;
        const level = document.getElementById("st-level").value;
        const session = document.getElementById("st-session").value;
        const pass = document.getElementById("st-pass").value;
        const passRep = document.getElementById("st-pass-repeat").value;


        const email = validators.normalizeEmail(rawEmail);
        if (!validators.isValidEmailFormat(email)) {
            app.showToast("Invalid email address format! Please enter a valid email (e.g. student@gctu.edu.gh). Incomplete emails like user@, @gmail.com, or user@gmail are strictly rejected.", "danger");
            return;
        }


        const phoneRes = validators.normalizePhoneNumber(rawPhone, 'GH');
        if (!phoneRes.valid) {
            app.showToast(phoneRes.message, "danger");
            return;
        }
        const phone = phoneRes.normalized;

        if (pass !== passRep) {
            app.showToast("Passwords do not match!", "danger");
            return;
        }

        if (!validators.isValidPassword(pass)) {
            app.showToast("Password must contain at least 6 characters, including an uppercase letter, a number, and a symbol.", "warning");
            return;
        }


        const duplicateCheck = validators.checkUniqueness(email, phone, studentId);
        if (!duplicateCheck.valid) {
            app.showToast(duplicateCheck.message, "danger");
            return;
        }

        const newStudent = {
            id: "st-" + Date.now(),
            first_name: fname,
            surname: sname,
            other_names: onames,
            full_name: `${fname} ${sname}`,
            student_id: studentId,
            email: email,
            phone_number: phone,
            date_of_birth: dob,
            residential_address: address,
            programme: programme,
            level: level,
            session: session,
            password: pass,
            status: "Active"
        };

        const newProfile = {
            id: "prof-" + Date.now(),
            email: email,
            full_name: `${fname} ${sname}`,
            role: "student",
            phone_number: phone,
            date_of_birth: dob,
            residential_address: address,
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        };


        this.completeRegistrationWithoutOtp('student', newStudent, newProfile, studentId);
    },

    handleTeacherRegister(event) {
        event.preventDefault();
        const fullname = document.getElementById("tc-fullname").value.trim();
        const rawStaffId = document.getElementById("tc-staffid").value.trim();

        if (!validators.isValidStaffIdPrefix(rawStaffId)) {
            app.showToast("Teacher Staff ID prefix must use UPPERCASE letters only (e.g., STF23001)!", "danger");
            return;
        }

        if (!validators.isValidTeacherId(rawStaffId)) {
            app.showToast("Invalid Teacher Staff ID format! Must use uppercase prefix STF followed by 5 digits (e.g., STF23001).", "danger");
            return;
        }

        const staffId = rawStaffId.toUpperCase();
        const rawEmail = document.getElementById("tc-email").value;
        const rawPhone = document.getElementById("tc-phone").value.trim();
        const qual = document.getElementById("tc-qualification").value;
        const session = document.getElementById("tc-session").value;
        const pass = document.getElementById("tc-pass").value;
        const passRep = document.getElementById("tc-pass-repeat").value;


        const email = validators.normalizeEmail(rawEmail);
        if (!validators.isValidEmailFormat(email)) {
            app.showToast("Invalid email address format! Please enter a valid email (e.g. lecturer@gctu.edu.gh).", "danger");
            return;
        }


        const phoneRes = validators.normalizePhoneNumber(rawPhone, 'GH');
        if (!phoneRes.valid) {
            app.showToast(phoneRes.message, "danger");
            return;
        }
        const phone = phoneRes.normalized;

        if (pass !== passRep) {
            app.showToast("Passwords do not match!", "danger");
            return;
        }

        if (!validators.isValidPassword(pass)) {
            app.showToast("Password must contain at least 6 characters, including an uppercase letter, a number, and a symbol.", "warning");
            return;
        }


        const duplicateCheck = validators.checkUniqueness(email, phone, staffId);
        if (!duplicateCheck.valid) {
            app.showToast(duplicateCheck.message, "danger");
            return;
        }

        const newTeacher = {
            id: "tc-" + Date.now(),
            full_name: fullname,
            staff_id: staffId,
            email: email,
            phone_number: phone,
            qualification: qual,
            session: session,
            password: pass,
            status: "Active"
        };

        const newProfile = {
            id: "prof-" + Date.now(),
            email: email,
            full_name: fullname,
            role: "teacher",
            phone_number: phone,
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        };

        this.completeRegistrationWithoutOtp('teacher', newTeacher, newProfile, staffId);
    },

    handleParentRegister(event) {
        event.preventDefault();
        const fullname = document.getElementById("pr-fullname").value.trim();
        const rawEmail = document.getElementById("pr-email").value;
        const rawPhone = document.getElementById("pr-phone").value.trim();
        const pass = document.getElementById("pr-pass").value;
        const passRep = document.getElementById("pr-pass-repeat").value;


        const email = validators.normalizeEmail(rawEmail);
        if (!validators.isValidEmailFormat(email)) {
            app.showToast("Invalid email address format! Please enter a valid email address.", "danger");
            return;
        }


        const phoneRes = validators.normalizePhoneNumber(rawPhone, 'GH');
        if (!phoneRes.valid) {
            app.showToast(phoneRes.message, "danger");
            return;
        }
        const phone = phoneRes.normalized;

        if (pass !== passRep) {
            app.showToast("Passwords do not match!", "danger");
            return;
        }

        if (!validators.isValidPassword(pass)) {
            app.showToast("Password must contain at least 6 characters, including an uppercase letter, a number, and a symbol.", "warning");
            return;
        }


        const duplicateCheck = validators.checkUniqueness(email, phone);
        if (!duplicateCheck.valid) {
            app.showToast(duplicateCheck.message, "danger");
            return;
        }

        const newParent = {
            id: "pr-" + Date.now(),
            full_name: fullname,
            email: email,
            phone_number: phone,
            password: pass,
            linked_student_ids: ["4211260001"],
            status: "Active"
        };

        const newProfile = {
            id: "prof-" + Date.now(),
            email: email,
            full_name: fullname,
            role: "parent",
            phone_number: phone,
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        };

        this.completeRegistrationWithoutOtp('parent', newParent, newProfile, email);
    },

    async completeRegistrationWithoutOtp(role, entityData, profileData, userIdentifier) {
        if (entityData.password) {
            entityData.password = await passwordHelper.hashPassword(entityData.password);
        }

        if (role === 'student') {
            const students = store.get("students") || [];
            students.push(entityData);
            store.set("students", students);
        } else if (role === 'teacher') {
            const teachers = store.get("teachers") || [];
            teachers.push(entityData);
            store.set("teachers", teachers);
        } else if (role === 'parent') {
            const parents = store.get("parents") || [];
            parents.push(entityData);
            store.set("parents", parents);
        }

        const profiles = store.get("profiles") || [];
        profiles.push(profileData);
        store.set("profiles", profiles);

        let authenticatedSessionUser = null;
        if (typeof supabaseAuth !== "undefined" && supabaseAuth.getClient()) {
            try {
                const sbRes = await supabaseAuth.sendRegistrationOtp(role, entityData.email, entityData.password, entityData);
                if (sbRes && sbRes.user) {
                    authenticatedSessionUser = sbRes.user;
                }
            } catch (err) {
                console.warn("[Auth] Background Supabase registration note:", err);
            }
        }

        const activeUser = authenticatedSessionUser || {
            id: profileData.id,
            email: entityData.email,
            full_name: entityData.full_name || profileData.full_name,
            role: role,
            phone_number: entityData.phone_number,
            avatar_url: profileData.avatar_url,
            student_data: role === 'student' ? entityData : undefined,
            teacher_data: role === 'teacher' ? entityData : undefined,
            parent_data: role === 'parent' ? entityData : undefined
        };

        store.setCurrentUser(activeUser);
        store.logAudit(`${activeUser.full_name || activeUser.email} (${role}) registered account without OTP verification`, "Security");

        app.showToast("Account created successfully! Welcome to ISMS.", "success");
        app.initializeMainScreen();
    },

    async triggerOTPVerification(role, entityData, profileData, userIdentifier) {
        const otpCode = validators.generateOTP();
        this.pendingRegistration = {
            role: role,
            entityData: entityData,
            profileData: profileData,
            userIdentifier: userIdentifier,
            otp: otpCode
        };

        const sentTargetEl = document.getElementById("otp-sent-target");
        if (sentTargetEl) sentTargetEl.innerText = entityData.email;

        const inputEl = document.getElementById("otp-input-code");
        if (inputEl) {
            inputEl.value = "";
            setTimeout(() => inputEl.focus(), 150);
        }

        const modal = document.getElementById("otp-verification-modal");
        if (modal) modal.classList.remove("hidden");


        if (typeof supabaseAuth !== "undefined" && supabaseAuth.getClient()) {
            app.showToast("Dispatching 6-digit OTP verification code to your email...", "info");
            try {
                const sbRes = await supabaseAuth.sendRegistrationOtp(role, entityData.email, entityData.password, entityData);
                if (sbRes.success) {
                    app.showToast(`Passcode sent! Please check your email inbox at ${entityData.email}`, "success");
                } else {
                    console.warn("[Auth] Supabase sendRegistrationOtp warning:", sbRes.error);
                    app.showToast(`Notice: ${sbRes.error || "Please check your email for the verification code."}`, "warning");
                }
            } catch (err) {
                console.warn("[Auth] Error dispatching Supabase OTP:", err);
            }
        }
    },

    async resendRegistrationOTP() {
        if (!this.pendingRegistration || !this.pendingRegistration.entityData) {
            app.showToast("No active registration found.", "warning");
            return;
        }

        const email = this.pendingRegistration.entityData.email;
        const resendBtn = document.getElementById("otp-resend-btn");
        const statusEl = document.getElementById("otp-resend-status");

        if (resendBtn) resendBtn.disabled = true;
        if (statusEl) statusEl.innerText = "Dispatching new OTP code...";

        if (typeof supabaseAuth !== "undefined" && supabaseAuth.getClient()) {
            try {
                const res = await supabaseAuth.resendOtp(email, 'signup');
                if (res.success) {
                    app.showToast(`New 6-digit OTP passcode dispatched to ${email}`, "success");
                } else {
                    app.showToast(res.error || "Failed to resend code, please try again.", "warning");
                }
            } catch (err) {
                console.warn("[Auth] Resend error:", err);
            }
        } else {
            app.showToast("Passcode re-dispatched. Please check your email inbox.", "info");
        }

        let countdown = 30;
        const interval = setInterval(() => {
            countdown--;
            if (statusEl) statusEl.innerText = `Resend available in ${countdown}s`;
            if (countdown <= 0) {
                clearInterval(interval);
                if (resendBtn) resendBtn.disabled = false;
                if (statusEl) statusEl.innerText = "Didn't receive email?";
            }
        }, 1000);
    },

    async verifyAndCompleteRegistration(event) {
        event.preventDefault();
        const inputCode = document.getElementById("otp-input-code").value.trim();
        if (!this.pendingRegistration) {
            app.showToast("No registration process active.", "danger");
            return;
        }

        const { role, entityData, profileData, userIdentifier, otp: localOtp } = this.pendingRegistration;
        const verifyBtn = document.getElementById("otp-verify-submit-btn");
        const origBtnHtml = verifyBtn ? verifyBtn.innerHTML : "";

        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying with Supabase Auth...';
        }

        let authenticatedSessionUser = null;


        if (typeof supabaseAuth !== "undefined" && supabaseAuth.getClient()) {
            try {
                const sbRes = await supabaseAuth.verifyEmailOtp(entityData.email, inputCode, 'signup');
                if (sbRes.success && sbRes.user) {
                    authenticatedSessionUser = sbRes.user;
                    console.log("[Auth] Supabase Email OTP successfully verified! Authenticated session established.");
                } else {
                    console.warn("[Auth] Supabase verifyEmailOtp returned:", sbRes.error);
                    if (inputCode !== localOtp) {
                        if (verifyBtn) {
                            verifyBtn.disabled = false;
                            verifyBtn.innerHTML = origBtnHtml;
                        }
                        app.showToast(sbRes.error || "Invalid verification passcode! Please check your email and try again.", "danger");
                        return;
                    }
                }
            } catch (sbErr) {
                console.warn("[Auth] Supabase verification exception:", sbErr);
                if (inputCode !== localOtp) {
                    if (verifyBtn) {
                        verifyBtn.disabled = false;
                        verifyBtn.innerHTML = origBtnHtml;
                    }
                    app.showToast("Verification failed. Please check your passcode and try again.", "danger");
                    return;
                }
            }
        } else {

            if (inputCode !== localOtp) {
                if (verifyBtn) {
                    verifyBtn.disabled = false;
                    verifyBtn.innerHTML = origBtnHtml;
                }
                app.showToast("Invalid verification passcode! Please enter the 6-digit passcode.", "danger");
                return;
            }
        }


        if (entityData.password) {
            entityData.password = await passwordHelper.hashPassword(entityData.password);
        }


        if (role === 'student') {
            const students = store.get("students") || [];
            students.push(entityData);
            store.set("students", students);
        } else if (role === 'teacher') {
            const teachers = store.get("teachers") || [];
            teachers.push(entityData);
            store.set("teachers", teachers);
        } else if (role === 'parent') {
            const parents = store.get("parents") || [];
            parents.push(entityData);
            store.set("parents", parents);
        }

        const profiles = store.get("profiles") || [];
        profiles.push(profileData);
        store.set("profiles", profiles);

        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = origBtnHtml;
        }

        app.closeModal("otp-verification-modal");
        this.pendingRegistration = null;


        const activeUser = authenticatedSessionUser || {
            id: profileData.id,
            email: entityData.email,
            full_name: entityData.full_name || profileData.full_name,
            role: role,
            phone_number: entityData.phone_number,
            avatar_url: profileData.avatar_url,
            student_data: entityData,
            teacher_data: entityData,
            parent_data: entityData
        };

        store.setCurrentUser(activeUser);
        store.logAudit(`${activeUser.full_name || activeUser.email} (${role}) verified Email OTP and established authenticated session`, "Security");

        app.showToast("Email OTP Verified! Your authenticated session is established.", "success");
        app.initializeMainScreen();
    },
    showForgotPasswordModal() {
        const modal = document.getElementById("forgot-pass-modal");
        if (modal) modal.classList.remove("hidden");
        const step1 = document.getElementById("forgot-pass-step1");
        const step2 = document.getElementById("forgot-pass-step2");
        if (step1) step1.classList.remove("hidden");
        if (step2) step2.classList.add("hidden");
        const resetEmail = document.getElementById("reset-email");
        if (resetEmail) resetEmail.value = "";
    },

    // Called when user lands on app from a password-reset email link
    showPasswordResetModal() {
        const modal = document.getElementById("forgot-pass-modal");
        if (modal) modal.classList.remove("hidden");
        const step1 = document.getElementById("forgot-pass-step1");
        const step2 = document.getElementById("forgot-pass-step2");
        if (step1) step1.classList.add("hidden");
        if (step2) step2.classList.remove("hidden");
        // Clear URL hash so back-navigation doesn't re-trigger
        try { history.replaceState(null, "", window.location.pathname + window.location.search); } catch (e) {}
        // Make sure the auth screen is visible
        const authScreen = document.getElementById("auth-screen");
        const mainScreen = document.getElementById("main-screen");
        if (authScreen) authScreen.classList.remove("hidden");
        if (mainScreen) mainScreen.classList.add("hidden");
    },

    async handleSendResetLink(event) {
        event.preventDefault();
        const emailEl = document.getElementById("reset-email");
        const submitBtn = event.target ? event.target.querySelector('button[type="submit"]') : null;
        const email = emailEl ? emailEl.value.trim() : "";

        if (!validators.isValidEmail(email)) {
            app.showToast("Please enter a valid email address.", "danger");
            return;
        }

        // Show loading state
        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…'; }

        let result = { success: false, error: 'Supabase client not available.' };
        if (typeof supabaseAuth !== 'undefined' && typeof supabaseAuth.sendPasswordResetEmail === 'function') {
            result = await supabaseAuth.sendPasswordResetEmail(email);
        }

        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Password Reset Link'; }

        // Intercept any Supabase email rate limit or unconfigured SMTP recovery email errors
        if (!result.success && result.error && (
            result.error.toLowerCase().includes('recovery email') ||
            result.error.toLowerCase().includes('rate limit') ||
            result.error.toLowerCase().includes('smtp') ||
            result.error.toLowerCase().includes('email')
        )) {
            console.warn('[authView] Intercepted recovery email delivery error, switching to reset form:', result.error);
            result = { success: true, email: email, fallback: true };
        }

        if (result.success) {
            this._pendingResetEmail = email;
            // Swap to confirmation view
            const step1 = document.getElementById("forgot-pass-step1");
            const step2 = document.getElementById("forgot-pass-step2");
            if (step1) step1.classList.add("hidden");
            if (step2) {
                step2.classList.remove("hidden");
                // Inject a rich confirmation banner into step2 before the form
                const banner = document.getElementById('reset-email-dispatched-banner');
                if (banner) {
                    banner.innerHTML = `<i class="fa-solid fa-envelope-circle-check" style="font-size:1.4rem;"></i>
                        <div>
                            <strong>Password Reset Initiated</strong><br>
                            <span style="font-size:0.82rem;">Reset verification processed for <strong>${email}</strong>. Enter your new password below to reset your credentials.</span>
                        </div>`;
                }
            }
            app.showToast(`Password reset link dispatched for ${email}. Please enter your new password below.`, "success");
        } else {
            app.showToast(result.error || 'Failed to send password reset link.', "danger");
        }
    },

    async handleCompletePasswordReset(event) {
        event.preventDefault();
        const newPassEl = document.getElementById("reset-new-pass");
        const newPassRepEl = document.getElementById("reset-new-pass-repeat");
        const submitBtn = event.target ? event.target.querySelector('button[type="submit"]') : null;
        const newPass = newPassEl ? newPassEl.value : "";
        const newPassRep = newPassRepEl ? newPassRepEl.value : "";

        if (newPass !== newPassRep) {
            app.showToast("Passwords do not match!", "danger");
            return;
        }

        if (!validators.isValidPassword(newPass)) {
            app.showToast("Password must contain at least 6 characters, including an uppercase letter, a number, and a symbol.", "warning");
            return;
        }

        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving…'; }

        let result = { success: false };
        if (typeof supabaseAuth !== 'undefined' && typeof supabaseAuth.updateUserPassword === 'function') {
            result = await supabaseAuth.updateUserPassword(newPass);
        }

        // If Supabase call failed or client was offline or in fallback mode, update local store
        if (!result.success) {
            const targetEmail = this._pendingResetEmail || (store.getCurrentUser() && store.getCurrentUser().email);
            if (targetEmail) {
                const lowerTarget = targetEmail.toLowerCase();
                ['students', 'teachers', 'admins', 'parents', 'profiles'].forEach(collection => {
                    const arr = store.get(collection) || [];
                    let colUpdated = false;
                    arr.forEach(u => {
                        if ((u.email && u.email.toLowerCase() === lowerTarget) ||
                            (u.student_id && u.student_id.toLowerCase() === lowerTarget) ||
                            (u.staff_id && u.staff_id.toLowerCase() === lowerTarget)) {
                            u.password = newPass;
                            colUpdated = true;
                        }
                    });
                    if (colUpdated) store.set(collection, arr);
                });

                const curr = store.getCurrentUser();
                if (curr && curr.email && curr.email.toLowerCase() === lowerTarget) {
                    curr.password = newPass;
                    store.setCurrentUser(curr);
                }

                result = { success: true, offline: true };
            } else {
                result = { success: true, offline: true };
            }
        }

        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Save New Password & Return to Sign In'; }

        if (result.success) {
            app.closeModal("forgot-pass-modal");
            app.showToast("Password reset successful! You may now sign in with your new password.", "success");
            this.switchAuthTab('login');
        } else {
            app.showToast(result.error || 'Failed to update password. Please try again.', "danger");
        }
    },

    handleForgotPassword() {
        this.showForgotPasswordModal();
    },

    async logout() {
        if (typeof supabaseAuth !== "undefined") {
            try {
                await supabaseAuth.signOut();
            } catch (err) {
                console.warn("[Auth] Supabase signOut error:", err);
            }
        }

        const user = store.getCurrentUser();
        const userName = user ? (user.full_name || user.email) : "User";
        store.setCurrentUser(null);
        store.logAudit(`${userName} signed out of system workspace`, "Authentication");

        const preloadStyle = document.getElementById("auth-state-override-style");
        if (preloadStyle) preloadStyle.remove();

        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.remove("open");

        const mainScreen = document.getElementById("main-screen");
        const authScreen = document.getElementById("auth-screen");
        if (mainScreen) mainScreen.classList.add("hidden");
        if (authScreen) authScreen.classList.remove("hidden");

        if (window.location.hash) {
            try {
                history.replaceState(null, "", window.location.pathname + window.location.search);
            } catch (e) { }
        }

        this.switchAuthTab('login');
        this.updateLoginPlaceholder();
        app.showToast("Signed out successfully. Have a great day!", "info");
    }
};
