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

        const nome     = document.getElementById('nome-sorteio').value.trim();
        const descricao = document.getElementById('desc-sorteio').value.trim();
        const status   = document.getElementById('status-sorteio').value;

        if (!nome) {
            toast('O nome do sorteio é obrigatório.', 'error');
            document.getElementById('nome-sorteio').focus();
            return;
        }

        const btn = document.getElementById('btn-criar');
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Criando…';

        try {
            // 1. Criar o sorteio
            const res = await fetch(`${BASE_URL}/sorteio`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ nome, descricao, status }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Erro ao criar sorteio.');
            }

            const sorteio = await res.json();
            const id = sorteio.id;

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
