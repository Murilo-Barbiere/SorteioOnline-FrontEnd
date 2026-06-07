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
        const payloadToken = parseJwt(dados.token);

        sessionStorage.setItem('token', dados.token);

        if (payloadToken && payloadToken.role === 'ROLE_ADMIN') { 
            window.location.href = '../../src/pages/admin.html';
        }
        else{
            window.location.href = '../../index.html';
        }

    } catch (error) {
        alert(error.message);
        console.error('Erro no login:', error);
    }
});

function parseJwt(token) {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar o token:", e);
        return null;
    }
}