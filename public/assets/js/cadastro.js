const form = document.getElementById("form-filme");
const tabelaFilmes = document.getElementById("tabela-filmes");
const urlParams = new URLSearchParams(window.location.search);
const idFilme = urlParams.get("id");
const baseURL = "http://localhost:3001/filmes";

if (idFilme) {
  fetch(`${baseURL}/${idFilme}`)
    .then(res => res.json())
    .then(filme => preencherFormulario(filme))
    .catch(err => console.error("Erro ao buscar filme:", err));
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const novoFilme = {
    titulo: form.titulo.value,
    produtor: form.produtor.value,
    ano: form.ano.value,
    genero: form.genero.value,
    duracao: form.duracao.value,
    descricao: form.descricao.value,
    imagem: form.imagem.value,
    fotos: []
  };

  for (let i = 1; i <= 4; i++) {
    const fotoInput = document.getElementById(`foto${i}`);
    if (fotoInput && fotoInput.value.trim() !== "") {
      novoFilme.fotos.push(fotoInput.value.trim());
    }
  }

  try {
    const opts = {
      method: idFilme ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(novoFilme)
    };
    const url = idFilme ? `${baseURL}/${idFilme}` : baseURL;
    const res = await fetch(url, opts);

    if (!res.ok) throw new Error(res.statusText);

    alert(idFilme ? "Filme atualizado com sucesso!" : "Filme cadastrado com sucesso!");
    form.reset();
    carregarFilmes();

    if (idFilme) window.location.href = "cadastro_filmes.html";
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar o filme.");
  }
});

function preencherFormulario(filme) {
  form.titulo.value = filme.titulo || "";
  form.produtor.value = filme.produtor || "";
  form.ano.value = filme.ano || "";
  form.genero.value = filme.genero || "";
  form.duracao.value = filme.duracao || "";
  form.descricao.value = filme.descricao || "";
  form.imagem.value = filme.imagem || "";

  if (filme.fotos && filme.fotos.length) {
    for (let i = 0; i < 4; i++) {
      const fotoInput = document.getElementById(`foto${i + 1}`);
      if (fotoInput) {
        fotoInput.value = filme.fotos[i] || "";
      }
    }
  }
}

async function carregarFilmes() {
  try {
    const res = await fetch(baseURL);
    const filmes = await res.json();
    tabelaFilmes.innerHTML = "";

    filmes.forEach(f => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${f.titulo}</td>
        <td>${f.produtor}</td>
        <td>${f.ano}</td>
        <td>${f.genero}</td>
        <td>${f.duracao}</td>
        <td>
          <a href="cadastro_filmes.html?id=${f.id}" class="btn btn-sm btn-primary me-2">Editar</a>
          <button class="btn btn-sm btn-danger" onclick="excluirFilme('${f.id}')">Excluir</button>
        </td>
      `;
      tabelaFilmes.appendChild(row);
    });
  } catch (err) {
    console.error("Erro ao carregar filmes:", err);
  }
}

async function excluirFilme(id) {
  if (!confirm("Tem certeza que deseja excluir este filme?")) return;

  try {
    const res = await fetch(`${baseURL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error('Erro ao excluir o filme');
    alert("Filme excluído com sucesso!");
    carregarFilmes();
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir filme: " + err.message);
  }
}

function atualizarMenu() {
  const usuarioJSON = sessionStorage.getItem('usuarioLogado');
  const cadastroLink = document.getElementById('cadastroLink');
  const favoritosLink = document.getElementById('favoritosLink');
  const loginLink = document.getElementById('loginLink');
  const logoutLink = document.getElementById('logoutLink');

  if (usuarioJSON) {
    const usuario = JSON.parse(usuarioJSON);
    loginLink.style.display = 'none';
    logoutLink.style.display = 'block';
    favoritosLink.style.display = 'block';
    cadastroLink.style.display = usuario.admin ? 'block' : 'none';
  } else {
    loginLink.style.display = 'block';
    logoutLink.style.display = 'none';
    cadastroLink.style.display = 'none';
    favoritosLink.style.display = 'none';
  }
}

function logout() {
  sessionStorage.removeItem('usuarioLogado');
  location.reload();
}

window.addEventListener('load', () => {
  atualizarMenu();
  carregarFilmes();
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) btnLogout.addEventListener('click', (e) => { e.preventDefault(); logout(); });
});
