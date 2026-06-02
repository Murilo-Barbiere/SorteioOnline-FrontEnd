const API_URL = 'http://localhost:8080/sorteio/lista_sorteios';
const BASE_URL = 'http://localhost:8080'; 

async function carregarSorteios() {
    const container = document.getElementById('container-cards');
    
    if (!container) return; // Garante que o container existe na tela

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
            // CORREÇÃO: Alinhado com o seu detalhes_sorteio.js (/imagem/sorteio/{id}/foto-capa)
            const urlFotoCapa = `${BASE_URL}/imagem/sorteio/${sorteio.id}/foto-capa`;
            
            // Tratamento seguro para o status do sorteio
            const statusFormatado = sorteio.statusSorteio ? sorteio.statusSorteio.replace('_', ' ') : 'DISPONÍVEL';

            const cardHtml = `
                <div class="card-sorteio">
                    <div class="card-capa-container">
                        <img src="${urlFotoCapa}" alt="Capa de ${sorteio.nomeSorteio || 'Sorteio'}" 
                             onerror="this.src='https://placehold.co/600x350/000066/FFFFFF?text=Sem+Capa'">
                    </div>

                    <div class="card-info">
                        <h3>${sorteio.nomeSorteio || 'Sorteio Sem Nome'}</h3>
                        <p class="descricao">${statusFormatado}</p>
                    </div>
                    <div class="card-footer">
                        <button onclick="verificarAcesso(${sorteio.id})" class="btn-participar">Participar</button>
                    </div>
                </div>
            `;
            
            container.innerHTML += cardHtml;
        });

    } catch (error) {
        console.error('Erro ao carregar sorteios:', error);
        container.innerHTML = `<p style="color: #ff4a4a;">Erro ao carregar sorteios. Verifique a conexão com o backend.</p>`;
    }
}

function verificarAcesso(id) {
    const token = sessionStorage.getItem('token');

    if (!token) {
        window.location.href = "src/pages/login.html";
    } else {
        window.location.href = `src/pages/detalhes_sorteio.html?id=${id}`;
    }
}

document.addEventListener('DOMContentLoaded', carregarSorteios);