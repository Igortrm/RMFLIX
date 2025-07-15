function initIndex() {
  const carouselInner = document.getElementById("carousel-inner");
  const listaFilmes = document.getElementById("lista-filmes");
  const usuarioJSON = sessionStorage.getItem("usuarioLogado");
  const usuarioId = usuarioJSON ? JSON.parse(usuarioJSON).id : null;
  const campoBusca = document.getElementById("campoBusca");

  if (campoBusca) {
    campoBusca.addEventListener("input", (e) => {
      carregarFilmes(e.target.value);
    });
  }

  async function carregarFavoritosDoUsuario(usuarioId) {
    const res = await fetch(`http://localhost:3001/favoritos?usuarioId=${usuarioId}`);
    const dados = await res.json();
    return dados.map(f => f.filmeId);
  }

  async function carregarFilmes(filtro = "") {
    const res = await fetch("http://localhost:3001/filmes");
    const filmes = await res.json();

    if (carouselInner) {
      carouselInner.innerHTML = "";
      filmes.forEach((filme, i) => {
        const item = document.createElement("div");
        item.className = `carousel-item ${i === 0 ? "active" : ""}`;
        item.innerHTML = `
          <a href="detalhes.html?id=${filme.id}">
            <img src="${filme.imagem}" class="d-block w-100" alt="${filme.titulo}">
            <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded">
              <h5>${filme.titulo}</h5>
              <p>${filme.descricao}</p>
            </div>
          </a>`;
        carouselInner.appendChild(item);
      });
    }

    if (listaFilmes) {
      listaFilmes.innerHTML = "";
      const filmesFiltrados = filmes.filter(f =>
        f.titulo.toLowerCase().includes(filtro.toLowerCase())
      );

      filmesFiltrados.forEach(filme => {
        const col = document.createElement("div");
        col.className = "col-md-3 mb-4";
        col.innerHTML = `
          <div class="card h-100 bg-dark text-white">
            <img src="${filme.imagem}" class="card-img-top" alt="${filme.titulo}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${filme.titulo}</h5>
              <p class="card-text">${filme.descricao.slice(0, 80)}...</p>
              <a href="detalhes.html?id=${filme.id}" class="btn btn-primary mt-auto">Ver Detalhes</a>
            </div>
          </div>`;
        listaFilmes.appendChild(col);
      });
    }

    gerarGraficoGeneros();
  }

  carregarFilmes();
}

function atualizarMenu() {
  const usuarioJSON = sessionStorage.getItem('usuarioLogado');
  const cadastroLink = document.getElementById('cadastroLink');
  const favLink = document.getElementById('favoritosLink');
  const loginLink = document.getElementById('loginLink');
  const logoutLink = document.getElementById('logoutLink');

  if (usuarioJSON) {
    loginLink.style.display = 'none';
    logoutLink.style.display = 'block';
    favLink.style.display = 'block';
    const usuario = JSON.parse(usuarioJSON);
    cadastroLink.style.display = usuario.admin ? 'block' : 'none';
  } else {
    loginLink.style.display = 'block';
    logoutLink.style.display = 'none';
    favLink.style.display = 'none';
    cadastroLink.style.display = 'none';
  }
}

function logout() {
  sessionStorage.removeItem('usuarioLogado');
  window.location.href = "index.html";
}

async function toggleFavorito(usuarioId, filmeId, icone) {
  const res = await fetch(`http://localhost:3001/favoritos?usuarioId=${usuarioId}&filmeId=${filmeId}`);
  const data = await res.json();
  if (data.length > 0) {
    await fetch(`http://localhost:3001/favoritos/${data[0].id}`, { method: "DELETE" });
    icone.classList.replace("fa-heart", "fa-heart-o");
  } else {
    await fetch("http://localhost:3001/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId, filmeId })
    });
    icone.classList.replace("fa-heart-o", "fa-heart");
  }
}

async function gerarGraficoGeneros() {
  const canvas = document.getElementById("graficoGenero");
  if (!canvas) return;

  const res = await fetch("http://localhost:3001/filmes");
  const filmes = await res.json();

  const cont = {};
  filmes.forEach(filme => {
    if (!filme.genero) return;
    const generos = filme.genero.split(',').map(g => g.trim());
    generos.forEach(g => {
      cont[g] = (cont[g] || 0) + 1;
    });
  });

  const paletaCores = {
    "Ação": "#ff6384",
    "Comédia": "#36a2eb",
    "Drama": "#ffce56",
    "Terror": "#4bc0c0",
    "Romance": "#9966ff",
    "Suspense": "#f67019",
    "Ficção Científica": "#00a950",
    "Fantasia": "#d26dfd",
    "Aventura": "#00c3ff",
    "Animação": "#f9a602",
    "História": "#a569bd",
    "Crime": "#e74c3c",
    "Mistério": "#5dade2",
    "Documentário": "#17a589"
  };

  function gerarCorAleatoria() {
    const r = Math.floor(Math.random() * 156) + 100;
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgb(${r},${g},${b})`;
  }

  const labels = Object.keys(cont);
  const cores = labels.map(genero => paletaCores[genero] || gerarCorAleatoria());

  new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Quantidade de Filmes",
        data: labels.map(g => cont[g]),
        backgroundColor: cores,
        borderColor: "#222",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: "#fff" }
        },
        x: {
          ticks: { color: "#fff" }
        }
      },
      plugins: {
        title: {
          display: true,
          text: "Filmes por Gênero",
          color: "#fff",
          font: { size: 20 }
        },
        legend: { display: false }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarMenu();

  const btn = document.getElementById('btnLogout');
  if (btn) btn.addEventListener('click', e => {
    e.preventDefault();
    logout();
  });

  initIndex();

  if (typeof initDetalhes === "function") initDetalhes();
});
