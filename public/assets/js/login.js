const urlBase = "http://localhost:3001";

document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const login = document.getElementById("login").value.trim();
  const senha = document.getElementById("senha").value.trim();

  try {
    const response = await fetch(`${urlBase}/usuarios?login=${login}&senha=${senha}`);
    const data = await response.json();

    if (data.length > 0) {
      const usuario = data[0];
      sessionStorage.setItem("usuarioLogado", JSON.stringify(usuario));
      alert("Login realizado com sucesso!");
      window.location.href = "index.html";
    } else {
      alert("Login ou senha inválidos.");
    }

  }
  catch (error) {
    console.error("Erro ao tentar fazer login:", error);
    alert("Erro ao conectar ao servidor.");
  }
});

const modal = document.getElementById("modalCadastro");

function abrirModal() { modal.style.display = "block"; }
function fecharModal() { modal.style.display = "none"; }

document.getElementById("btnAbrirModal").addEventListener("click", abrirModal);
document.getElementById("btnFecharModal").addEventListener("click", fecharModal);

window.onclick = function (event) {
  if (event.target === modal) {
    fecharModal();
  }
};


document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomeCadastro").value.trim();
  const login = document.getElementById("loginCadastro").value.trim();
  const email = document.getElementById("emailCadastro").value.trim();
  const senha = document.getElementById("senhaCadastro").value.trim();

  try {
    const existe = await fetch(`${urlBase}/usuarios?login=${login}`);
    const existeData = await existe.json();

    if (existeData.length > 0) {
      alert("Esse login já está em uso.");
      return;
    }

    const novoUsuario = {
      nome,
      login,
      senha,
      email,
      admin: false
    };

    const response = await fetch(`${urlBase}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoUsuario)
    });

    if (response.ok) {
      alert("Cadastro realizado com sucesso!");
      fecharModal();
    } else {
      alert("Erro ao cadastrar usuário.");
    }
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao conectar ao servidor.");
  }
});
