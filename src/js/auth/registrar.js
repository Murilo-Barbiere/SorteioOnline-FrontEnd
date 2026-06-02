const URL_REGISTER = 'http://localhost:8080/auth/register';

document.getElementById('form-register').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;

    try {
        const response = await fetch(URL_REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome: nome, email: email, senha: senha })
        });

        if (!response.ok) {
            throw new Error('Erro ao registrar usuário. Verifique os dados ou se o email já existe.');
        }

        alert('Cadastro realizado com sucesso!');
        window.location.href = 'login.html';

    } catch (error) {
        alert(error.message);
        console.error('Erro no registro:', error);
    }
});