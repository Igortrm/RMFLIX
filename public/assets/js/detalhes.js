document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const container = document.getElementById("detalhes-filme");

  if (!id) {
    container.innerHTML = "<p>ID do filme não especificado.</p>";
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/filmes/${id}`);
    if (!response.ok) throw new Error("Filme não encontrado");

    const filme = await response.json();

    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    const isFavorito = favoritos.includes(filme.id);

    const btnFavorito = document.createElement("button");
    btnFavorito.className = "btn btn-outline-danger mb-3";
    btnFavorito.innerHTML = `<i class="fa fa-heart${isFavorito ? "" : "-o"}"></i> ${isFavorito ? "Favorito" : "Favoritar"}`;
    btnFavorito.addEventListener("click", () => {
      const index = favoritos.indexOf(filme.id);
      if (index !== -1) {
        favoritos.splice(index, 1);
        btnFavorito.innerHTML = `<i class="fa fa-heart-o"></i> Favoritar`;
      } else {
        favoritos.push(filme.id);
        btnFavorito.innerHTML = `<i class="fa fa-heart"></i> Favorito`;
      }
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
    });

    container.innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <img src="${filme.imagem}" alt="${filme.titulo}" class="img-fluid rounded shadow">
        </div>
        <div class="col-md-8">
          <h2>${filme.titulo}</h2>
          <p><strong>Descrição:</strong> ${filme.descricao}</p>
          <p><strong>Produtor:</strong> ${filme.produtor}</p>
          <p><strong>Ano:</strong> ${filme.ano}</p>
          <p><strong>Gênero:</strong> ${filme.genero}</p>
          <p><strong>Duração:</strong> ${filme.duracao}</p>
        </div>
      </div>
      <div id="area-favorito" class="mt-3"></div>
      <hr />
      <h4>Fotos</h4>
      <div class="row">
        ${(filme.fotos || []).map(foto => {
          const url = typeof foto === "string" ? foto : foto.url;
          return `
            <div class="col-md-3 mb-3">
              <img src="${url}" alt="Cena do filme" class="img-fluid rounded shadow-sm" />
            </div>
          `;
        }).join("")}
      </div>
    `;

    const areaFavorito = document.getElementById("area-favorito");
    areaFavorito.appendChild(btnFavorito);

  } catch (error) {
    container.innerHTML = `<p>Erro ao carregar os dados: ${error.message}</p>`;
  }
});

function atualizarMenu() {
  const usuarioJSON = sessionStorage.getItem("usuarioLogado");
  const cadastroLink = document.getElementById("cadastroLink");
  const favoritosLink = document.getElementById("favoritosLink");
  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");

  if (usuarioJSON) {
    const usuario = JSON.parse(usuarioJSON);
    loginLink.style.display = "none";
    logoutLink.style.display = "block";
    favoritosLink.style.display = "block";
    cadastroLink.style.display = usuario.admin ? "block" : "none";
  } else {
    loginLink.style.display = "block";
    logoutLink.style.display = "none";
    favoritosLink.style.display = "none";
    cadastroLink.style.display = "none";
  }
}

function logout() {
  sessionStorage.removeItem("usuarioLogado");
  location.reload();
}

window.addEventListener("load", () => {
  atualizarMenu();
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
});
