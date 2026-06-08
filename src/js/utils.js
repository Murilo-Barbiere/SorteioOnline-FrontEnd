const BASE_URL = 'http://localhost:8080';

// ── Token ──────────────────────────────────────────────────────────────────

function getToken() {
    return sessionStorage.getItem('token');
}

function authHeaders() {
    return {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
    };
}

function parseJwt(token) {
    try {
        if (!token) return null;
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(
            window.atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        ));
    } catch {
        return null;
    }
}

function getUsuarioLogado() {
    return parseJwt(getToken());
}

function isLogado() {
    const payload = getUsuarioLogado();
    if (!payload) return false;
    // Verifica expiração
    return payload.exp * 1000 > Date.now();
}

function logout() {
    sessionStorage.removeItem('token');
    window.location.href = resolveRaiz('src/pages/login.html');
}

// ── Resolução de caminho relativo à raiz ────────────────────────────────────
// Permite que qualquer página use caminhos absolutos a partir da raiz do site

function resolveRaiz(caminho) {
    // Conta quantos níveis de profundidade a página atual está
    const partes = window.location.pathname.split('/').filter(Boolean);
    // Detecta se estamos dentro de /src/pages/ ou /src/ ou na raiz
    let prefixo = '';
    const pathname = window.location.pathname;
    if (pathname.includes('/src/pages/')) prefixo = '../../';
    else if (pathname.includes('/src/')) prefixo = '../';
    return prefixo + caminho;
}

// ── Header dinâmico ────────────────────────────────────────────────────────

function renderHeader() {
    const authLinks = document.querySelector('.auth-links');
    if (!authLinks) return;

    if (isLogado()) {
        const payload = getUsuarioLogado();
        const nome = payload.sub?.split('@')[0] || 'Usuário'; // usa email como fallback
        authLinks.innerHTML = `
            <a href="${resolveRaiz('src/pages/perfil.html')}" class="btn-usuario" title="Meu perfil">
                <span class="usuario-avatar">👤</span>
                <span class="usuario-nome" id="header-nome">${nome}</span>
            </a>
            <a href="#" onclick="logout()" class="btn-sair">Sair</a>
        `;
        // Busca o nome real na API
        fetch(`${BASE_URL}/usuario/${payload.userId}`, { headers: authHeaders() })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.nome) {
                    const el = document.getElementById('header-nome');
                    if (el) el.textContent = data.nome;
                }
            })
            .catch(() => {});
    } else {
        authLinks.innerHTML = `
            <a href="${resolveRaiz('src/pages/login.html')}">Entrar</a>
            <a href="${resolveRaiz('src/pages/registrar.html')}" class="btn-registrar">Registrar</a>
        `;
    }
}

// ── Sidebar ativo ──────────────────────────────────────────────────────────

function marcarSidebarAtivo() {
    const path = window.location.pathname;
    document.querySelectorAll('aside a').forEach(a => {
        a.classList.remove('active');
        const href = a.getAttribute('href') || '';
        if (href && path.endsWith(href.replace(/^\.\.\//, '').replace(/^\.\//, ''))) {
            a.classList.add('active');
        }
    });
}

// ── Toast / notificação ────────────────────────────────────────────────────

function toast(msg, tipo = 'success') {
    const el = document.createElement('div');
    el.className = `toast toast-${tipo}`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast-show'));
    setTimeout(() => {
        el.classList.remove('toast-show');
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

// ── Modal genérico ─────────────────────────────────────────────────────────

function abrirModal(id) {
    const m = document.getElementById(id);
    if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function fecharModal(id) {
    const m = document.getElementById(id);
    if (m) { m.style.display = 'none'; document.body.style.overflow = ''; }
}

// Fechar modal clicando no overlay
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) fecharModal(e.target.id);
});

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    marcarSidebarAtivo();
});