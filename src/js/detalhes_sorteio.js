const urlParams = new URLSearchParams(window.location.search);
const sorteioId = urlParams.get('id') || 1;

// Token do usuário logado (pode ser null se não estiver logado)
const TOKEN = sessionStorage.getItem('token');

// Dados do usuário extraídos do JWT
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
        return null;
    }
}

const jwtPayload = parseJwt(TOKEN);

// ─────────────────────────────────────────────────────────────────
//  CARREGAMENTO PRINCIPAL
// ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoSorteio(sorteioId);
});

async function carregarDadosDoSorteio(id) {
    try {
        const response = await fetch(`${BASE_URL}/sorteio/${id}`);
        if (!response.ok) throw new Error('Sorteio não encontrado.');

        const sorteio = await response.json();

        // Dados básicos
        document.getElementById('nome-sorteio').textContent = sorteio.nomeSorteio;
        document.getElementById('desc-sorteio').textContent = sorteio.descricao || 'Nenhuma descrição cadastrada.';
        document.getElementById('status-sorteio').textContent =
            sorteio.statusSorteio ? sorteio.statusSorteio.replace('_', ' ') : '';

        // Capa
        const imgCapa = document.getElementById('img-capa');
        imgCapa.src = `${BASE_URL}/imagem/sorteio/${id}/foto-capa`;
        imgCapa.onerror = function () {
            this.src = 'https://placehold.co/800x350/000066/FFFFFF?text=Sem+Foto+de+Capa';
        };

        // Data de encerramento agendado
        if (sorteio.dataEncerramento) {
            const dataFormatada = new Date(sorteio.dataEncerramento).toLocaleString('pt-BR');
            const dataEl = document.getElementById('data-encerramento');
            if (dataEl) {
                dataEl.textContent = `⏰ Encerramento agendado: ${dataFormatada}`;
                dataEl.style.display = 'block';
            }
        }

        // Carrega galeria
        await carregarImagensExemplo(id);

        // Lida com o estado do sorteio (ativo vs encerrado)
        const encerrado = sorteio.statusSorteio === 'encerrado';
        renderizarAcoes(sorteio, encerrado, id);

        // Se encerrado, tenta exibir o ganhador
        if (encerrado) {
            await exibirGanhador(id);
        }

        // Mostra o conteúdo
        document.getElementById('loading').style.display = 'none';
        document.getElementById('detalhes-sorteio').style.display = 'flex';

    } catch (error) {
        console.error("Erro na API:", error);
        const loadingDiv = document.getElementById('loading');
        loadingDiv.className = 'error';
        loadingDiv.textContent = 'Ocorreu um erro ao carregar as informações do sorteio.';
    }
}

// ─────────────────────────────────────────────────────────────────
//  AÇÕES DINÂMICAS (participar / sortear)
// ─────────────────────────────────────────────────────────────────

function renderizarAcoes(sorteio, encerrado, id) {
    const acoesEl = document.getElementById('acoes-sorteio');
    if (!acoesEl) return;

    acoesEl.innerHTML = '';

    if (encerrado) {
        // Sorteio encerrado: não permite nenhuma ação
        const badge = document.createElement('div');
        badge.className = 'badge-encerrado';
        badge.textContent = '🔒 Sorteio Encerrado';
        acoesEl.appendChild(badge);
        return;
    }

    // Botão Participar (visível para usuários logados que não são o criador)
    if (TOKEN) {
        const btnParticipar = document.createElement('button');
        btnParticipar.className = 'btn-acao btn-participar-detalhe';
        btnParticipar.textContent = 'Participar do Sorteio';
        btnParticipar.onclick = () => participarSorteio(id);
        acoesEl.appendChild(btnParticipar);

        // Botão Sortear (visível apenas para criador ou admin)
        const isCriador = jwtPayload && sorteio.criadorId && jwtPayload.userId === sorteio.criadorId;
        const isAdmin   = jwtPayload && jwtPayload.role === 'ROLE_ADMIN';

        if (isCriador || isAdmin) {
            const btnSortear = document.createElement('button');
            btnSortear.className = 'btn-acao btn-sortear';
            btnSortear.textContent = '🎲 Realizar Sorteio';
            btnSortear.onclick = () => realizarSorteio(id);
            acoesEl.appendChild(btnSortear);
        }
    } else {
        // Não logado: botão que redireciona para login
        const btnLogin = document.createElement('button');
        btnLogin.className = 'btn-acao btn-participar-detalhe';
        btnLogin.textContent = 'Faça login para participar';
        btnLogin.onclick = () => { window.location.href = 'login.html'; };
        acoesEl.appendChild(btnLogin);
    }
}

// ─────────────────────────────────────────────────────────────────
//  PARTICIPAR
// ─────────────────────────────────────────────────────────────────

async function participarSorteio(id) {
    try {
        const response = await fetch(`${BASE_URL}/sorteio/participa/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || 'Erro ao participar.');
        }

        alert('✅ Você está participando do sorteio!');
    } catch (error) {
        alert('⚠️ ' + error.message);
    }
}

// ─────────────────────────────────────────────────────────────────
//  REALIZAR SORTEIO (manual)
// ─────────────────────────────────────────────────────────────────

async function realizarSorteio(id) {
    if (!confirm('Confirma a realização do sorteio? Esta ação não pode ser desfeita.')) return;

    try {
        const response = await fetch(`${BASE_URL}/sorteio/sortear/${id}`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || 'Erro ao realizar o sorteio.');
        }

        const ganhador = await response.json();

        // Exibe resultado e recarrega a página para refletir o estado encerrado
        alert(`🏆 Sorteio realizado!\nGanhador: ${ganhador.nome} (${ganhador.email})`);
        window.location.reload();

    } catch (error) {
        alert('⚠️ ' + error.message);
    }
}

// ─────────────────────────────────────────────────────────────────
//  EXIBIR GANHADOR
// ─────────────────────────────────────────────────────────────────

async function exibirGanhador(id) {
    try {
        const response = await fetch(`${BASE_URL}/sorteio/ganhador/${id}`);
        if (!response.ok) return; // Sem ganhador ainda (sorteio encerrado sem participantes)

        const ganhador = await response.json();

        const ganhadorEl = document.getElementById('ganhador-container');
        if (!ganhadorEl) return;

        ganhadorEl.innerHTML = `
            <div class="ganhador-box">
                <span class="ganhador-trofel">🏆</span>
                <div class="ganhador-info">
                    <span class="ganhador-label">Ganhador</span>
                    <span class="ganhador-nome">${ganhador.nome}</span>
                    <span class="ganhador-email">${ganhador.email}</span>
                </div>
            </div>
        `;
        ganhadorEl.style.display = 'block';

    } catch (error) {
        console.error('Erro ao buscar ganhador:', error);
    }
}

// ─────────────────────────────────────────────────────────────────
//  GALERIA DE FOTOS
// ─────────────────────────────────────────────────────────────────

async function carregarImagensExemplo(sorteioId) {
    try {
        const response = await fetch(`${BASE_URL}/imagem/sorteio/${sorteioId}/fotos`);
        if (!response.ok) return;

        const idsDasFotos = await response.json();
        const galeriaContainer = document.getElementById('galeria-fotos');

        const ultimasTresFotos = idsDasFotos.slice(0, 3);

        if (ultimasTresFotos.length === 0) {
            galeriaContainer.innerHTML =
                '<p style="color: rgba(255,255,255,0.5);">Nenhuma foto de exemplo anexada.</p>';
            return;
        }

        ultimasTresFotos.forEach(fotoId => {
            const imgElement = document.createElement('img');
            imgElement.src = `${BASE_URL}/imagem/${fotoId}`;
            imgElement.alt = `Exemplo de prêmio ${fotoId}`;
            imgElement.onerror = function () {
                this.src = 'https://placehold.co/300/000066/FFFFFF?text=Erro+na+Imagem';
            };
            galeriaContainer.appendChild(imgElement);
        });

    } catch (error) {
        console.error("Erro ao buscar a lista de fotos:", error);
    }
}