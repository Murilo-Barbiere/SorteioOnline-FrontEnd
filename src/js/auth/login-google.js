async function handleCredentialResponse(response) {

    const googleToken = response.credential;

    try {

        const res = await fetch(
            `${BASE_URL}/auth/google-login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    token: googleToken
                })
            }
        );

        if(!res.ok){
            throw new Error("Erro login");
        }

        const data = await res.json();

        sessionStorage.setItem("token", data.token);

        alert('Login efetuado com sucesso!');
        window.location.href = '../../index.html';

    } catch (err) {

        console.error(err);
    }
}