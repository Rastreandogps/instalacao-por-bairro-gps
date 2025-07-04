async function verValor() {
  const bairro = document.getElementById("bairroInput").value.toLowerCase().trim();
  const popup = document.getElementById("popup");

  const response = await fetch("bairros.json");
  const data = await response.json();

  const resultado = data.find(entry => entry.bairro.toLowerCase() === bairro);

  if (resultado) {
    popup.style.display = "block";
    popup.innerText = `Sua instalação é apenas R$ ${resultado.valor}`;
  } else {
    popup.style.display = "block";
    popup.innerText = "Bairro não encontrado na nossa lista.";
  }
}