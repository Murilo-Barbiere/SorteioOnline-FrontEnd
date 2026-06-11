(function () {
    if (!isLogado()) {
        window.location.href = resolveRaiz('src/pages/login.html');
        return;
    }

    // ── Upload de capa ───────────────────────────────────────────────────────
    const capaArea     = document.getElementById('capa-upload-area');
    const capaPreview  = document.getElementById('capa-preview');
    const capaPlaceh   = document.getElementById('capa-placeholder');
    const inputCapa    = document.getElementById('input-capa');

    capaArea.addEventListener('click', () => inputCapa.click());

    inputCapa.addEventListener('change', () => {
        const file = inputCapa.files[0];
        if (!file) return;
        capaPreview.src = URL.createObjectURL(file);
        capaPreview.style.display = 'block';
        capaPlaceh.style.display  = 'none';
    });

    // ── Fotos extras ─────────────────────────────────────────────────────────
    document.querySelectorAll('.foto-slot').forEach(slot => {
        const input = slot.querySelector('.input-foto-extra');
        input.addEventListener('change', () => {
            const file = input.files[0];
            if (!file) return;
            // Remove span de "+"
            slot.querySelector('span')?.remove();
            // Preview
            let img = slot.querySelector('img');
            if (!img) { img = document.createElement('img'); slot.prepend(img); }
            img.src = URL.createObjectURL(file);
        });
    });

    // ── Envio do formulário ──────────────────────────────────────────────────
    document.getElementById('form-criar').addEventListener('submit', async e => {
        e.preventDefault();

        const nome             = document.getElementById('nome-sorteio').value.trim();
        const descricao        = document.getElementById('desc-sorteio').value.trim();
        const status           = document.getElementById('status-sorteio').value;
        const dataEncerramento = document.getElementById('data-encerramento').value; // Captura a data final

        // Validação do nome
        if (!nome) {
            toast('O nome do sorteio é obrigatório.', 'error');
            document.getElementById('nome-sorteio').focus();
            return;
        }

        // Validação da data final
        if (!dataEncerramento) {
            toast('A data e hora de encerramento são obrigatórias.', 'error');
            document.getElementById('data-encerramento').focus();
            return;
        }

        const btn = document.getElementById('btn-criar');
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Criando…';

        try {
            // 1. Criar o sorteio enviando os dados e a data final
            const res = await fetch(`${BASE_URL}/sorteio`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ nome, descricao, status, dataEncerramento }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Erro ao criar sorteio.');
            }

            const sorteio = await res.json();
            const id = sorteio.id;
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



        // Condicional para exibir o botão de sorteio apenas se ele não estiver encerrado ainda

        const btnSortearDinamico = sorteio.statusSorteio !== 'encerrado'

            ? `<button class="btn-sortear-card" onclick="realizarSorteio(${sorteio.id})">🎲 Sortear</button>`

            : '';



        const acoes = modoEditor

            ? `<div class="card-footer card-owner-acoes">

                   <button class="btn-editar-card" onclick="abrirEdicao(${sorteio.id})">✏️ Editar</button>

                   ${btnSortearDinamico}

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



        // Validação de arquivo se houver um selecionado

        const erroArquivo = validarArquivoImagem(arquivo);

        if (erroArquivo) {

            toast(erroArquivo, 'error');

            return;

        }



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



    // ── Disparar Ação de Sortear Manualmente (Novo) ───────────────────────────

    window.realizarSorteio = async function (idSorteio) {

        if (!confirm('Deseja realmente realizar este sorteio agora? O sistema escolherá um vencedor e disparará as notificações por e-mail.')) return;



        try {

            const res = await fetch(`${BASE_URL}/sorteio/sortear/${idSorteio}`, {

                method: 'GET',

                headers: authHeaders()

            });



            if (!res.ok) {

                const msg = await res.text();

                throw new Error(msg || 'Não foi possível realizar o sorteio.');

            }



            const ganhador = await res.json();

            toast(`Sorteio concluído! Vencedor(a): ${ganhador.nome} 🎉`, 'success');

            

            // Recarrega a aba de criados para sumir com o botão "Sortear" e mudar o status para encerrado

            carregarCriados(); 

        } catch (err) {

            toast(err.message, 'error');

        }

    };



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
            // 2. Upload de foto de capa (se houver)
            const fileCapa = inputCapa.files[0];
            if (fileCapa) {
                const fd = new FormData();
                fd.append('arquivo', fileCapa);
                await fetch(`${BASE_URL}/imagem/sorteio/${id}/foto-capa`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${getToken()}` },
                    body: fd,
                }).catch(() => {}); // Falha silenciosa — sorteio já foi criado
            }

            // 3. Upload de fotos extras (até 3)
            const inputsFotos = document.querySelectorAll('.input-foto-extra');
            for (const input of inputsFotos) {
                const file = input.files[0];
                if (!file) continue;
                const fd = new FormData();
                fd.append('arquivo', file);
                await fetch(`${BASE_URL}/imagem/sorteio/${id}/fotos`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${getToken()}` },
                    body: fd,
                }).catch(() => {});
            }

            toast('Sorteio criado com sucesso! 🎉', 'success');
            setTimeout(() => {
                window.location.href = resolveRaiz('src/pages/meus_sorteios.html');
            }, 1200);

        } catch (err) {
            toast(err.message, 'error');
            btn.disabled = false;
            btn.querySelector('span').textContent = 'Criar Sorteio';
        }
    });
})();