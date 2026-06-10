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

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    capaArea.addEventListener('click', () => inputCapa.click());

    inputCapa.addEventListener('change', () => {
        const file = inputCapa.files[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            toast('A imagem de capa não pode ser maior que 5MB.', 'error');
            inputCapa.value = '';
            return;
        }

        capaPreview.src = URL.createObjectURL(file);
        capaPreview.style.display = 'block';
        capaPlaceh.style.display  = 'none';
    });

    // ── Fotos extras ─────────────────────────────────────────────────────────
    document.querySelectorAll('.foto-slot').forEach(slot => {
        const input = slot.querySelector('.input-foto-extra');

        // Facilita o clique no slot para abrir o seletor de arquivos
        slot.addEventListener('click', (e) => {
            if (e.target !== input) input.click();
        });

        input.addEventListener('change', () => {
            const file = input.files[0];
            if (!file) return;
            
            if (file.size > MAX_FILE_SIZE) {
                toast('A imagem extra não pode ser maior que 5MB.', 'error');
                input.value = '';
                return;
            }

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

        const nome = document.getElementById('nome-sorteio').value.trim();
        const descricao = document.getElementById('desc-sorteio').value.trim();
        const status = document.getElementById('status-sorteio').value;
        const dataEncerramento = document.getElementById('data-encerramento').value;

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

            if (!id) throw new Error('Erro: O servidor não retornou o ID do sorteio.');

            // Função auxiliar para deletar sorteio se algo der errado (rollback)
            const rollbackSorteio = async () => {
                await fetch(`${BASE_URL}/sorteio/${id}`, { 
                    method: 'DELETE', 
                    headers: authHeaders() 
                }).catch(() => {});
            };

            // 2. Upload de foto de capa (se houver)
            const fileCapa = inputCapa.files[0];
            if (fileCapa) {
                const fd = new FormData();
                fd.append('arquivo', fileCapa);
                try {
                    const resCapa = await fetch(`${BASE_URL}/imagem/sorteio/${id}/foto-capa`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${getToken()}` },
                        body: fd,
                    });
                    if (!resCapa.ok) {
                        const msg = await resCapa.text();
                        await rollbackSorteio();
                        throw new Error(msg || 'Erro ao enviar a imagem de capa.');
                    }
                } catch (err) {
                    if (err.message.includes('Erro ao enviar')) throw err;
                    await rollbackSorteio();
                    throw new Error('Falha na comunicação ao enviar a capa.');
                }
            }

            // 3. Upload de fotos extras (até 3)
            const inputsFotos = document.querySelectorAll('.input-foto-extra');
            for (const input of inputsFotos) {
                const file = input.files[0];
                if (!file) continue;
                
                const fd = new FormData();
                fd.append('arquivo', file);
                try {
                    const resExtra = await fetch(`${BASE_URL}/imagem/sorteio/${id}/fotos`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${getToken()}` },
                        body: fd,
                    });
                    if (!resExtra.ok) {
                        const msg = await resExtra.text();
                        await rollbackSorteio();
                        throw new Error(msg || 'Erro ao enviar uma das fotos extras.');
                    }
                } catch (err) {
                    if (err.message.includes('Erro ao enviar')) throw err;
                    await rollbackSorteio();
                    throw new Error('Falha na comunicação ao enviar fotos extras.');
                }
            }

            toast('Sorteio criado com sucesso! 🎉', 'success');

            setTimeout(() => {
                window.location.href = resolveRaiz('src/pages/meus_sorteios.html');
            }, 1500);

        } catch (err) {
            toast(err.message, 'error');
            btn.disabled = false;
            btn.querySelector('span').textContent = 'Criar Sorteio';
        }
    });
})();