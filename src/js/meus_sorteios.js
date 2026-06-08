/**
 * meus_sorteios.js — Sorteios criados pelo usuário + sorteios que participa
 * Requer: utils.js
 */

(function () {
    if (!isLogado()) {
        window.location.href = resolveRaiz('src/pages/login.html');
        return;
    }

    // ── Tabs ─────────────────────────────────────────────────────────────────
    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');

            const tab = btn.dataset.tab;
            document.getElementById('secao-criados').style.display     = tab === 'criados'      ? '' : 'none';
            document.getElementById('secao-participando').style.display = tab === 'participando' ? '' : 'none';
        });
    });

    // ── Helpers de card ───────────────────────────────────────────────────────
    function cardHTML(sorteio, modoEditor = false) {
        const urlCapa   = `${BASE_URL}/imagem/sorteio/${sorteio.id}/foto-capa`;
        const statusFmt = (sorteio.statusSorteio || 'ativo').replace('_', ' ');
        const statusCls = sorteio.statusSorteio === 'encerrado' ? 'status-enc' : 'status-ativo';

        const acoes = modoEditor
            ? `<div class="card-footer card-owner-acoes">
                   <button class="btn-editar-card" onclick="abrirEdicao(${sorteio.id})">✏️ Editar</button>
                   <button class="btn-participar btn-ver-card"
                           onclick="window.location.href=resolveRaiz('src/pages/detalhes_sorteio.html?id=${sorteio.id}')">
                       Ver detalhes
                   </button>
               </div>`
            : `<div class="card-footer card-participante-acoes">
                   <button class="btn-participar"
                           onclick="window.location.href=resolveRaiz('src/pages/detalhes_sorteio.html?id=${sorteio.id}')">
                       Ver Sorteio
                   </button>
                   <button class="btn-sair-sorteio" onclick="sairDoSorteio(${sorteio.id})">
                       🚪 Sair do Sorteio
                   </button>
               </div>`;

        return `
            <div class="card-sorteio">
                <div class="card-capa-container">
                    <img src="${urlCapa}" alt="Capa"
                         onerror="this.src='https://placehold.co/600x350/000066/FFFFFF?text=Sem+Capa'">
                </div>
                <div class="card-info">
                    <h3>${sorteio.nomeSorteio || 'Sem nome'}</h3>
                    <p class="descricao ${statusCls}">Status: <strong>${statusFmt}</strong></p>
                </div>
                ${acoes}
            </div>`;
    }

    // ── Carregar sorteios CRIADOS ─────────────────────────────────────────────
    async function carregarCriados() {
        const container = document.getElementById('container-criados');
        try {
            const res = await fetch(`${BASE_URL}/sorteio/criados`, {
                headers: authHeaders()
            });
            if (!res.ok) throw new Error('Não foi possível carregar.');
            const sorteios = await res.json();

            container.innerHTML = '';
            if (sorteios.length === 0) {
                container.innerHTML = '<p class="empty-msg">Você ainda não criou nenhum sorteio.<br><a href="criar_sorteio.html" style="color:#fff;font-weight:600;">Criar meu primeiro sorteio →</a></p>';
                return;
            }
            sorteios.forEach(s => { container.innerHTML += cardHTML(s, true); });
        } catch (err) {
            container.innerHTML = `<p class="empty-msg" style="color:#ff8080;">${err.message}</p>`;
        }
    }

    // ── Carregar sorteios PARTICIPANDO ────────────────────────────────────────
    async function carregarParticipando() {
        const container = document.getElementById('container-participando');
        try {
            const res = await fetch(`${BASE_URL}/sorteio/participando`, {
                headers: authHeaders()
            });
            if (!res.ok) throw new Error('Não foi possível carregar.');
            const sorteios = await res.json();

            container.innerHTML = '';
            if (sorteios.length === 0) {
                container.innerHTML = '<p class="empty-msg">Você não está participando de nenhum sorteio ainda.</p>';
                return;
            }
            sorteios.forEach(s => { container.innerHTML += cardHTML(s, false); });
        } catch (err) {
            container.innerHTML = `<p class="empty-msg" style="color:#ff8080;">${err.message}</p>`;
        }
    }

    // ── Modal de edição ───────────────────────────────────────────────────────
    window.abrirEdicao = async function (id) {
        try {
            const res = await fetch(`${BASE_URL}/sorteio/${id}`);
            if (!res.ok) throw new Error('Sorteio não encontrado.');
            const s = await res.json();

            document.getElementById('edit-id').value     = id;
            document.getElementById('edit-nome').value   = s.nomeSorteio || '';
            document.getElementById('edit-desc').value   = s.descricao   || '';
            document.getElementById('edit-status').value = s.statusSorteio || 'ativo';

            abrirModal('modal-editar-sorteio');
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    document.getElementById('btn-salvar-edicao').addEventListener('click', async () => {
        const id      = document.getElementById('edit-id').value;
        const nome    = document.getElementById('edit-nome').value.trim();
        const desc    = document.getElementById('edit-desc').value.trim();
        const status  = document.getElementById('edit-status').value;
        const arquivo = document.getElementById('edit-capa').files[0];

        if (!nome) { toast('O nome é obrigatório.', 'error'); return; }

        try {
            const res = await fetch(`${BASE_URL}/sorteio/${id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ nome, descricao: desc, status }),
            });
            if (!res.ok) throw new Error(await res.text() || 'Erro ao salvar.');

            if (arquivo) {
                const fd = new FormData();
                fd.append('arquivo', arquivo);
                await fetch(`${BASE_URL}/imagem/sorteio/${id}/foto-capa`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${getToken()}` },
                    body: fd,
                }).catch(() => {});
            }

            fecharModal('modal-editar-sorteio');
            toast('Sorteio atualizado!', 'success');
            carregarCriados();
        } catch (err) {
            toast(err.message, 'error');
        }
    });

    // ── Sair do sorteio ───────────────────────────────────────────────────────
    window.sairDoSorteio = async function (idSorteio) {
        if (!confirm('Tem certeza que deseja sair deste sorteio?')) return;

        const payload = getUsuarioLogado();
        const userId  = payload?.userId;

        if (!userId) {
            toast('Sessão expirada. Faça login novamente.', 'error');
            return;
        }

        try {
            const res = await fetch(
                `${BASE_URL}/sorteio/revome-participante/${userId}/${idSorteio}`,
                { method: 'GET', headers: authHeaders() }
            );

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Não foi possível sair do sorteio.');
            }

            toast('Você saiu do sorteio com sucesso.', 'success');
            carregarParticipando(); // recarrega a lista sem a entrada removida
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    // ── Init ─────────────────────────────────────────────────────────────────
    carregarCriados();
    carregarParticipando();
})();