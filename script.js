async function verValor() {
  const bairroInput = document.getElementById("bairroInput").value.trim();
  const quantidade = parseInt(document.getElementById("quantidadeInput").value) || 1;
  const tipo = document.getElementById("tipoRastreador").value;

  const popup = document.getElementById("popup");
  const mensalidadeBox = document.getElementById("mensalidadeBox");
  const ofertaBox = document.getElementById("ofertaBox");
  const beneficiosBox = document.getElementById("beneficiosBox");
  const whatsapp = document.getElementById("whatsapp");
  const duvidas = document.getElementById("duvidas");
  const botaoExtraAcimaVideo = document.getElementById("botaoExtraAcimaVideo");
  const botaoBairroNaoEncontrado = document.getElementById("botaoBairroNaoEncontrado");
  const botaoWhatsAppAbaixoMensalidade = document.getElementById("botaoWhatsAppAbaixoMensalidade");

  popup.style.display = "block";
  whatsapp.style.display = "block";
  duvidas.style.display = "block";
  mensalidadeBox.style.display = "block";
  beneficiosBox.style.display = "block";
  ofertaBox.style.display = "none";

  const response = await fetch("https://instalacao-por-bairro-gps.vercel.app/bairros.json");
  const data = await response.json();

  const normalizar = str =>
    str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  const resultado = data.find(entry => normalizar(entry.bairro) === normalizar(bairroInput));

  if (resultado) {
    botaoBairroNaoEncontrado.style.display = "none";
    botaoExtraAcimaVideo.style.display = "block";

    const valorSanitizado = resultado.valor
      .toString()
      .replace(/[^0-9,\.]/gu, "")
      .replace(",", ".")
      .trim();

    const valorUnitario = parseFloat(valorSanitizado);
    if (isNaN(valorUnitario)) {
      popup.className = "erro";
      popup.innerHTML = "❌ Erro ao interpretar o valor da instalação.";
      return;
    }

    const valorInstalacao = valorUnitario * quantidade;
    popup.className = "sucesso";
    popup.innerHTML = `✅ Valor total da instalação: R$ ${valorInstalacao.toFixed(2).replace(".", ",")}`;

    let textoMensagem = `Olá! Gostaria de agendar minha instalação.\n\n`;
    textoMensagem += `📍 Endereço informado: ${bairroInput}\n`;
    textoMensagem += `🚗 Quantidade de veículos: ${quantidade}\n`;
    textoMensagem += `🛰️ Tipo de rastreador: ${tipo === 'com' ? 'Com bloqueio' : 'Sem bloqueio'}\n`;
    textoMensagem += `💰 Valor da instalação: R$ ${valorInstalacao.toFixed(2).replace(".", ",")}\n`;

    let valorMensal = 0;

    if (tipo === "com") {
      const cheio = 54.90 * quantidade;
      const desconto = 49.90 * quantidade;
      valorMensal = desconto;

      mensalidadeBox.className = "sucesso";
      mensalidadeBox.innerHTML = `
        📅 Mensalidade: R$ ${cheio.toFixed(2).replace(".", ",")}<br>
        Pagando até a data do vencimento, sai por:<br>
        💸 <strong>R$ ${desconto.toFixed(2).replace(".", ",")} mensais</strong>
      `;
      textoMensagem += `📅 Mensalidade: R$ ${cheio.toFixed(2).replace(".", ",")} (pagando até o vencimento, sai por R$ ${desconto.toFixed(2).replace(".", ",")})\n`;
    } else {
      valorMensal = 39.90 * quantidade;
      mensalidadeBox.className = "sucesso";
      mensalidadeBox.innerHTML = `📅 Mensalidade: <strong>R$ ${valorMensal.toFixed(2).replace(".", ",")} mensais</strong>`;
      textoMensagem += `📅 Mensalidade: R$ ${valorMensal.toFixed(2).replace(".", ",")}\n`;
    }

    if (quantidade >= 3) {
      ofertaBox.style.display = "block";
      ofertaBox.className = "oferta";
      ofertaBox.innerHTML = `
        🌟 <strong>Oferta Especial para Frotas!</strong><br><br>
        Você possui 3 ou mais veículos? Fale agora com um de nossos especialistas e aproveite condições personalizadas para sua frota!<br><br>
        💼 Atendimento exclusivo • 📦 Pacotes empresariais • 💰 Economia garantida!
      `;
    }

    beneficiosBox.className = "sucesso";
    beneficiosBox.innerHTML = `
      ✨ <strong>Benefícios que você vai ter com a Rastreando GPS:</strong><br><br>
      ✅ <strong>LOCALIZAÇÃO</strong> em tempo real<br>
      ⚠️ <strong>ALERTAS</strong> de ignição<br>
      🔒 <strong>BLOQUEIO</strong> e <strong>DESBLOQUEIO</strong><br>
      🛣️ <strong>HISTÓRICO</strong> de rotas e <strong>VELOCIDADE</strong><br>
      📱 <strong>ANDROID</strong> e <strong>iOS</strong><br>
      🙋‍♂️ <strong>SUPORTE</strong> humano rápido e atencioso<br><br>
      🚘 <strong>SEGURANÇA</strong>, praticidade e controle em um só lugar!<br><br>
      <span class="pulsando">Clique no botão abaixo e agende sua instalação 👇</span>
    `;

    const textoEncoded = encodeURIComponent(textoMensagem);
    whatsapp.querySelector("a").href = `https://wa.me/5521969312625?text=${textoEncoded}`;
    botaoExtraAcimaVideo.querySelector("a").href = `https://wa.me/5521969312625?text=${textoEncoded}`;
    botaoWhatsAppAbaixoMensalidade.style.display = "block";
    botaoWhatsAppAbaixoMensalidade.querySelector("a").href = `https://wa.me/5521969312625?text=${textoEncoded}`;
  } else {
    popup.className = "erro";
    popup.innerHTML = `
      ❌ Este bairro não foi encontrado.<br>
      📌 Verifique se você digitou corretamente o nome da cidade.<br><br>
      Exemplo: São Cristóvão, Niterói, Duque de Caxias, Nova Iguaçu
    `;
    mensalidadeBox.style.display = "none";
    beneficiosBox.style.display = "none";
    ofertaBox.style.display = "none";
    botaoBairroNaoEncontrado.style.display = "block";
    botaoExtraAcimaVideo.style.display = "none";
    botaoWhatsAppAbaixoMensalidade.style.display = "none";
  }
}

// CARROSSEL AUTOMÁTICO
let indexAtual = 0;
const imagens = document.querySelectorAll("#carousel img");

setInterval(() => {
  imagens[indexAtual].classList.remove("active");
  indexAtual = (indexAtual + 1) % imagens.length;
  imagens[indexAtual].classList.add("active");
}, 3000);
