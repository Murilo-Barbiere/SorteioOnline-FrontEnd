const API_URL = "http://localhost:8080";
const TOKEN = sessionStorage.getItem("token");

// 1. VERIFICAÇÃO INICIAL
document.addEventListener("DOMContentLoaded", () => {
    if (!TOKEN) {
        alert("Acesso Negado! Faça login primeiro.");
        window.location.href = "login.html";
        return;
    }
    // Você pode decodificar o JWT aqui para garantir que é ROLE_ADMIN antes de mostrar a tela
    carregarUsuarios();
});

// 2. NAVEGAÇÃO ENTRE ABAS
function showSection(section) {
    document.getElementById('section-usuarios').style.display = section === 'usuarios' ? 'block' : 'none';
    document.getElementById('section-sorteios').style.display = section === 'sorteios' ? 'block' : 'none';
    
    document.getElementById('menu-usuarios').classList.toggle('active', section === 'usuarios');
    document.getElementById('menu-sorteios').classList.toggle('active', section === 'sorteios');

    if(section === 'usuarios') carregarUsuarios();
    if(section === 'sorteios') carregarSorteios();
}

// ==========================================
// MÓDULO DE USUÁRIOS
// ==========================================

async function carregarUsuarios() {
    const res = await fetch(`${API_URL}/usuario`, {
        headers: { "Authorization": `Bearer ${TOKEN}` }
    });
    const usuarios = await res.json();
    
    const tbody = document.querySelector("#tabela-usuarios tbody");
    tbody.innerHTML = "";

    usuarios.forEach(user => {
        tbody.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn-edit" onclick="abrirModalUsuario(${user.id}, '${user.nome}', '${user.email}')">Editar</button>
                    <button class="btn-delete" onclick="deletarUsuario(${user.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

async function deletarUsuario(id) {
    if(!confirm("Tem certeza que deseja deletar este usuário?")) return;
    
    await fetch(`${API_URL}/usuario/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${TOKEN}` }
    });
    carregarUsuarios();
}

function abrirModalUsuario(id, nome, email) {
    document.getElementById("edit-user-id").value = id;
    document.getElementById("edit-user-nome").value = nome;
    document.getElementById("edit-user-email").value = email;
    document.getElementById("modal-user").style.display = "flex";
}

async function salvarUsuario() {
    const id = document.getElementById("edit-user-id").value;
    const dados = {
        nome: document.getElementById("edit-user-nome").value,
        email: document.getElementById("edit-user-email").value,
        senha: document.getElementById("edit-user-senha").value
    };

    await fetch(`${API_URL}/usuario/${id}`, {
        method: "PUT",
        headers: { 
            "Authorization": `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    fecharModal("modal-user");
    carregarUsuarios();
}

async function uploadFotoPerfil() {
    const id = document.getElementById("edit-user-id").value;
    const arquivo = document.getElementById("edit-user-foto").files[0];
    
    if(!arquivo) return alert("Selecione uma imagem!");

    const formData = new FormData();
    formData.append("arquivo", arquivo);

    await fetch(`${API_URL}/imagem/usuario/${id}/foto-perfil`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${TOKEN}` },
        body: formData
    });
    alert("Foto atualizada com sucesso!");
}

// ==========================================
// MÓDULO DE SORTEIOS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const statusInput = document.getElementById("edit-sorteio-status");
    const statusText = document.getElementById("status-text");

    statusInput.addEventListener("change", () => {
        statusText.textContent = statusInput.checked
            ? "Ativo"
            : "Encerrado";
    });
});

async function carregarSorteios() {
    const res = await fetch(`${API_URL}/sorteio/lista_sorteios`, {
        headers: { "Authorization": `Bearer ${TOKEN}` }
    });

    const sorteios = await res.json();

    const tbody = document.querySelector("#tabela-sorteios tbody");
    tbody.innerHTML = "";

    sorteios.forEach(sorteio => {
        tbody.innerHTML += `
            <tr>
                <td>${sorteio.id}</td>
                <td>${sorteio.nomeSorteio}</td>
                <td>${sorteio.statusSorteio}</td>
                <td>
                    <button
                        class="btn-view"
                        onclick="verParticipantes(${sorteio.id})">
                        Participantes
                    </button>

                    <button
                        class="btn-edit"
                        onclick="abrirModalSorteio(
                            ${sorteio.id},
                            '${sorteio.nomeSorteio}',
                            '${sorteio.descricao || ''}',
                            '${sorteio.statusSorteio}'
                        )">
                        Editar
                    </button>

                    <button
                        class="btn-delete"
                        onclick="deletarSorteio(${sorteio.id})">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });
}

async function deletarSorteio(id) {
    if(!confirm("Tem certeza que deseja deletar este sorteio?")) return;
    
    await fetch(`${API_URL}/sorteio/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${TOKEN}` }
    });
    carregarSorteios();
}

function abrirModalSorteio(id, nome, desc, status) {
    document.getElementById("edit-sorteio-id").value = id;
    document.getElementById("edit-sorteio-nome").value = nome;
    document.getElementById("edit-sorteio-desc").value = desc;

    const statusInput = document.getElementById("edit-sorteio-status");
    const statusText = document.getElementById("status-text");

    statusInput.checked = status === "ATIVO";

    statusText.textContent = statusInput.checked
        ? "Ativo"
        : "Encerrado";

    document.getElementById("modal-sorteio").style.display = "flex";
}

async function salvarSorteio() {
    const id = document.getElementById("edit-sorteio-id").value;

    const dados = {
        nome: document.getElementById("edit-sorteio-nome").value,
        descricao: document.getElementById("edit-sorteio-desc").value,
        status: document.getElementById("edit-sorteio-status").checked
            ? 0
            : 1
    };

    const response = await fetch(`${API_URL}/sorteio/${id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    console.log(await response.text());

    fecharModal("modal-sorteio");
    carregarSorteios();
}

async function uploadFotoCapa() {
    const id = document.getElementById("edit-sorteio-id").value;
    const arquivo = document.getElementById("edit-sorteio-capa").files[0];
    
    if(!arquivo) return alert("Selecione uma imagem!");

    const formData = new FormData();
    formData.append("arquivo", arquivo);

    await fetch(`${API_URL}/imagem/sorteio/${id}/foto-capa`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${TOKEN}` },
        body: formData
    });
    alert("Capa do sorteio atualizada!");
}

// PARTICIPANTES
async function verParticipantes(idSorteio) {
    document.getElementById("participante-sorteio-id").value = idSorteio;
    const res = await fetch(`${API_URL}/sorteio/list_participantes/${idSorteio}`, {
        headers: { "Authorization": `Bearer ${TOKEN}` }
    });
    const participantes = await res.json();
    
    const ul = document.getElementById("lista-participantes");
    ul.innerHTML = "";

    participantes.forEach(p => {
        ul.innerHTML += `
            <li>
                <span>${p.nome} (${p.email})</span>
                <button class="btn-delete" onclick="removerParticipante(${idSorteio}, ${p.id})">Remover</button>
            </li>
        `;
    });

    document.getElementById("modal-participantes").style.display = "flex";
}

async function removerParticipante(idSorteio, idUsuario) {
    if(!confirm("Remover este usuário do sorteio?")) return;

    await fetch(`${API_URL}/sorteio/revome-participante/${idUsuario}/${idSorteio}`, {
        method: "GET", // Conforme seu controller atual
        headers: { "Authorization": `Bearer ${TOKEN}` }
    });
    
    // Recarrega a lista
    verParticipantes(idSorteio);
}

// UTILIDADES
function fecharModal(id) {
    document.getElementById(id).style.display = "none";
}

function logout() {
    sessionStorage.removeItem("token");
    window.location.href = "login.html";
}