/**
 * detalhes_sorteio.js — Tela de detalhes de um sorteio
 * Requer: utils.js
 */

(function () {
    const params    = new URLSearchParams(window.location.search);
    const sorteioId = params.get('id');

    if (!sorteioId) {
        document.getElementById('loading').innerHTML =
            '<p style="color:#ff8080;">ID do sorteio não informado.</p>';
        return;
    }

    // ── Carregar dados ────────────────────────────────────────────────────────
    async function carregarSorteio() {
        try {
            const res = await fetch(`${BASE_URL}/sorteio/${sorteioId}`);
            if (!res.ok) throw new Error('Sorteio não encontrado.');
            const sorteio = await res.json();

            // Preenche dados
            document.getElementById('nome-sorteio').textContent =
                sorteio.nomeSorteio || 'Sem nome';

            const statusEl = document.getElementById('status-sorteio');
            const status   = (sorteio.statusSorteio || 'ativo').replace('_', ' ');
            statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusEl.className   = 'badge-status ' +
                (sorteio.statusSorteio === 'encerrado' ? 'badge-enc' : 'badge-ativo');

            document.getElementById('desc-sorteio').textContent =
                sorteio.descricao || 'Nenhuma descrição fornecida.';

            // Foto de capa
            const imgCapa  = document.getElementById('img-capa');
            imgCapa.src    = `${BASE_URL}/imagem/sorteio/${sorteioId}/foto-capa`;
            imgCapa.onerror = () => {
                imgCapa.src = 'https://placehold.co/900x400/000066/FFFFFF?text=Sem+Capa';
            };

            // Botão participar — só aparece se logado e sorteio ativo
            if (isLogado() && sorteio.statusSorteio !== 'encerrado') {
                document.getElementById('acoes-sorteio').style.display = '';
            }

            // Galeria
            await carregarGaleria();

            // Exibe conteúdo
            document.getElementById('loading').style.display  = 'none';
            document.getElementById('detalhes-sorteio').style.display = 'flex';

        } catch (err) {
            const loading = document.getElementById('loading');
            loading.innerHTML = `<p style="color:#ff8080;">${err.message}</p>`;
        }
    }

    // ── Galeria de fotos extras ───────────────────────────────────────────────
    async function carregarGaleria() {
        const container = document.getElementById('galeria-fotos');
        try {
            const res = await fetch(`${BASE_URL}/imagem/sorteio/${sorteioId}/fotos`);
            if (!res.ok) return;
            const ids = await res.json();

            if (ids.length === 0) {
                container.innerHTML =
                    '<p style="color:rgba(255,255,255,0.4);font-size:0.9rem;">Nenhuma foto extra anexada.</p>';
                return;
            }

            ids.slice(0, 3).forEach(fotoId => {
                const img   = document.createElement('img');
                img.src     = `${BASE_URL}/imagem/${fotoId}`;
                img.alt     = `Foto ${fotoId}`;
                img.onerror = () => {
                    img.src = 'https://placehold.co/300/000066/FFFFFF?text=Foto';
                };
                container.appendChild(img);
            });
        } catch {
            // Falha silenciosa
        }
    }

    // ── Participar ────────────────────────────────────────────────────────────
    window.participarSorteio = async function () {
        if (!isLogado()) {
            window.location.href = resolveRaiz('src/pages/login.html');
            return;
        }

        const btn = document.getElementById('btn-participar');
        btn.disabled = true;
        btn.textContent = 'Entrando…';

        try {
            const res = await fetch(`${BASE_URL}/sorteio/participa/${sorteioId}`, {
                method: 'POST',
                headers: authHeaders(),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Não foi possível participar.');
            }

            btn.textContent = '✅ Participando!';
            btn.style.borderColor = '#00e888';
            btn.style.color       = '#00e888';
            toast('Você está participando do sorteio! 🎉', 'success');
        } catch (err) {
            btn.disabled    = false;
            btn.textContent = '🎟️ Participar do Sorteio';
            toast(err.message, 'error');
        }
    };

    // ── Init ─────────────────────────────────────────────────────────────────
    carregarSorteio();
})();