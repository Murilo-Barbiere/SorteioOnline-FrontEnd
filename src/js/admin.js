const URL_SORTEIO = 'http://localhost:8080/sorteio';
const URL_USUARIO = 'http://localhost:8080/usuario';
const BASE_URL = 'http://localhost:8080';
const token = sessionStorage.getItem('token');

const cabecalhosAutenticados = {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
};

/* ==========================================================================
   1. CONTROLE DAS ABAS (Alternar entre Sorteios e Usuários)
   ========================================================================== */
function alternarAba(aba) {
    const secaoSorteios = document.getElementById('secao-sorteios');
    const secaoUsuarios = document.getElementById('secao-usuarios');
    const menuSorteios = document.getElementById('menu-sorteios');
    const menuUsuarios = document.getElementById('menu-usuarios');

    if (!secaoSorteios || !secaoUsuarios) return;

    if (aba === 'sorteios') {
        secaoSorteios.style.display = 'block';
        secaoUsuarios.style.display = 'none';
        if (menuSorteios) menuSorteios.classList.add('active');
        if (menuUsuarios) menuUsuarios.classList.remove('active');
        carregarSorteiosAdmin();
    } else {
        secaoSorteios.style.display = 'none';
        secaoUsuarios.style.display = 'block';
        if (menuSorteios) menuSorteios.classList.remove('active');
        if (menuUsuarios) menuUsuarios.classList.add('active');
        carregarUsuariosAdmin();
    }
}

/* ==========================================================================
   2. GERENCIAR SORTEIOS (Estilo Cards Idêntico ao index.js + Botões)
   ========================================================================== */
async function carregarSorteiosAdmin() {
    const container = document.getElementById('lista-admin-sorteios');
    if (!container) return;

    try {
        const response = await fetch(`${URL_SORTEIO}/lista_sorteios`);
        if (!response.ok) throw new Error('Erro ao buscar sorteios da API');
        
        const sorteios = await response.json();
        container.innerHTML = '';

        if (!sorteios || sorteios.length === 0) {
            container.innerHTML = '<p>Nenhum sorteio disponível no momento.</p>';
            return;
        }

        sorteios.forEach(sorteio => {
            // Puxando a imagem de capa idêntica à lógica do seu index.js
            const urlFotoCapa = `${BASE_URL}/imagem/sorteio/${sorteio.id}/foto-capa`;
            
            // Tratamento duplo preventivo (aceita tanto nome quanto nomeSorteio)
            const nomeExibicao = sorteio.nomeSorteio || sorteio.nome || 'Sorteio Sem Nome';
            const statusRaw = sorteio.statusSorteio || sorteio.status || 'DISPONÍVEL';
            const statusFormatado = statusRaw.replace('_', ' ');

            const cardHtml = `
                <div class="card-sorteio" style="border: 1px solid #ccc; padding: 15px; margin: 10px; border-radius: 8px; background: #fff; display: inline-block; width: 280px; vertical-align: top;">
                    <div class="card-capa-container" style="height: 150px; overflow: hidden; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                        <img src="${urlFotoCapa}" alt="Capa de ${nomeExibicao}" style="width: 100%; height: 100%; object-fit: cover;"
                             onerror="this.src='https://placehold.co/600x350/000066/FFFFFF?text=Sem+Capa'">
                    </div>
                    <div class="card-info" style="padding: 10px 0;">
                        <h3 style="margin: 5px 0;">${nomeExibicao}</h3>
                        <p class="descricao" style="color: #666;">${statusFormatado}</p>
                        <p style="font-size:0.75rem; color:gray; margin: 5px 0;">ID: ${sorteio.id}</p>
                    </div>
                    <div class="card-footer" style="display: flex; gap: 10px; justify-content: center; padding-top: 10px; border-top: 1px solid #eee;">
                        <button onclick="editarSorteio(${sorteio.id}, '${nomeExibicao}')" style="background-color: #ffca28; color: #000; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">Editar</button>
                        <button onclick="deletarSorteio(${sorteio.id})" style="background-color: #ff4a4a; color: #fff; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">Excluir</button>
                    </div>
                </div>
            `;
            container.innerHTML += cardHtml;
        });

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = `<p style="color: #ff4a4a;">Erro ao carregar sorteios. Verifique o console do navegador.</p>`;
    }
}

async function deletarSorteio(id) {
    if (!confirm("Tem certeza que deseja excluir este sorteio permanentemente?")) return;
    try {
        const response = await fetch(`${URL_SORTEIO}/${id}`, { 
            method: 'DELETE', 
            headers: cabecalhosAutenticados 
        });
        
        if (!response.ok) throw new Error();
        alert("Sorteio excluído com sucesso!");
        carregarSorteiosAdmin(); 
    } catch (e) { 
        alert("Erro ao excluir sorteio. Certifique-se de estar logado como Admin e usando o Live Server."); 
    }
}

async function editarSorteio(id, nomeAtual) {
    const novoNome = prompt("Digite o novo nome do sorteio:", nomeAtual);
    if (!novoNome || novoNome.trim() === "") return;
    
    try {
        const response = await fetch(`${URL_SORTEIO}/${id}`, {
            method: 'PUT',
            headers: cabecalhosAutenticados,
            body: JSON.stringify({ nomeSorteio: novoNome, descricao: "" })
        });
        
        if (!response.ok) throw new Error();
        alert("Sorteio atualizado com sucesso!");
        carregarSorteiosAdmin(); 
    } catch (e) { 
        alert("Erro ao editar o sorteio."); 
    }
}

/* ==========================================================================
   3. GERENCIAR USUÁRIOS (Tabela HTML Operacional)
   ========================================================================== */
async function carregarUsuariosAdmin() {
    const tbody = document.getElementById('lista-admin-usuarios');
    if (!tbody) return;

    try {
        const response = await fetch(URL_USUARIO, { headers: cabecalhosAutenticados });
        if (!response.ok) throw new Error();
        
        const usuarios = await response.json();
        tbody.innerHTML = '';

        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum usuário cadastrado.</td></tr>';
            return;
        }

        usuarios.forEach(user => {
            const nomeExibicao = user.nome || 'Sem Nome';
            tbody.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${nomeExibicao}</td>
                    <td>${user.email}</td>
                    <td>
                        <button onclick="editarUsuario(${user.id}, '${nomeExibicao}', '${user.email}')" style="background-color: #ffca28; color:#000; border: none; padding: 6px 10px; cursor: pointer; border-radius: 4px; font-weight: bold; margin-right: 5px;">Editar</button>
                        <button onclick="deletarUsuario(${user.id})" style="background-color: #ff4a4a; color: #fff; border: none; padding: 6px 10px; cursor: pointer; border-radius: 4px; font-weight: bold;">Excluir</button>
                    </td>
                </tr>`;
        });
    } catch (e) { 
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ff4a4a;">Erro ao carregar a lista de usuários. Certifique-se de usar a extensão Live Server na porta 5500.</td></tr>';
    }
}

async function deletarUsuario(id) {
    if (!confirm("Tem certeza que deseja remover este usuário permanentemente?")) return;
    try {
        const response = await fetch(`${URL_USUARIO}/${id}`, { 
            method: 'DELETE', 
            headers: cabecalhosAutenticados 
        });
        
        if (!response.ok) throw new Error();
        alert("Usuário excluído com sucesso!");
        carregarUsuariosAdmin();
    } catch (e) { 
        alert("Erro ao remover usuário."); 
    }
}

async function editarUsuario(id, nome, email) {
    const novoNome = prompt("Novo nome:", nome);
    const novoEmail = prompt("Novo e-mail:", email);
    if (!novoNome || !novoEmail) return;
    
    const novaSenha = prompt("Defina a senha (obrigatória para o update do backend):");
    if (!novaSenha) return;

    try {
        const response = await fetch(`${URL_USUARIO}/${id}`, {
            method: 'PUT',
            headers: cabecalhosAutenticados,
            body: JSON.stringify({ nome: novoNome, email: novoEmail, senha: novaSenha })
        });
        
        if (!response.ok) throw new Error();
        alert("Usuário atualizado com sucesso!");
        carregarUsuariosAdmin();
    } catch (e) { 
        alert("Erro ao atualizar dados do usuário."); 
    }
}

// Inicializa chamando a listagem padrão de sorteios assim que a tela abre
document.addEventListener('DOMContentLoaded', carregarSorteiosAdmin);