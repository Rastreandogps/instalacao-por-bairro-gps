async function verValor() {
  const bairro = document.getElementById("bairroInput").value.toLowerCase().trim();
  const popup = document.getElementById("popup");

  const response = await fetch("https://instalacao-por-bairro-gps.vercel.app/bairros.json");
  const data = await response.json();

  const normalizar = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const resultado = data.find(entry => normalizar(entry.bairro) === normalizar(bairro));
  const resultado = bairros.find(item => item.bairro.trim().toLowerCase() === input);


  if (resultado) {
    popup.style.display = "block";
    popup.innerText = `Sua instalação é apenas R$ ${resultado.valor}`;
  } else {
    popup.style.display = "block";
    popup.innerText = "Bairro não encontrado na nossa lista.";
  }
}
