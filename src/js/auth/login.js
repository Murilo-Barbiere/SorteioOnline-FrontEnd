/**
 * login.js — Autenticação com e-mail e senha
 * Requer: utils.js (parseJwt, toast, BASE_URL)
 */

document.getElementById('form-login').addEventListener('submit', async e => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    if (!email || !senha) {
        toast('Preencha e-mail e senha.', 'error');
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled   = true;
    btn.textContent = 'Entrando…';

    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });

        if (!response.ok) throw new Error('Usuário ou senha inválidos.');

        const dados   = await response.json();
        const payload = parseJwt(dados.token);

        sessionStorage.setItem('token', dados.token);

        if (payload?.role === 'ROLE_ADMIN') {
            window.location.href = resolveRaiz('src/pages/admin.html');
        } else {
            window.location.href = resolveRaiz('index.html');
        }

    } catch (err) {
        toast(err.message, 'error');
        btn.disabled    = false;
        btn.textContent = 'Entrar';
    }
});