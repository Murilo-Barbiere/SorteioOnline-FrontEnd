(function () {
    // ── Guarda de rota ──────────────────────────────────────────────────────
    if (!isLogado()) {
        window.location.href = resolveRaiz('src/pages/login.html');
        return;
    }

    const payload = getUsuarioLogado();
    const userId = payload.userId;

    // ── Elementos ───────────────────────────────────────────────────────────
    const avatarImg       = document.getElementById('avatar-img');
    const nomeTitle       = document.getElementById('perfil-nome-titulo');
    const emailSub        = document.getElementById('perfil-email-titulo');
    const inputNome       = document.getElementById('input-nome');
    const inputEmail      = document.getElementById('input-email');
    const inputSenha      = document.getElementById('input-senha');
    const grupoSenha      = document.getElementById('grupo-senha');
    const formAcoes       = document.getElementById('form-acoes');
    const btnEditarToggle = document.getElementById('btn-editar-toggle');
    const btnCancelar     = document.getElementById('btn-cancelar');
    const btnTrocarFoto   = document.getElementById('btn-trocar-foto');
    const inputFoto       = document.getElementById('input-foto');
    const form            = document.getElementById('form-perfil');

    let dadosOriginais = {};

    // ── Carregar dados do usuário ────────────────────────────────────────────
    async function carregarPerfil() {
        try {
            const res = await fetch(`${BASE_URL}/usuario/${userId}`, {
                headers: authHeaders()
            });
            if (!res.ok) throw new Error('Não foi possível carregar o perfil.');

            const data = await res.json();
            dadosOriginais = data;

            nomeTitle.textContent  = data.nome;
            emailSub.textContent   = data.email;
            inputNome.value        = data.nome;
            inputEmail.value       = data.email;
        } catch (err) {
            toast(err.message, 'error');
        }
    }

    // ── Carregar foto de perfil ──────────────────────────────────────────────
    async function carregarFoto() {
        try {
            const res = await fetch(`${BASE_URL}/imagem/usuario/${userId}/foto-perfil`);
            if (res.ok) {
                const blob = await res.blob();
                avatarImg.src = URL.createObjectURL(blob);
            }
        } catch {
            // fallback padrão já está no src do img
        }
    }

    // ── Modo de edição ───────────────────────────────────────────────────────
    function entrarModoEdicao() {
        inputNome.disabled  = false;
        inputEmail.disabled = false;
        grupoSenha.style.display = '';
        formAcoes.style.display  = '';
        btnTrocarFoto.style.display = '';
        btnEditarToggle.textContent = '✏️ Editando';
        inputNome.focus();
    }

    function sairModoEdicao() {
        inputNome.disabled  = true;
        inputEmail.disabled = true;
        grupoSenha.style.display = 'none';
        formAcoes.style.display  = 'none';
        btnTrocarFoto.style.display = 'none';
        btnEditarToggle.textContent = '✏️ Editar';
        // Restaura valores
        inputNome.value  = dadosOriginais.nome  || '';
        inputEmail.value = dadosOriginais.email || '';
        inputSenha.value = '';
    }

    btnEditarToggle.addEventListener('click', entrarModoEdicao);
    btnCancelar.addEventListener('click', sairModoEdicao);

    // ── Salvar alterações ────────────────────────────────────────────────────
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const nome  = inputNome.value.trim();
        const email = inputEmail.value.trim();
        const senha = inputSenha.value;

        if (!nome || !email) {
            toast('Nome e e-mail são obrigatórios.', 'error');
            return;
        }

        // A API exige senha no body; se não foi digitada, reusa a original
        // (que não temos — então pedimos ao usuário)
        if (!senha) {
            toast('Digite uma senha (mesmo que seja a atual) para salvar.', 'info');
            inputSenha.focus();
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/usuario/${userId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ nome, email, senha }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Erro ao salvar.');
            }

            dadosOriginais = { nome, email };
            nomeTitle.textContent = nome;
            emailSub.textContent  = email;
            sairModoEdicao();
            toast('Perfil atualizado com sucesso!', 'success');
        } catch (err) {
            toast(err.message, 'error');
        }
    });

    // ── Trocar foto de perfil ────────────────────────────────────────────────
    btnTrocarFoto.addEventListener('click', () => inputFoto.click());

    inputFoto.addEventListener('change', async () => {
        const arquivo = inputFoto.files[0];
        if (!arquivo) return;

        const erro = validarArquivoImagem(arquivo);
        if (erro) {
            toast(erro, 'error');
            return;
        }

        const formData = new FormData();
        formData.append('arquivo', arquivo);

        try {
            const res = await fetch(`${BASE_URL}/imagem/usuario/${userId}/foto-perfil`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData,
            });

            if (!res.ok) throw new Error('Falha no upload da foto.');

            // Atualiza preview localmente
            avatarImg.src = URL.createObjectURL(arquivo);
            toast('Foto de perfil atualizada!', 'success');
        } catch (err) {
            toast(err.message, 'error');
        }
    });

    // ── Excluir conta ────────────────────────────────────────────────────────
    document.getElementById('btn-excluir-conta').addEventListener('click', () => {
        document.getElementById('confirmacao-excluir').value = '';
        abrirModal('modal-excluir');
    });

    document.getElementById('btn-confirmar-excluir').addEventListener('click', async () => {
        const confirmacao = document.getElementById('confirmacao-excluir').value;
        if (confirmacao !== 'EXCLUIR') {
            toast('Digite exatamente "EXCLUIR" para confirmar.', 'error');
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/usuario/${userId}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });

            if (!res.ok) throw new Error('Erro ao excluir conta.');

            fecharModal('modal-excluir');
            logout();
        } catch (err) {
            toast(err.message, 'error');
        }
    });

    // ── Init ─────────────────────────────────────────────────────────────────
    carregarPerfil();
    carregarFoto();
})();