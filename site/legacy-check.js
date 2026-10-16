// Проверка пароля при входе. Пароль администратора хранится не открытым текстом, а в виде хеша.
// ВАЖНО: пока у сайта нет сервера, это не настоящая защита — хеш виден в коде страницы
// и подходит только для того, чтобы пароль не лежал в файле открытым текстом.
window.FactoryAuth = (function () {
    const ADMIN = {
        name: '', login: '__legacy_disabled__', role: 'user',
        salt: '5b991577b93aed48b0488dc9', rounds: 20000,
        passwordHash: ''
    };

    const K = new Uint32Array([
        0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
        0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
        0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
        0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ]);

    function sha256hex(message) {
        const data = new TextEncoder().encode(message), len = data.length;
        const total = ((len + 9 + 63) >> 6) << 6;
        const buf = new Uint8Array(total); buf.set(data); buf[len] = 0x80;
        const view = new DataView(buf.buffer);
        view.setUint32(total - 4, (len * 8) >>> 0); view.setUint32(total - 8, Math.floor(len * 8 / 4294967296));
        let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
        const w = new Uint32Array(64);
        for (let o = 0; o < total; o += 64) {
            for (let i = 0; i < 16; i++) w[i] = view.getUint32(o + i * 4);
            for (let i = 16; i < 64; i++) {
                const a = w[i - 15], b = w[i - 2];
                const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
                const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
                w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
            }
            let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
            for (let i = 0; i < 64; i++) {
                const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
                const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
                const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
                const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
                h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
            }
            h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
        }
        return [h0, h1, h2, h3, h4, h5, h6, h7].map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
    }

    // Тот же алгоритм использует tools/make_admin_hash.py.
    function hashPassword(password, salt, rounds) {
        let h = sha256hex(salt + ':' + password);
        for (let i = 1; i < rounds; i++) h = sha256hex(h + ':' + salt + ':' + password);
        return h;
    }
    const check = (user, password) => !!user.passwordHash && hashPassword(password, user.salt, user.rounds) === user.passwordHash;
    const matches = (user, password) => user.passwordHash ? check(user, password) : user.password === password;

    // Гарантирует, что учётная запись admin есть и использует актуальный пароль (старый admin123 заменяется).
    function ensureAdmin(list) {
        const next = list.slice(), i = next.findIndex(u => u.login === ADMIN.login);
        if (i < 0) next.push({ ...ADMIN }); else next[i] = { ...ADMIN };
        return next;
    }
    // ---------------- Роли, регистрация, вход ----------------
    const ROLE_LABELS = { admin: 'Администратор', manager: 'Руководитель', user: 'Сотрудник' };
    const roleLabel = role => ROLE_LABELS[role] || ROLE_LABELS.user;
    const config = Object.assign({ allowRegistration: true }, window.SITE_CONFIG || {});
    const sameLogin = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

    // Учётные записи, которые лежат в самом сайте: администратор + файл accounts.js.
    // Только они могут иметь роль «Руководитель» или «Администратор».
    const fixedAccounts = () => [ADMIN].concat((window.SITE_ACCOUNTS || []).filter(a => a && a.login && a.passwordHash && a.salt && a.rounds));

    // Проверка входа. «Местные» аккаунты (регистрация в браузере) всегда получают роль «Сотрудник».
    function login(loginName, password, localUsers) {
        const fixed = fixedAccounts().find(a => sameLogin(a.login, loginName));
        if (fixed) return check(fixed, password) ? { name: fixed.name || fixed.login, login: fixed.login, role: fixed.role || 'user' } : null;
        const local = (localUsers || []).find(u => sameLogin(u.login, loginName));
        return local && matches(local, password) ? { name: local.name || local.login, login: local.login, role: 'user', local } : null;
    }

    function randomHex(bytes) {
        const arr = new Uint8Array(bytes);
        if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(arr);
        else for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
        return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    }
    // Новый хеш пароля: { salt, rounds, passwordHash } — этими полями заменяется открытый пароль.
    function hashNew(password) {
        const salt = randomHex(12), rounds = ADMIN.rounds;
        return { salt, rounds, passwordHash: hashPassword(password, salt, rounds) };
    }

    const LETTER = /[A-Za-zА-Яа-яЁё]/;
    function validateRegistration(d, localUsers) {
        const name = String(d.name || '').trim(), loginName = String(d.login || '').trim(), pw = String(d.password || '');
        if (name.length < 2 || !LETTER.test(name)) return 'Введите имя и фамилию (минимум 2 символа).';
        if (name.length > 60) return 'Имя слишком длинное — до 60 символов.';
        if (!/^[A-Za-z0-9_.-]{3,24}$/.test(loginName)) return 'Логин: 3–24 символа — латинские буквы, цифры, точка, дефис или подчёркивание.';
        if (fixedAccounts().some(a => sameLogin(a.login, loginName)) || (localUsers || []).some(u => sameLogin(u.login, loginName))) return 'Такой логин уже занят.';
        if (pw.length < 8) return 'Пароль должен быть не короче 8 символов.';
        if (!LETTER.test(pw) || !/\d/.test(pw)) return 'В пароле нужны и буквы, и цифры.';
        if (sameLogin(pw, loginName)) return 'Пароль не должен совпадать с логином.';
        if (pw !== String(d.password2 || '')) return 'Пароли не совпадают.';
        return '';
    }
    // 0–4 и подпись для индикатора надёжности.
    function passwordStrength(pw) {
        pw = String(pw || '');
        let score = 0;
        if (pw.length >= 8) score++;
        if (pw.length >= 12) score++;
        if (/[a-zа-яё]/.test(pw) && /[A-ZА-ЯЁ]/.test(pw)) score++;
        if (/\d/.test(pw) && /[^A-Za-zА-Яа-яЁё0-9]/.test(pw)) score++;
        if (pw.length < 8) score = Math.min(score, 1);
        return { score, label: ['Слишком короткий', 'Слабый', 'Средний', 'Хороший', 'Надёжный'][score] };
    }
    return { hashPassword, check, matches, ensureAdmin, ROLE_LABELS, roleLabel, config, sameLogin, fixedAccounts, login, hashNew, validateRegistration, passwordStrength };
})();
