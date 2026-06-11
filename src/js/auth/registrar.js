document.getElementById('form-register').addEventListener('submit', async e => {
    e.preventDefault();

    const nome  = document.getElementById('reg-nome').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const senha = document.getElementById('reg-senha').value;

    if (!nome || !email || !senha) {
        toast('Preencha todos os campos.', 'error');
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled    = true;
    btn.textContent = 'Cadastrando…';

    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha }),
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || 'Erro ao cadastrar. Verifique se o e-mail já está em uso.');
        }

        toast('Cadastro realizado! Redirecionando…', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);

    } catch (err) {
        toast(err.message, 'error');
        btn.disabled    = false;
        btn.textContent = 'Cadastrar';
    }
});