/**
 * index.js — Página inicial: lista de sorteios disponíveis
 * Requer: utils.js
 */

async function carregarSorteios() {
    const container = document.getElementById('container-cards');
    if (!container) return;

    try {
        const res = await fetch(`${BASE_URL}/sorteio/lista_sorteios`);
        if (!res.ok) throw new Error('Erro na requisição');

        const sorteios = await res.json();
        container.innerHTML = '';

        if (sorteios.length === 0) {
            container.innerHTML = '<p style="color:rgba(255,255,255,0.5);">Nenhum sorteio disponível no momento.</p>';
            return;
        }

        sorteios.forEach(sorteio => {
            const urlCapa   = `${BASE_URL}/imagem/sorteio/${sorteio.id}/foto-capa`;
            const statusFmt = (sorteio.statusSorteio || 'ativo').replace('_', ' ');

            container.innerHTML += `
                <div class="card-sorteio">
                    <div class="card-capa-container">
                        <img src="${urlCapa}" alt="Capa de ${sorteio.nomeSorteio || 'Sorteio'}"
                             onerror="this.src='https://placehold.co/600x350/000066/FFFFFF?text=Sem+Capa'">
                    </div>
                    <div class="card-info">
                        <h3>${sorteio.nomeSorteio || 'Sorteio Sem Nome'}</h3>
                        <p class="descricao">${statusFmt}</p>
                    </div>
                    <div class="card-footer">
                        <button onclick="irParaDetalhes(${sorteio.id})" class="btn-participar">
                            Ver Sorteio
                        </button>
                    </div>
                </div>`;
        });

    } catch (err) {
        console.error('Erro ao carregar sorteios:', err);
        container.innerHTML = `<p style="color:#ff8080;">Erro ao carregar sorteios. Verifique a conexão com o servidor.</p>`;
    }
}

function irParaDetalhes(id) {
    window.location.href = `src/pages/detalhes_sorteio.html?id=${id}`;
}

document.addEventListener('DOMContentLoaded', carregarSorteios);