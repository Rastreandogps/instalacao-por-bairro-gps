async function verValor() {
  const input = document.getElementById("bairroInput").value.trim();
  const quantidade = parseInt(document.getElementById("quantidadeInput").value.trim(), 10);
  const popup = document.getElementById("popup");
  const whatsapp = document.getElementById("whatsapp");

  popup.style.display = "block";
  whatsapp.style.display = "block";

  if (!input || isNaN(quantidade) || quantidade <= 0) {
    popup.innerHTML = "⚠️ Preencha corretamente o bairro e a quantidade.";
    return;
  }

  const response = await fetch("https://instalacao-por-bairro-gps.vercel.app/bairros.json");
  const data = await response.json();

  const normalizar = str =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const resultado = data.find(entry => normalizar(entry.bairro) === normalizar(input));

  if (resultado) {
    const valorUnitario = parseFloat(resultado.valor.replace("R$", "").replace(",", ".").trim());

    if (isNaN(valorUnitario)) {
      popup.innerHTML = "❌ Erro ao ler o valor de instalação.";
      return;
    }

    const total = valorUnitario * quantidade;

    popup.innerHTML = `✅ Valor total da instalação: R$ ${total.toFixed(2).replace(".", ",")}`;
  } else {
    popup.innerHTML = `❌ Este bairro não foi encontrado.<br>📌 Verifique se você digitou corretamente o nome do bairro.`;
  }
}
