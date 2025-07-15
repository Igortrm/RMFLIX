function initGrafico() {
  const ctx = document.getElementById('graficoGeneros');
  const listaFilmesPorGeneroContainer = document.getElementById('listaFilmesPorGenero');

  if (!ctx && !listaFilmesPorGeneroContainer) return;

  fetch("http://localhost:3001/filmes")
    .then(res => {
      if (!res.ok) throw new Error(`Erro de rede ao carregar filmes: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .then(filmes => {
      const contagemGeneros = {};
      const filmesPorGenero = {};

      filmes.forEach(filme => {
        const generos = filme.genero.split(',').map(g => g.trim());
        generos.forEach(genero => {
          if (genero) {
            contagemGeneros[genero] = (contagemGeneros[genero] || 0) + 1;
            if (!filmesPorGenero[genero]) filmesPorGenero[genero] = [];
            filmesPorGenero[genero].push(filme);
          }
        });
      });

      if (ctx) {
        const labels = Object.keys(contagemGeneros);
        const dados = Object.values(contagemGeneros);
        const cores = [
          'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)', 'rgba(83, 102, 255, 0.7)', 'rgba(235, 54, 162, 0.7)',
          'rgba(64, 255, 159, 0.7)'
        ];

        new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              label: 'Número de Filmes',
              data: dados,
              backgroundColor: cores.slice(0, labels.length),
              borderColor: '#000',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#fff' }
              },
              title: {
                display: true,
                text: 'Distribuição de Filmes por Gênero',
                color: '#fff'
              }
            }
          }
        });
      }

      if (listaFilmesPorGeneroContainer) {
        listaFilmesPorGeneroContainer.innerHTML = '';
        const generosOrdenados = Object.keys(filmesPorGenero).sort();

        generosOrdenados.forEach(genero => {
          const filmesDoGenero = filmesPorGenero[genero];
          const generoSection = document.createElement('div');
          generoSection.className = 'col-12 mb-4';
          generoSection.innerHTML = `
            <div class="card bg-secondary text-white">
              <div class="card-header">
                <h3 class="mb-0">${genero}</h3>
              </div>
              <div class="card-body p-0">
                <ul class="list-group list-group-flush">
                  ${filmesDoGenero.map(filme => `
                    <li class="list-group-item d-flex justify-content-between align-items-center film-list-item">
                      <div>
                        <h5 class="mb-1">${filme.titulo}</h5>
                        <small>Duração: ${filme.duracao} | Ano: ${filme.ano}</small>
                      </div>
                      <a href="detalhes.html?id=${filme.id}" class="btn btn-primary">Ver Detalhes</a>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          `;
          listaFilmesPorGeneroContainer.appendChild(generoSection);
        });

        if (generosOrdenados.length === 0) {
          listaFilmesPorGeneroContainer.innerHTML = '<p class="text-center text-muted">Nenhum filme encontrado para listar por gênero.</p>';
        }
      }
    })
    .catch(error => {
      console.error("Erro ao carregar dados para o gráfico ou lista:", error);
      if (ctx?.parentElement) {
        ctx.parentElement.innerHTML = '<p style="color: red; text-align: center;">Não foi possível carregar o gráfico.</p>';
      }
      if (listaFilmesPorGeneroContainer) {
        listaFilmesPorGeneroContainer.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar lista de filmes por gênero.</p>';
      }
    });
}
