// Assumindo que a rota no controller de sorteio baseie-se em /sorteio
const API_MEUS_SORTEIOS = 'http://localhost:8080/sorteio/participando';
const BASE_URL = 'http://localhost:8080';

async function carregarMeusSorteios() {
    const container = document.getElementById('container-meus-sorteios');
    const token = sessionStorage.getItem('token');

    // Se não houver token, redireciona para login imediatamente
    if (!token) {
        alert("Sua sessão expirou ou você não está logado.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(API_MEUS_SORTEIOS, {
            method: 'GET',
            headers: {
                // Passando o JWT token no cabeçalho para o @AuthenticationPrincipal do Spring Security
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error("Não autorizado. Faça login novamente.");
        }

        if (!response.ok) {
            throw new Error('Erro ao buscar sorteios.');
        }

        const sorteios = await response.json();
        container.innerHTML = ''; // Limpa a mensagem de carregamento

        if (sorteios.length === 0) {
            container.innerHTML = '<p>Você ainda não está participando de nenhum sorteio.</p>';
            return;
        }

        sorteios.forEach(sorteio => {
            const urlFotoCapa = `${BASE_URL}/imagem/sorteio/${sorteio.id}/foto-capa`;
            const statusFormatado = sorteio.statusSorteio ? sorteio.statusSorteio.replace('_', ' ') : 'DESCONHECIDO';

            const cardHtml = `
                <div class="card-sorteio">
                    <div class="card-capa-container">
                        <img src="${urlFotoCapa}" alt="Capa de ${sorteio.nomeSorteio}" 
                             onerror="this.src='https://placehold.co/600x350/000066/FFFFFF?text=Sem+Capa'">
                    </div>

                    <div class="card-info">
                        <h3>${sorteio.nomeSorteio}</h3>
                        <p class="descricao">Status: <strong>${statusFormatado}</strong></p>
                    </div>
                    <div class="card-footer">
                        <button onclick="verDetalhes(${sorteio.id})" class="btn-participar">Ver Sorteio</button>
                    </div>
                </div>
            `;
            
            container.innerHTML += cardHtml;
        });

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = `<p style="color: #ff4a4a;">${error.message}</p>`;
        
        // Se for erro de autorização, limpa o token quebrado e manda pro login
        if (error.message.includes("Não autorizado")) {
            sessionStorage.removeItem("token");
            setTimeout(() => { window.location.href = "login.html"; }, 2000);
        }
    }
}

// Função de navegação para a tela de detalhes
function verDetalhes(id) {
    window.location.href = `detalhes_sorteio.html?id=${id}`;
}

// Função simples para o botão "Sair" do cabeçalho
function sair() {
    sessionStorage.removeItem("token");
    window.location.href = "login.html";
}

// Executa a carga assim que a tela abre
document.addEventListener('DOMContentLoaded', carregarMeusSorteios);