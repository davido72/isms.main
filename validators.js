const validators = {
    normalizeEmail(email) {
        if (!email) return "";
        return String(email).trim().toLowerCase();
    },

    isValidEmailFormat(email) {
        const normalized = this.normalizeEmail(email);
        if (!normalized) return false;

        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(normalized);
    },

    isValidEmail(email) {
        return this.isValidEmailFormat(email);
    },

    normalizePhoneNumber(phone, country = 'GH') {
        if (!phone) return { valid: false, normalized: "", message: "Phone number is required." };
        const cleaned = String(phone).replace(/[\s\-\(\)]/g, "");


        if (country === 'GH' || cleaned.startsWith("0") || cleaned.startsWith("+233") || cleaned.startsWith("233")) {

            if (/^0[235789]\d{8}$/.test(cleaned)) {
                return { valid: true, normalized: "+233" + cleaned.substring(1), message: "Valid Ghanaian phone number." };
            }

            if (/^233[235789]\d{8}$/.test(cleaned)) {
                return { valid: true, normalized: "+" + cleaned, message: "Valid Ghanaian phone number." };
            }

            if (/^\+233[235789]\d{8}$/.test(cleaned)) {
                return { valid: true, normalized: cleaned, message: "Valid Ghanaian phone number." };
            }
            return { valid: false, normalized: "", message: "Invalid Ghanaian phone number format! Examples of valid formats: 0241234567 or +233241234567." };
        }


        if (/^\+[1-9]\d{8,14}$/.test(cleaned)) {
            return { valid: true, normalized: cleaned, message: "Valid international phone number." };
        }

        return { valid: false, normalized: "", message: "Invalid phone number format! Number must contain 9 to 15 digits in E.164 format (e.g. +233241234567)." };
    },

    isValidPhone(phone) {
        return this.normalizePhoneNumber(phone).valid;
    },

    isValidPassword(password) {

        return CONFIG.PASSWORD_REGEX.test(password);
    },

    isUniqueUser({ email, phone, student_id, staff_id }) {
        return this.checkUniqueness(email, phone, student_id || staff_id);
    },

    checkUniqueness(email, phone, studentOrStaffId = null) {
        const students = store.get("students") || [];
        const teachers = store.get("teachers") || [];
        const parents = store.get("parents") || [];
        const profiles = store.get("profiles") || [];
        const admins = store.get("admins") || [];

        const normalizedEmail = this.normalizeEmail(email);
        const normalizedPhone = phone ? this.normalizePhoneNumber(phone).normalized : "";

        const allEmails = [
            ...students.map(s => this.normalizeEmail(s.email)),
            ...teachers.map(t => this.normalizeEmail(t.email)),
            ...parents.map(p => this.normalizeEmail(p.email)),
            ...profiles.map(pr => this.normalizeEmail(pr.email)),
            ...admins.map(a => this.normalizeEmail(a.email))
        ].filter(Boolean);

        const allPhones = [
            ...students.map(s => s.phone_number),
            ...teachers.map(t => t.phone_number),
            ...parents.map(p => p.phone_number),
            ...profiles.map(pr => pr.phone_number),
            ...admins.map(a => a.phone_number)
        ].filter(Boolean);

        if (normalizedEmail && allEmails.includes(normalizedEmail)) {
            return { valid: false, message: `Registration Error: The email address '${normalizedEmail}' is already registered to an existing user account.` };
        }

        if (normalizedPhone && allPhones.includes(normalizedPhone)) {
            return { valid: false, message: `Registration Error: The phone number '${normalizedPhone}' is already associated with another registered account.` };
        }

        if (studentOrStaffId) {
            const allIds = [
                ...students.map(s => (s.student_id || "").toUpperCase()),
                ...teachers.map(t => (t.staff_id || "").toUpperCase()),
                ...admins.map(a => (a.staff_id || "").toUpperCase())
            ];
            if (allIds.includes(studentOrStaffId.toUpperCase())) {
                return { valid: false, message: `Registration Error: The ID '${studentOrStaffId}' already exists in the system.` };
            }
        }

        return { valid: true };
    },

    generateStudentId() {
        const students = store.get("students") || [];
        const year = new Date().getFullYear().toString().slice(-2);
        let seq = students.length + 1;
        while (students.some(s => s.student_id === `4211${year}${seq.toString().padStart(4, '0')}`)) {
            seq++;
        }
        return `4211${year}${seq.toString().padStart(4, '0')}`;
    },

    generateTeacherId() {
        const teachers = store.get("teachers") || [];
        const year = new Date().getFullYear().toString().slice(-2);
        let seq = teachers.length + 1;
        while (teachers.some(t => t.staff_id === `STF${year}${seq.toString().padStart(3, '0')}`)) {
            seq++;
        }
        return `STF${year}${seq.toString().padStart(3, '0')}`;
    },

    generateAdminId(rolePrefix) {
        const year = new Date().getFullYear().toString().slice(-2);
        let baseId = `ADM-${rolePrefix.substring(0, 3).toUpperCase()}-${year}`;
        const admins = store.get("admins") || [];
        let finalId = baseId;
        let suffixCode = 65; // 'A'
        while (admins.some(a => a.staff_id === finalId)) {
            finalId = baseId.substring(0, 9) + String.fromCharCode(suffixCode);
            suffixCode++;
        }
        return finalId;
    },

    isValidStaffIdPrefix(id) {
        if (!id) return false;
        return !/[a-z]/.test(id.trim());
    },

    isValidStudentId(id) {
        if (!id || id.length > 10) return false;
        return /^4211\d{2}\d{4}$/.test(id.trim());
    },

    isValidTeacherId(id) {
        if (!id || id.length > 8) return false;
        return /^STF\d{2}\d{3}$/.test(id.trim());
    },

    isValidAdminId(id) {
        if (!id || id.length > 15) return false;
        return /^(ADM-[A-Z0-9\-]+|SUPER-\d{3}|[A-Z]{3,8}-\d{3})$/.test(id.trim());
    },

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },


    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    },

    isWithinGeoFence(userLat, userLng, fenceLat, fenceLng, radiusMeters = 500) {
        const distance = this.calculateDistance(userLat, userLng, fenceLat, fenceLng);
        return {
            within: distance <= radiusMeters,
            distance: Math.round(distance),
            radius: radiusMeters
        };
    }
};

