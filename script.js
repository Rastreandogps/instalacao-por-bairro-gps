let bairrosDisponiveis = [];

async function carregarBairros() {
  const response = await fetch("https://instalacao-por-bairro-gps.vercel.app/bairros.json");
  const data = await response.json();
  bairrosDisponiveis = data.map(entry => entry.bairro).sort();

  const datalist = document.getElementById("listaBairros");
  bairrosDisponiveis.forEach(bairro => {
    const option = document.createElement("option");
    option.value = bairro;
    datalist.appendChild(option);
  });
}

async function verValor() {
  const input = document.getElementById("bairroInput").value.trim();
  const popup = document.getElementById("popup");
  const whatsapp = document.getElementById("whatsapp");

  popup.style.display = "block";
  whatsapp.style.display = "block";

  if (input === "") {
    popup.innerHTML = "⚠️ Por favor, digite o nome de um bairro.";
    return;
  }

  const response = await fetch("https://instalacao-por-bairro-gps.vercel.app/bairros.json");
  const data = await response.json();

  const normalizar = str =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const resultado = data.find(entry => normalizar(entry.bairro) === normalizar(input));

  if (resultado) {
    const valorSanitizado = resultado.valor.replace("R$", "").trim();
    popup.innerHTML = `✅ Sua instalação é apenas R$ ${valorSanitizado}`;
  } else {
    popup.innerHTML = `❌ Este bairro não foi encontrado.<br>📌 Verifique se você digitou corretamente o nome do bairro.`;
  }
}

// Carrega autocomplete assim que a página abrir
document.addEventListener("DOMContentLoaded", carregarBairros);
