const BASE_URL = 'http://localhost:8080';

const urlParams = new URLSearchParams(window.location.search);
const sorteioId = urlParams.get('id') || 1; 

document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoSorteio(sorteioId);
});

async function carregarDadosDoSorteio(id) {
    try {
        const response = await fetch(`${BASE_URL}/sorteio/${id}`);
        if (!response.ok) throw new Error('Sorteio não encontrado.');
        
        const sorteio = await response.json();

        document.getElementById('nome-sorteio').textContent = sorteio.nomeSorteio;
        document.getElementById('desc-sorteio').textContent = sorteio.descricao;
        document.getElementById('status-sorteio').textContent = sorteio.statusSorteio.replace('_', ' '); // Formata o enum

        const imgCapa = document.getElementById('img-capa');
        imgCapa.src = `${BASE_URL}/imagem/sorteio/${id}/foto-capa`;

        imgCapa.onerror = function() {
            this.src = 'https://via.placeholder.com/800x350/000066/FFFFFF?text=Sem+Foto+de+Capa';
        };

        await carregarImagensExemplo(id);

        document.getElementById('loading').style.display = 'none';
        document.getElementById('detalhes-sorteio').style.display = 'flex';

    } catch (error) {
        console.error("Erro na API:", error);
        const loadingDiv = document.getElementById('loading');
        loadingDiv.className = 'error';
        loadingDiv.textContent = 'Ocorreu um erro ao carregar as informações do sorteio.';
    }
}

async function carregarImagensExemplo(sorteioId) {
    try {
        const response = await fetch(`${BASE_URL}/imagem/sorteio/${sorteioId}/fotos`);
        if (!response.ok) return;

        const idsDasFotos = await response.json(); // Array de Long [1, 2, 3, 4...]
        const galeriaContainer = document.getElementById('galeria-fotos');
        
        // Pegamos apenas os 3 primeiros IDs, conforme solicitado
        const ultimasTresFotos = idsDasFotos.slice(0, 3);

        if (ultimasTresFotos.length === 0) {
            galeriaContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Nenhuma foto de exemplo anexada.</p>';
            return;
        }

        ultimasTresFotos.forEach(fotoId => {
            const imgElement = document.createElement('img');
            imgElement.src = `${BASE_URL}/imagem/${fotoId}`;
            imgElement.alt = `Exemplo de prêmio ${fotoId}`;
            
            imgElement.onerror = function() {
                this.src = 'https://via.placeholder.com/300/000066/FFFFFF?text=Erro+na+Imagem';
            };

            galeriaContainer.appendChild(imgElement);
        });

    } catch (error) {
        console.error("Erro ao buscar a lista de fotos:", error);
    }
}