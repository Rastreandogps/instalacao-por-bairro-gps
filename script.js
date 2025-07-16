<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Consultar Valor da Instalação</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      text-align: center;
    }
    input, select, button {
      padding: 10px;
      font-size: 16px;
      margin: 5px;
    }
    button {
      background-color: #28a745;
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 50px;
      padding: 10px 20px;
    }
    button:hover {
      background-color: #218838;
    }
    #popup, #mensalidadeBox, #beneficiosBox, #ofertaBox {
      display: none;
      margin-top: 20px;
      padding: 20px;
      font-size: 18px;
      border-radius: 8px;
      animation: fadeIn 0.4s ease-in-out;
    }
    .sucesso {
      background: #e6f4ea;
      border: 1px solid #2ecc71;
      color: #2d7d46;
    }
    .erro {
      background: #fdecea;
      border: 1px solid #e74c3c;
      color: #c0392b;
    }
    .oferta {
      background: #fff8e1;
      border: 1px solid #f1c40f;
      color: #9c7a00;
    }
    .botaoZap {
      padding: 12px 20px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      display: inline-block;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      margin: 10px auto;
    }
    .botaoZap:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }
    .verdeZap { background-color: #25D366; color: white; }
    .azulZap { background-color: #ca5964; color: white; }
    .vermelhoZap { background-color: #ca5964; color: white; }
    .pulsando {
      font-weight: bold;
      color: black;
      animation: pulse 1.2s infinite;
      display: inline-block;
      margin-top: 10px;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.03); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }
    #beneficiosBox {
      text-align: left;
      background-color: #e8f4fd;
      border: 1px solid #2e86de;
      color: #0d3c61;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .destaque-video {
      margin: 40px 0 20px;
      font-size: 22px;
      font-weight: bold;
      color: #000;
      animation: pulse 1.6s infinite;
    }
    .destaque-carrossel {
      margin-top: 40px;
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }
    .carousel {
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .carousel img {
      width: 100%;
      display: none;
    }
    .carousel img.active {
      display: block;
    }
  </style>
</head>
<body>

  <!-- HEADLINE COM VÍDEO RESPONSIVO -->
  <div style="position: relative; width: 100%; overflow: hidden;">
    <video autoplay muted loop playsinline style="width: 100%; height: auto; display: block;">
      <source src="HEADLINE/banner.mp4" type="video/mp4"/>
      Seu navegador não suporta vídeo.
    </video>
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      text-align: center;
      padding: 20px;
      width: 90%;
      max-width: 600px;
    ">
      <h1 style="font-size: 1.8rem; margin-bottom: 10px;">Sua Proteção Começa Agora 🚗🔒</h1>
      <p style="font-size: 1rem; margin-bottom: 20px;">Rastreamento com instalação rápida e suporte humanizado no RJ</p>
      <a href="https://wa.me/5521969312625?text=Quero%20agendar%20minha%20instalação%20de%20rastreador"
         class="botaoZap verdeZap"
         style="padding: 12px 24px; font-size: 1rem;">
        Agendar Instalação
      </a>
    </div>
  </div>

  <h1>Consulte o valor da instalação</h1>
  <input type="text" id="bairroInput" placeholder="Digite apenas a cidade do RJ" />
  <input type="number" id="quantidadeInput" placeholder="Quantidade de veículos" min="1" />
  <select id="tipoRastreador">
    <option value="com">Com bloqueio</option>
    <option value="sem">Sem bloqueio</option>
  </select>
  <br>
  <button onclick="verValor()">Ver valor</button>

  <div id="popup"></div>

  <div id="botaoBairroNaoEncontrado" style="display:none; margin-top: 10px;">
    <a href="https://wa.me/5521969312625?text=Olá!%20Não%20encontrei%20meu%20bairro%20na%20lista%20de%20instalação.%20Pode%20me%20ajudar?"
       class="botaoZap vermelhoZap pulsando" target="_blank">
      Clique aqui caso não encontre seu bairro
    </a>
  </div>

  <div id="mensalidadeBox"></div>
  <div id="ofertaBox"></div>

  <div id="botaoWhatsAppAbaixoMensalidade" style="display: none;">
    <a href="#" class="botaoZap verdeZap pulsando" target="_blank">Quero instalar meu rastreador!</a>
  </div>

  <div id="beneficiosBox"></div>

  <div id="botaoExtraAcimaVideo" style="display:none;">
    <a href="#" class="botaoZap verdeZap" target="_blank">Clique Aqui e Agende já</a>
  </div>

  <div class="destaque-video">📱 Veja como funciona o nosso aplicativo na prática:</div>
  <iframe width="100%" height="315"
    src="https://www.youtube.com/embed/nB5CC01cGIo"
    title="YouTube vídeo" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>

  <div class="destaque-carrossel">
    🚨 Esses veículos poderiam ter sido perdidos. Mas estavam com nosso rastreador.
  </div>

  <div class="carousel" id="carousel">
    <img src="Recuperacao/Recuperacao1.jpg" class="active" alt="Veículo recuperado 1" />
    <img src="Recuperacao/Recuperacao2.jpg" alt="Veículo recuperado 2" />
    <img src="Recuperacao/Recuperacao3.jpg" alt="Veículo recuperado 3" />
    <img src="Recuperacao/Recuperacao4.jpg" alt="Veículo recuperado 4" />
    <img src="Recuperacao/Recuperacao5.jpg" alt="Veículo recuperado 5" />
  </div>

  <div id="whatsapp" style="display:none;">
    <a href="#" class="botaoZap verdeZap" target="_blank">Clique Aqui e Agende já</a>
  </div>

  <div id="duvidas" style="display:none;">
    <a href="https://wa.me/5521971280678?text=Olá!%20Ainda%20tenho%20algumas%20dúvidas%20sobre%20o rastreador." class="botaoZap azulZap" target="_blank">
      Clique aqui se ainda tem dúvidas
    </a>
  </div>

  <script>
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
        botãoExtraAcimaVideo
        const valorSanitizado = resultado.valor.toString().replace(/[^0-9,\\.]/gu,"").replace(",",".").trim();
        const valorUnitario = parseFloat(valorSanitizado);
        if (isNaN(valorUnitario)) {
          popup.className = "erro";
          popup.innerHTML = "❌ Erro ao interpretar o valor da instalação.";
          return;
        }
        const valorInstalacao = valorUnitario * quantidade;
        popup.className = "sucesso";
        popup.innerHTML = `✅ Valor total da instalação: R$ ${valorInstalacao.toFixed(2).replace(".", ",")}`;
        let textoMensagem = `Olá! Gostaria de agendar minha instalação.\n\n📍 Endereço informado: ${bairroInput}\n🚗 Quantidade de veículos: ${quantidade}\n🛰️ Tipo de rastreador: ${tipo === 'com' ? 'Com bloqueio' : 'Sem bloqueio'}\n💰 Valor da instalação: R$ ${valorInstalacao.toFixed(2).replace(".", ",")}\n`;
        let valorMensal=0;
        if (tipo==="com"){const cheio=54.9*quantidade;const desconto=49.9*quantidade;valorMensal=desconto;mensalidadeBox.className="sucesso";mensalidadeBox.innerHTML=`📅 Mensalidade: R$ ${cheio.toFixed(2).replace(".",",")}<br>Pagando até a data do vencimento, sai por:<br>💸 <strong>R$ ${desconto.toFixed(2).replace(".",",")} mensais</strong>`;textoMensagem+=`📅 Mensalidade: R$ ${cheio.toFixed(2).replace(".",",")} (pagando até o vencimento, sai por R$ ${desconto.toFixed(2).replace(".",",")})\n`;}else{valorMensal=39.9*quantidade;mensalidadeBox.className="sucesso";mensalidadeBox.innerHTML=`📅 Mensalidade: <strong>R$ ${valorMensal.toFixed(2).replace(".",",")} mensais</strong>`;textoMensagem+=`📅 Mensalidade: R$ ${valorMensal.toFixed(2).replace(".",",")}\n`;}
        if(quantidade>=3){ofertaBox.style.display="block"; ofertaBox.className="oferta"; ofertaBox.innerHTML=`🌟 <strong>Oferta Especial para Frotas!</strong><br><br>Você possui 3 ou mais veículos? Fale agora com um de nossos especialistas e aproveite condições personalizadas para sua frota!<br><br>💼 Atendimento exclusivo • 📦 Pacotes empresariais • 💰 Economia garantida!`;}
        beneficiosBox.className="sucesso"; beneficiosBox.innerHTML=`✨ <strong>Benefícios que você vai ter com a Rastreando GPS:</strong><br><br>✅ <strong>LOCALIZAÇÃO</strong> em tempo real<br>⚠️ <strong>ALERTAS</strong> de ignição<br>🔒 <strong>BLOQUEIO</strong> e <strong>DESBLOQUEIO</strong><br>🛣️ <strong>HISTÓRICO</strong> de rotas e <strong>VELOCIDADE</strong><br>📱 <strong>ANDROID</strong> e <strong>iOS</strong><br>🙋‍♂️ <strong>SUPORTE</strong> humano rápido e atencioso<br><br>🚘 <strong>SEGURANÇA</strong>, praticidade e controle em um só lugar!<br><br><span class="pulsando">Clique no botão abaixo e agende sua instalação 👇</span>`;
        const textoEncoded=encodeURIComponent(textoMensagem);
        whatsapp.querySelector("a").href=`https://wa.me/5521969312625?text=${textoEncoded}`;
        botaoExtraAcimaVideo.querySelector("a").href=`https://wa.me/5521969312625?text=${textoEncoded}`;
        botaoWhatsAppAbaixoMensalidade.style.display="block";
        botaoWhatsAppAbaixoMensalidade.querySelector("a").href=`https://wa.me/5521969312625?text=${textoEncoded}`;
      } else {
        popup.className = "erro";
        popup.innerHTML = `❌ Este bairro não foi encontrado.<br>📌 Verifique se você digitou corretamente o nome da cidade.<br><br>Exemplo: São Cristóvão, Niterói, Duque de Caxias, Nova Iguaçu`;
        mensalidadeBox.style.display = "none";
        beneficiosBox.style.display = "none";
        ofertaBox.style.display = "none";
        botãoBairroNaoEncontrado.style.display = "block";
        botaoExtraAcimaVideo.style.display = "none";
        botaoWhatsAppAbaixoMensalidade.style.display = "none";
      }
    }

    let indexAtual = 0;
    const imagens = document.querySelectorAll("#carousel img");
    setInterval(() => {
      imagens[indexAtual].classList.remove("active");
      indexAtual = (indexAtual + 1) % imagens.length;
      imagens[indexAtual].classList.add("active");
    }, 3000);
  </script>

</body>
</html>
