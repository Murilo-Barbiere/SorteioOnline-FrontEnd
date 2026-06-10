async function handleCredentialResponse(response) {

    const googleToken = response.credential;

    try {

        const res = await fetch(
            `${BASE_URL}/auth/google-register`,
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

        alert('Cadastro realizado com sucesso!');
        window.location.href = '../../index.html';

    } catch (err){

        console.error(err);
    }
}