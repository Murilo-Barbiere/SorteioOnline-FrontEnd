const URL_LOGIN = 'http://localhost:8080/auth/login';


document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        const response = await fetch(URL_LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, senha: senha }) 
        });

        if (!response.ok) {
            throw new Error('Usuário ou senha inválidos');
        }

        const dados = await response.json();
        
        localStorage.setItem('token_sorteio', dados.token);

        alert('Login efetuado com sucesso!');
        window.location.href = '../index.html';

    } catch (error) {
        alert(error.message);
        console.error('Erro no login:', error);
    }
});