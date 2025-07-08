async function verValor() {
  const input = document.getElementById("bairroInput").value.trim();
  const quantidadeRaw = document.getElementById("quantidadeInput").value.trim();
  const popup = document.getElementById("popup");
  const whatsapp = document.getElementById("whatsapp");

  popup.style.display = "block";
  whatsapp.style.display = "block";

  if (!input || !quantidadeRaw || isNaN(quantidadeRaw) || parseInt(quantidadeRaw) <= 0) {
    popup.innerHTML = "⚠️ Preencha corretamente o bairro e a quantidade de veículos.";
    return;
  }

  const quantidade = parseInt(quantidadeRaw);

  const response = await fetch("https://instalacao-por-bairro-gps.vercel.app/bairros.json");
  const data = await response.json();

  const normalizar = str =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const resultado = data.find(entry => normalizar(entry.bairro) === normalizar(input));

  if (resultado) {
    // TRATAMENTO COMPLETO DO VALOR
    const valorLimpo = resultado.valor
      .toString()
      .replace("R$", "")
      .replace(" ", "")
      .replace(",", ".")
      .trim();

    const valorUnitario = parseFloat(valorLimpo);

    if (isNaN(valorUnitario)) {
      popup.innerHTML = "❌ Erro ao interpretar o valor do bairro.";
      return;
    }

    const total = valorUnitario * quantidade;
    popup.innerHTML = `✅ Valor total da instalação: R$ ${total.toFixed(2).replace(".", ",")}`;
  } else {
    popup.innerHTML = `❌ Este bairro não foi encontrado.<br>📌 Verifique se você digitou corretamente o nome do bairro.`;
  }
}
