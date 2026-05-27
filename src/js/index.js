const API_URL = 'http://localhost:8080/sorteio/lista_sorteios';

async function carregarSorteios() {
    const container = document.getElementById('container-cards');
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro na requisição');
        
        const sorteios = await response.json();
        container.innerHTML = '';

        if (sorteios.length === 0) {
            container.innerHTML = '<p>Nenhum sorteio disponível no momento.</p>';
            return;
        }

        sorteios.forEach(sorteio => {

            const cardHtml = `
                <div class="card-sorteio">
                    <div class="card-info">
                        <h3>${sorteio.nomeSorteio}</h3>
                        <p class="descricao">${sorteio.statusSorteio}</p>
                    </div>
                    <div class="card-footer">
                        <button onclick="verificarAcesso()" class="btn-participar">Participar</button>
                    </div>
                </div>
            `;
            
            container.innerHTML += cardHtml;
        });

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = `<p style="color: #ff4a4a;">Erro ao carregar sorteios.</p>`;
    }
}

function verificarAcesso() {
    const token = sessionStorage.getItem('token');

    if (!token) {
        window.location.href = "pages/login.html";
    } else {
        window.location.href = "pages/testeAuth.html";
    }
}

document.addEventListener('DOMContentLoaded', carregarSorteios);