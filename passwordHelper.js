const passwordHelper = {
    _generateSalt(length = 16) {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            const arr = new Uint8Array(length);
            window.crypto.getRandomValues(arr);
            return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        try {
            const nodeCrypto = require('crypto');
            return nodeCrypto.randomBytes(length).toString('hex');
        } catch (e) {
            let hex = '';
            for (let i = 0; i < length * 2; i++) {
                hex += Math.floor(Math.random() * 16).toString(16);
            }
            return hex;
        }
    },

    _bufToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    async _sha256(str) {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuf = await window.crypto.subtle.digest('SHA-256', data);
            return this._bufToHex(hashBuf);
        }
        try {
            const nodeCrypto = require('crypto');
            return nodeCrypto.createHash('sha256').update(str).digest('hex');
        } catch (e) {
            throw new Error('Cryptographic environment not available for SHA-256');
        }
    },

    /**
     * Compute a salted SHA-256 hash
     * @param {string} plaintext 
     * @param {string} [salt] Optional specific salt
     * @returns {Promise<string>} Format: "sha256$<salt>$<hash>"
     */
    async hashPassword(plaintext, salt = null) {
        if (!plaintext) return '';
        const useSalt = salt || this._generateSalt();
        const digest = await this._sha256(useSalt + plaintext);
        return `sha256$${useSalt}$${digest}`;
    },

    /**
     * Verify a plaintext password against a stored value
     * Supports both modern sha256$ hashes and legacy plaintext fallback (for migration)
     * @param {string} plaintext
     * @param {string} stored
     * @returns {Promise<boolean>}
     */
    async verifyPassword(plaintext, stored) {
        if (!plaintext || !stored) return false;
        if (this.isHashed(stored)) {
            const parts = stored.split('$');
            if (parts.length !== 3) return false;
            const salt = parts[1];
            const expectedHash = parts[2];
            const actualHash = await this._sha256(salt + plaintext);
            return actualHash === expectedHash;
        }

        return plaintext === stored;
    },

    /**
     * Check if a stored string is already a salted sha256 hash
     * @param {string} stored
     * @returns {boolean}
     */
    isHashed(stored) {
        return typeof stored === 'string' && stored.startsWith('sha256$');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = passwordHelper;
}
