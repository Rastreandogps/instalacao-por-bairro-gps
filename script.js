async function verValor() {
  const input = document.getElementById("bairroInput").value.trim();
  const popup = document.getElementById("popup");
  const whatsapp = document.getElementById("whatsapp");

  const response = await fetch("https://instalacao-por-bairro-gps.vercel.app/bairros.json");
  const data = await response.json();

  const normalizar = str =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const resultado = data.find(entry => normalizar(entry.bairro.trim()) === normalizar(input));

  popup.style.display = "block";
  whatsapp.style.display = "block";

  if (resultado) {
    popup.innerHTML = `✅ Sua instalação é apenas R$ ${resultado.valor}`;
  } else {
    popup.innerHTML = `❌ Este bairro não foi encontrado.<br>📌 Verifique se você digitou corretamente o nome do bairro.`;
  }
}
