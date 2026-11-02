/* 01/11/2026 (dono): a página /rastreador virou também a página inicial do site.
   Quem veio do anúncio do Google continua mandando "Vi o anúncio no Google"; quem chegou por outro caminho manda "Vi o site". */
var VEIO_DO_GOOGLE_ADS = (function () {
  try {
    var q = new URLSearchParams(location.search);
    var ads = q.has("gclid") || q.has("gbraid") || q.has("wbraid") || /google/i.test(q.get("utm_source") || "") && /cpc|ads|paid/i.test(q.get("utm_medium") || "cpc");
    if (ads) sessionStorage.setItem("rg_origem", "ads");
    return ads || sessionStorage.getItem("rg_origem") === "ads";
  } catch (e) { return true; }
})();
function textoOrigem(t) { return VEIO_DO_GOOGLE_ADS ? t : String(t).replace("Vi o anúncio no Google e ", "Vi o site e "); }
function linksOrigem() {
  if (VEIO_DO_GOOGLE_ADS) return;
  var a = document.querySelectorAll('a[href*="wa.me/"]');
  for (var i = 0; i < a.length; i++) a[i].href = a[i].getAttribute("href").replace("Vi%20o%20an%C3%BAncio%20no%20Google%20e%20", "Vi%20o%20site%20e%20");
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", linksOrigem); else linksOrigem();

/* Rastreando GPS — página /rastreador
   CONFIGURAÇÃO: troque aqui preços, faixas e a tag do Google Ads. */
var CONFIG = {
  whatsapp: "5521980886087",
  // Base da equipe (Jardim 25 de Agosto, Duque de Caxias) — coordenada arredondada
  base: { lat: -22.787, lon: -43.308 },
  // Chave do Google só para calcular a rota (restrita a este site e à Routes API; teto de 300/dia)
  googleRotasChave: "AIzaSyDBA1qcNcAgZ3XB5smm67o09m8fQpfNz-k",
  // Preço da instalação por KM DE ESTRADA a partir da base. valor null = "Consultar pelo WhatsApp"
  // Mais de um veículo na mesma visita: valor de cada veículo extra (2º, 3º, 4º). 5 ou mais = frota (WhatsApp)
  extras: [69.90, 69.90, 59.90],
  faixas: [
    { ateKm: 42, regiao: 1, valor: 89.90 },
    { ateKm: 50, regiao: 2, valor: 120.00 },
    { ateKm: 55, regiao: 3, valor: 150.00 },
    { ateKm: 60, regiao: 4, valor: 180.00 },
    { ateKm: 99999, regiao: null, valor: null }
  ],
  // Cidades da serra: sempre "Consultar" (pedágio/subida), mesmo dentro dos km
  serra: ["petropolis", "teresopolis", "nova friburgo", "miguel pereira", "paty do alferes",
    "sao jose do vale do rio preto", "areal", "tres rios", "paraiba do sul", "vassouras",
    "mendes", "engenheiro paulo de frontin", "sumidouro", "bom jardim", "duas barras", "sapucaia",
    "itaipava", "corrêas", "correas", "secretario", "pedro do rio", "araras"],
  // Região dos Lagos (técnico em Rio das Ostras): preço fixo, vale mais que o km.
  // "sim" = atende por esse preço; "nao" = Consultar (cidades no meio que ficam de fora).
  lagos: {
    valor: 150.00,
    cidades: [
      { nome: "saquarema", lat: -22.9292, lon: -42.5099, sim: true },
      { nome: "araruama", lat: -22.8728, lon: -42.3428, sim: true },
      { nome: "iguaba grande", lat: -22.8392, lon: -42.2289, sim: true },
      { nome: "sao pedro da aldeia", lat: -22.8392, lon: -42.1026, sim: true },
      { nome: "armacao dos buzios", lat: -22.7469, lon: -41.8817, sim: true },
      { nome: "buzios", lat: -22.7469, lon: -41.8817, sim: true },
      { nome: "rio das ostras", lat: -22.5269, lon: -41.9450, sim: true },
      { nome: "macae", lat: -22.3768, lon: -41.7869, sim: true },
      { nome: "cabo frio", lat: -22.8894, lon: -42.0286, sim: true },
      { nome: "arraial do cabo", lat: -22.9661, lon: -42.0278, sim: true },
      { nome: "unamar", lat: -22.6460, lon: -42.0040, sim: false },
      { nome: "tamoios", lat: -22.6460, lon: -42.0040, sim: false },
      { nome: "casimiro de abreu", lat: -22.4812, lon: -42.2042, sim: false },
      { nome: "barra de sao joao", lat: -22.5960, lon: -41.9930, sim: false },
      { nome: "silva jardim", lat: -22.6510, lon: -42.3920, sim: false }
    ]
  },
  // Google Ads: preencher quando tiver (ex.: "AW-123456789" e o rótulo da conversão)
  googleAdsId: "AW-16522124473",
  googleAdsRotuloWhatsApp: "7qkoCIG7j68dELm5rsY9",
  // Medição (30/10): Google Analytics 4 e Microsoft Clarity — só carregam com o aceite dos cookies
  ga4Id: "G-2HEF1MKTG3",
  clarityId: "z6211xuz4x"
};

(function () {
  "use strict";

  /* ---------- Google (Ads + Analytics) com "modo de consentimento" (30/10) ----------
     Sem o "Aceitar": nenhum cookie; o Google recebe só avisos anônimos e estima o que falta.
     Com o "Aceitar": medição completa. O Clarity só carrega com o "Aceitar". */
  var CHAVE = "rg_cookies";
  function ler() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravar(v) { try { localStorage.setItem(CHAVE, v); } catch (e) {} }
  var aceitou = ler() === "sim";
  var googleLigado = !!(CONFIG.googleAdsId || CONFIG.ga4Id);
  if (googleLigado) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    var est = aceitou ? "granted" : "denied";
    window.gtag("consent", "default", { ad_storage: est, analytics_storage: est, ad_user_data: est, ad_personalization: est });
    window.gtag("set", "ads_data_redaction", true);
    window.gtag("set", "url_passthrough", true);
    window.gtag("js", new Date());
    if (CONFIG.googleAdsId) window.gtag("config", CONFIG.googleAdsId);
    if (CONFIG.ga4Id) window.gtag("config", CONFIG.ga4Id);
    // o script do Google só entra quando a pessoa mexe na página (rolar, tocar) ou depois de 6 s,
    // para não pesar na abertura; os eventos ficam guardados e vão todos quando ele chega
    var googlePosto = false;
    var poeGoogle = function () {
      if (googlePosto) return; googlePosto = true;
      ["scroll", "touchstart", "mousemove", "keydown", "click"].forEach(function (t) { window.removeEventListener(t, poeGoogle, { passive: true }); });
      var s = document.createElement("script");
      s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.ga4Id || CONFIG.googleAdsId);
      document.head.appendChild(s);
    };
    ["scroll", "touchstart", "mousemove", "keydown", "click"].forEach(function (t) { window.addEventListener(t, poeGoogle, { passive: true }); });
    window.addEventListener("load", function () { setTimeout(poeGoogle, 6000); });
  }
  function medir(nome, params) {
    try {
      if (CONFIG.ga4Id && window.gtag) window.gtag("event", nome, Object.assign({ send_to: CONFIG.ga4Id }, params || {}));
      if (window.clarity) window.clarity("event", nome);
    } catch (e) {}
  }
  function semAcento(s) { return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  // Último pedaço do endereço (a cidade), ignorando "RJ", "Brasil" e o CEP
  function cidadeDoTexto(texto) {
    var partes = semAcento(texto).replace(/\(cep[^)]*\)/g, "").split(/[,\-]/).map(function (p) { return p.trim(); })
      .filter(function (p) { return p && !/^(rj|brasil|rio de janeiro estado|\d[\d .]*)$/.test(p); });
    return " " + (partes.length ? partes[partes.length - 1] : "").replace(/[^a-z0-9]+/g, " ") + " ";
  }
  function distLinhaKm(aLat, aLon, bLat, bLon) {
    var R = 6371, r = Math.PI / 180, dLa = (bLat - aLat) * r, dLo = (bLon - aLon) * r;
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  // Região dos Lagos: devolve true (R$ 150), false (Consultar) ou null (não é Lagos)
  function lagos(texto, ll) {
    var t = cidadeDoTexto(texto), c, i;
    for (i = 0; i < CONFIG.lagos.cidades.length; i++) {
      c = CONFIG.lagos.cidades[i];
      if (t.indexOf(" " + c.nome + " ") >= 0) return c.sim;
    }
    // Sem a cidade escrita: usa a cidade mais perto do ponto (só a leste de Maricá)
    if (!ll || ll.longitude < -42.65) return null;
    var melhor = null, dMelhor = 15;
    for (i = 0; i < CONFIG.lagos.cidades.length; i++) {
      c = CONFIG.lagos.cidades[i];
      var d = distLinhaKm(ll.latitude, ll.longitude, c.lat, c.lon);
      if (d < dMelhor) { dMelhor = d; melhor = c; }
    }
    return melhor ? melhor.sim : null;
  }
  function ehSerra(texto) {
    var t = cidadeDoTexto(texto);
    return CONFIG.serra.some(function (c) { return t.indexOf(" " + semAcento(c) + " ") >= 0; });
  }
  function brl(v) { return "R$ " + v.toFixed(2).replace(".", ","); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function waLink(texto) { return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto); }

  /* ---------- 2. Buscador de preço por km de estrada (Google) ---------- */
  var form = document.getElementById("busca");
  var campo = document.getElementById("busca-q");
  var res = document.getElementById("resultado");
  if (form) form.hidden = false;

  function viaCep(cep) {
    return fetch("https://viacep.com.br/ws/" + cep + "/json/").then(function (r) { return r.json(); })
      .then(function (j) { return j && !j.erro ? j : null; });
  }

  // Pede ao Google a rota de carro da base até o endereço. Devolve {km} ou {naoAchou:true}.
  function rotaGoogle(endereco, aceitaCidade) {
    return fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": CONFIG.googleRotasChave,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.legs.endLocation,geocodingResults"
      },
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: CONFIG.base.lat, longitude: CONFIG.base.lon } } },
        destination: { address: endereco },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE",
        languageCode: "pt-BR",
        regionCode: "BR"
      })
    }).then(function (r) {
      if (r.status === 400 || r.status === 404) return { naoAchou: true };
      if (!r.ok) throw new Error("google " + r.status);
      return r.json();
    }).then(function (j) {
      if (j.naoAchou) return j;
      var rt = j.routes && j.routes[0];
      if (!rt || !rt.distanceMeters) return { naoAchou: true };
      // Endereço vago demais (ex.: só "RJ" ou "Brasil"): pede para detalhar
      var geo = (j.geocodingResults && j.geocodingResults.destination) || {};
      var tipos = geo.type || [];
      if (tipos.indexOf("country") >= 0 || tipos.indexOf("administrative_area_level_1") >= 0) return { naoAchou: true };
      // Google não entendeu o texto e "chutou" uma cidade inteira: trata como não encontrado
      var grosso = tipos.indexOf("locality") >= 0 || tipos.some(function (t) { return t.indexOf("administrative_area") === 0; });
      if (geo.partialMatch && grosso && !aceitaCidade) return { naoAchou: true };
      var fimLL = rt.legs && rt.legs[0] && rt.legs[0].endLocation && rt.legs[0].endLocation.latLng;
      var noRJ = !fimLL || (fimLL.latitude > -23.45 && fimLL.latitude < -20.7 && fimLL.longitude > -44.95 && fimLL.longitude < -40.9);
      return { km: rt.distanceMeters / 1000, noRJ: noRJ, ll: fimLL };
    });
  }

  function mostrar(html) { res.innerHTML = html; }

  // Modelo do veículo (obrigatório, preenchido antes de ver o preço)
  var campoModelo = document.getElementById("busca-modelo");
  var caixaModelo = document.getElementById("modelo-campo");
  var avisoModelo = document.getElementById("modelo-aviso");
  var modeloAtual = "";
  var qtdAtual = 1;
  var rotuloModelo = document.getElementById("modelo-rotulo");
  if (caixaModelo) caixaModelo.hidden = false;
  // Quantidade de veículos: 1 = modelo obrigatório; 2 a 4 = modelos opcionais; 5+ = frota
  if (form) form.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("[data-qtd]");
    if (!b) return;
    qtdAtual = +b.getAttribute("data-qtd");
    form.querySelectorAll("[data-qtd]").forEach(function (x) { x.classList.toggle("ativo", x === b); x.setAttribute("aria-pressed", x === b); });
    campoModelo.parentNode.classList.remove("erro"); if (avisoModelo) avisoModelo.hidden = true;
    if (qtdAtual === 1) { rotuloModelo.textContent = "Qual é o modelo do seu veículo?"; campoModelo.placeholder = "Ex.: Onix, CG 160, Bongo"; }
    else if (qtdAtual < 5) { rotuloModelo.innerHTML = 'Quais são os modelos? <small>(opcional)</small>'; campoModelo.placeholder = qtdAtual === 2 ? "Ex.: Onix e Strada" : qtdAtual === 3 ? "Ex.: 2 Onix e 1 Strada" : "Ex.: 2 Onix, 1 Strada e 1 CG 160"; }
    else { rotuloModelo.innerHTML = 'Quais são os veículos? <small>(opcional)</small>'; campoModelo.placeholder = "Ex.: 8 caminhões e 3 motos"; }
  });
  function totalInstalacao(primeiro) {
    var t = primeiro;
    for (var i = 0; i < qtdAtual - 1; i++) t += CONFIG.extras[i];
    return Math.round(t * 100) / 100;
  }
  function detalheExtras(primeiro) {
    var d = ["1º " + brl(primeiro)], ex = CONFIG.extras;
    if (qtdAtual >= 2) d.push(qtdAtual >= 3 && ex[1] === ex[0] ? "2º e 3º " + brl(ex[0]) + " cada" : "2º " + brl(ex[0]));
    if (qtdAtual >= 3 && ex[1] !== ex[0]) d.push("3º " + brl(ex[1]));
    if (qtdAtual >= 4) d.push("4º " + brl(ex[2]));
    return d.join(" · ");
  }
  function nomeQtd() { return qtdAtual + " veículos"; }
  if (campoModelo) {
    campoModelo.addEventListener("input", function () {
      if (campoModelo.value.trim().length >= 2) { campoModelo.parentNode.classList.remove("erro"); if (avisoModelo) avisoModelo.hidden = true; }
    });
    campoModelo.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); campo.focus(); } });
  }
  // Mensagem do WhatsApp organizada em linhas (o *texto* sai em negrito no WhatsApp)
  function mensagem(intro, endereco, extras) {
    var l = ["Olá! 👋 " + textoOrigem(intro), ""];
    if (qtdAtual > 1) l.push("🔢 *Quantidade:* " + (qtdAtual >= 5 ? "5 ou mais veículos" : nomeQtd()));
    if (modeloAtual) l.push("🚗 *" + (qtdAtual > 1 ? "Veículos" : "Veículo") + ":* " + modeloAtual);
    l.push("📍 *Endereço:* " + endereco);
    return l.concat(extras || []).join("\n");
  }
  function botaoWa(txt, rotulo) {
    return '<a class="btn btn--wa btn--lg" data-wa target="_blank" rel="noopener" href="' + esc(waLink(txt)) + '"><svg class="ic" aria-hidden="true"><use href="#i-wa"/></svg> ' + rotulo + '</a>';
  }

  // Mapinha com a agulha no endereço encontrado, para o cliente conferir
  var pinLL = null;
  function mapa() {
    if (!pinLL || pinLL.latitude == null) return "";
    var ll = pinLL.latitude.toFixed(6) + "," + pinLL.longitude.toFixed(6);
    var src = "https://maps.googleapis.com/maps/api/staticmap?center=" + ll + "&zoom=12&size=600x200&scale=2" +
      "&markers=color:red%7C" + ll + "&language=pt-BR&region=BR&key=" + CONFIG.googleRotasChave;
    return '<div class="res__mapa"><img src="' + src + '" alt="Mapa com o endereço pesquisado" width="600" height="200" onerror="this.parentNode.remove()"></div>';
  }
  var IC_OK = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="m7.8 12.2 2.9 2.9 5.6-5.8"/></g></svg>';
  // Bloco "Local da instalação": endereço, corrigir e mapinha
  function local(endTxt) {
    return '<div class="res__div"></div><div class="res__local"><svg class="ic" aria-hidden="true"><use href="#i-pin"/></svg><div>' +
      '<b>Local da instalação</b><p>' + esc(endTxt) + '</p>' +
      '<button type="button" class="res__corrigir" data-corrigir>Não é aqui? Corrigir o endereço</button></div></div>' + mapa();
  }
  /* ---------- Orçamento em janela (modal) + barra fixa embaixo ao fechar ---------- */
  var orc = null, orcBarra = null, barraInfo = null;
  if (res) {
    orc = document.createElement("div");
    orc.className = "orc"; orc.setAttribute("role", "dialog"); orc.setAttribute("aria-modal", "true"); orc.setAttribute("aria-label", "Seu orçamento");
    orc.innerHTML = '<div class="orc__caixa"><button type="button" class="orc__x" aria-label="Fechar">×</button></div>';
    document.body.appendChild(orc);
    orc.firstChild.appendChild(res);
    orcBarra = document.createElement("div");
    orcBarra.className = "orc-barra";
    document.body.appendChild(orcBarra);
  }
  function orcAberto() { return orc && orc.classList.contains("aberto"); }
  function abrirOrc() {
    if (!orc || orcAberto()) return;
    orc.classList.add("aberto");
    document.documentElement.classList.add("orc-trava");
    esconderBarra();
    if (typeof atualizaFixo === "function") atualizaFixo();
    try { history.pushState({ orc: 1 }, ""); } catch (e) {}
    setTimeout(function () { orc.querySelector(".orc__x").focus({ preventScroll: true }); }, 50);
  }
  function fecharOrc(mostraBarra) {
    if (!orcAberto()) return;
    orc.classList.remove("aberto");
    document.documentElement.classList.remove("orc-trava");
    if (mostraBarra !== false && barraInfo) mostrarBarra();
    if (typeof atualizaFixo === "function") atualizaFixo();
  }
  // Fechar pelo X, pelo fundo escuro ou pelo "voltar" do celular
  function pedirFechar(mostraBarra) {
    proximoFechar = mostraBarra;
    if (history.state && history.state.orc) history.back(); else fecharOrc(mostraBarra);
  }
  var proximoFechar = true;
  window.addEventListener("popstate", function () { if (orcAberto()) { fecharOrc(proximoFechar); proximoFechar = true; } });
  if (orc) {
    orc.addEventListener("click", function (ev) {
      if (ev.target === orc || ev.target.closest(".orc__x")) pedirFechar(true);
    });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && orcAberto()) pedirFechar(true); });
  }
  function mostrarBarra() {
    var a = res.querySelector("a[data-wa]");
    orcBarra.innerHTML = '<button type="button" class="orc-barra__info"><small>' + (qtdAtual > 1 ? '🚗 <i>' + nomeQtd() + '</i> · ' : modeloAtual ? '🚗 <i>' + esc(modeloAtual) + '</i> · ' : 'Seu orçamento · ') + 'toque para ver</small><b>' + barraInfo + '</b></button>' +
      (a ? '<a class="orc-barra__wa" data-wa target="_blank" rel="noopener" href="' + esc(a.href) + '"><svg class="ic" aria-hidden="true"><use href="#i-wa"/></svg> ' + (barraInfo.indexOf("R$") === 0 ? "Agendar" : "Falar") + '</a>' : '');
    orcBarra.classList.add("ver");
    document.documentElement.classList.add("tem-orc");
  }
  function esconderBarra() {
    if (!orcBarra) return;
    orcBarra.classList.remove("ver");
    document.documentElement.classList.remove("tem-orc");
  }
  if (orcBarra) orcBarra.addEventListener("click", function (ev) {
    if (ev.target.closest(".orc-barra__info")) { medir("orcamento_reaberto"); abrirOrc(); }
  });

  if (res) res.addEventListener("click", function (ev) {
    if (!ev.target.closest("[data-corrigir]")) return;
    medir("corrigir_endereco");
    barraInfo = null;
    pedirFechar(false);
    setTimeout(function () {
      campo.scrollIntoView({ behavior: "smooth", block: "center" });
      campo.focus(); campo.select();
    }, 80);
  });

  function linhaPara() {
    if (qtdAtual > 1) return '<p class="res__para">Instalação de <b>' + nomeQtd() + '</b>' + (modeloAtual ? ': ' + esc(modeloAtual) : '') + '</p>';
    return modeloAtual ? '<p class="res__para">Instalação para <b>' + esc(modeloAtual) + '</b></p>' : '';
  }
  function mensBloco() {
    return '<p class="res__mens"><span>Mensalidade</span><b>R$ 59,90<small>/mês</small>' + (qtdAtual > 1 ? '<em class="res__porv">por veículo</em>' : '') + '</b></p>';
  }

  // 5 ou mais veículos: atendimento de frota
  function resultadoFrota(endTxt) {
    medir("busca_preco", { resultado: "frota" });
    barraInfo = null;
    var txt = mensagem("Vi o anúncio no Google e quero rastreador para a minha frota.", endTxt || "(a combinar)");
    mostrar('<div class="res">' +
      '<p class="res__tit">' + IC_OK + ' Atendimento para frotas</p>' +
      '<p class="res__para">Para <b>5 ou mais veículos</b>, montamos um orçamento especial para a sua empresa.</p>' +
      mensBloco() +
      '<p class="res__ok">' + IC_OK + ' Todos os veículos num só aplicativo</p>' +
      '<p class="res__ok">' + IC_OK + ' Sem contrato de fidelidade</p>' +
      '<p class="res__pergunta">Fale com a gente para receber o valor:</p>' +
      botaoWa(txt, "Pedir orçamento da frota") + '</div>');
  }

  function resultadoConsultar(endTxt, motivo) {
    medir("busca_preco", { resultado: "consultar" });
    barraInfo = "Verificar valor com o atendente";
    var txt = mensagem("Vi o anúncio no Google e quero saber o valor da instalação.", endTxt);
    mostrar('<div class="res">' +
      linhaPara() +
      '<p class="res__lbl">Valor da instalação</p><p class="res__cons">Verificar valor com o atendente para a sua região</p>' +
      '<p class="res__det">' + esc(motivo) + '</p>' +
      mensBloco() +
      local(endTxt) +
      botaoWa(txt, "Verificar valor pelo WhatsApp") + '</div>');
  }

  /* 01/11/2026: linha animada agendado → instalado → rastreado (só imagens) no quadro do orçamento */
  var JORNADA = "<div class=\"jor play\" role=\"img\" aria-label=\"Agende, instale, rastreie\"><span class=\"jor__seg jor__seg--ponta\"></span><span class=\"jor__ic\" title=\"Agendado\"><svg viewBox=\"0 0 64 64\" aria-hidden=\"true\"><defs><linearGradient id=\"calBody\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"#DDE7EF\"/></linearGradient><linearGradient id=\"calTop\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#50DC91\"/><stop offset=\"1\" stop-color=\"#0D9A51\"/></linearGradient><linearGradient id=\"calTick\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#7EEDAE\"/><stop offset=\"1\" stop-color=\"#12A95B\"/></linearGradient></defs><ellipse cx=\"32\" cy=\"55\" rx=\"18\" ry=\"3.5\" fill=\"#1C5136\" opacity=\".14\"/><rect x=\"10\" y=\"12\" width=\"44\" height=\"40\" rx=\"11\" fill=\"#9CAEBB\" opacity=\".35\"/><rect x=\"9\" y=\"9\" width=\"44\" height=\"40\" rx=\"11\" fill=\"url(#calBody)\" stroke=\"#D3DCE4\"/><path d=\"M20 9h22a11 11 0 0 1 11 11v5H9v-5A11 11 0 0 1 20 9Z\" fill=\"url(#calTop)\"/><rect x=\"18\" y=\"5\" width=\"5\" height=\"12\" rx=\"2.5\" fill=\"#CBD7DD\" stroke=\"#9EADB8\" stroke-width=\".7\"/><rect x=\"39\" y=\"5\" width=\"5\" height=\"12\" rx=\"2.5\" fill=\"#CBD7DD\" stroke=\"#9EADB8\" stroke-width=\".7\"/><circle cx=\"31\" cy=\"36\" r=\"11.5\" fill=\"url(#calTick)\"/><path d=\"m25.5 35.8 4 4.1 7.8-8.2\" stroke=\"#fff\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/></svg><b class=\"jor__txt\">Agende</b></span><span class=\"jor__seg jor__seg--a\"></span><span class=\"jor__ic\" title=\"Instalado\"><svg viewBox=\"0 0 64 64\" aria-hidden=\"true\"><defs><linearGradient id=\"ferMet\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#F4F8FC\"/><stop offset=\".45\" stop-color=\"#BBCBD7\"/><stop offset=\"1\" stop-color=\"#7C91A3\"/></linearGradient><linearGradient id=\"ferCabo\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop stop-color=\"#5FE29C\"/><stop offset=\".5\" stop-color=\"#1FBC68\"/><stop offset=\"1\" stop-color=\"#087F43\"/></linearGradient><linearGradient id=\"gpsCx\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop stop-color=\"#475569\"/><stop offset=\"1\" stop-color=\"#111827\"/></linearGradient></defs><ellipse cx=\"30\" cy=\"57\" rx=\"24\" ry=\"3.2\" fill=\"#0f172a\" opacity=\".15\"/><path d=\"M10 46c-4 0-6 2-6 5\" stroke=\"#dc2626\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M10 49c-3 0-4.5 1.6-4.5 4\" stroke=\"#111827\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\"/><rect x=\"9\" y=\"31\" width=\"34\" height=\"23\" rx=\"5.5\" fill=\"#0f172a\" opacity=\".25\" transform=\"translate(1.5 1.5)\"/><rect x=\"9\" y=\"31\" width=\"34\" height=\"23\" rx=\"5.5\" fill=\"url(#gpsCx)\"/><rect x=\"11.5\" y=\"33\" width=\"29\" height=\"3\" rx=\"1.5\" fill=\"#fff\" opacity=\".18\"/><circle cx=\"18\" cy=\"44\" r=\"2.6\" fill=\"#22c55e\"/><circle cx=\"18\" cy=\"44\" r=\"4.6\" fill=\"#22c55e\" opacity=\".25\"/><path d=\"M28 47.5a6 6 0 0 1 8.5-8.5M30.6 45a2.4 2.4 0 0 1 3.4-3.4\" stroke=\"#7AF3B0\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(42 21) scale(.7) translate(-32 -31) rotate(45 32 31)\"><path d=\"M32 3.5a13 13 0 0 0-6.5 24.3V31h13v-3.2A13 13 0 0 0 32 3.5Z\" fill=\"url(#ferMet)\" stroke=\"#8CA1B2\" stroke-width=\"1.4\"/><path d=\"M27.8 2.5h8.4v8.2a2 2 0 0 1-2 2h-4.4a2 2 0 0 1-2-2Z\" fill=\"#F4F7F9\"/><path d=\"M27.8 4v6.7a2 2 0 0 0 2 2h4.4a2 2 0 0 0 2-2V4\" fill=\"none\" stroke=\"#8CA1B2\" stroke-width=\"1.4\"/><rect x=\"25\" y=\"29\" width=\"14\" height=\"30\" rx=\"7\" fill=\"url(#ferCabo)\" stroke=\"#0C9350\"/><rect x=\"28.3\" y=\"34\" width=\"2.6\" height=\"20\" rx=\"1.3\" fill=\"#C7FFE0\" opacity=\".65\"/></g></svg><b class=\"jor__txt\">Instale</b></span><span class=\"jor__seg jor__seg--b\"></span><span class=\"jor__ic jor__ic--fim\" title=\"Rastreado\"><svg viewBox=\"0 0 64 64\" aria-hidden=\"true\"><defs><linearGradient id=\"celAro\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#475569\"/><stop offset=\"1\" stop-color=\"#0F172A\"/></linearGradient><linearGradient id=\"celTela\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop stop-color=\"#ECFDF3\"/><stop offset=\"1\" stop-color=\"#D1FAE5\"/></linearGradient><linearGradient id=\"carCorpo\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop stop-color=\"#475569\"/><stop offset=\"1\" stop-color=\"#1E293B\"/></linearGradient><linearGradient id=\"carVidro\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#E0F2FE\"/><stop offset=\"1\" stop-color=\"#93C5FD\"/></linearGradient><clipPath id=\"celClip\"><rect x=\"20\" y=\"8\" width=\"24\" height=\"46\" rx=\"3.5\"/></clipPath></defs><ellipse cx=\"32\" cy=\"60\" rx=\"17\" ry=\"2.6\" fill=\"#0f172a\" opacity=\".16\"/><rect x=\"17\" y=\"2.5\" width=\"30\" height=\"57\" rx=\"7\" fill=\"#0f172a\" opacity=\".25\" transform=\"translate(1.5 1.5)\"/><rect x=\"17\" y=\"2.5\" width=\"30\" height=\"57\" rx=\"7\" fill=\"url(#celAro)\"/><rect x=\"20\" y=\"8\" width=\"24\" height=\"46\" rx=\"3.5\" fill=\"url(#celTela)\"/><g clip-path=\"url(#celClip)\"><path d=\"M12 22 52 40\" stroke=\"#fff\" stroke-width=\"5\"/><path d=\"M14 16 50 30\" stroke=\"#BBF7D0\" stroke-width=\"2.5\"/></g><rect x=\"28\" y=\"4.6\" width=\"8\" height=\"1.8\" rx=\".9\" fill=\"#94A3B8\"/><circle cx=\"32\" cy=\"31\" r=\"10.5\" fill=\"#22c55e\" opacity=\".16\"/><g transform=\"translate(32 32) scale(.42) translate(-33 -42)\"><path d=\"M6 50v-6.5c0-2.1 1.4-3.6 3.4-4.1l6.4-1.6 7-7.6c1.1-1.2 2.5-1.8 4.1-1.8h12.4c1.7 0 3.2.8 4.3 2.1l5.8 7 5.1 1.3c2 .5 3.5 2.2 3.5 4.3V50c0 1.2-1 2.2-2.2 2.2H8.2C7 52.2 6 51.2 6 50Z\" fill=\"url(#carCorpo)\"/><path d=\"M22.5 38.2 28 32.3c.6-.6 1.3-.9 2.1-.9H38v6.8Z\" fill=\"url(#carVidro)\"/><path d=\"M40.6 31.4h2.1c.9 0 1.7.4 2.3 1.1l4.4 5.7h-8.8Z\" fill=\"url(#carVidro)\"/><circle cx=\"18.5\" cy=\"51.5\" r=\"6\" fill=\"#0F172A\"/><circle cx=\"18.5\" cy=\"51.5\" r=\"2.6\" fill=\"#CBD5E1\"/><circle cx=\"45.5\" cy=\"51.5\" r=\"6\" fill=\"#0F172A\"/><circle cx=\"45.5\" cy=\"51.5\" r=\"2.6\" fill=\"#CBD5E1\"/></g></svg><b class=\"jor__txt\">Rastreie</b></span><span class=\"jor__seg jor__seg--ponta\"></span></div>";

  function resultadoPreco(endTxt, faixa, km) {
    medir("busca_preco", { resultado: (typeof faixa.regiao === "number" ? "regiao_" + faixa.regiao : "lagos"), valor: totalInstalacao(faixa.valor), quantidade: qtdAtual });
    var nomeReg = typeof faixa.regiao === "number" ? "Região " + faixa.regiao : faixa.regiao;
    var total = totalInstalacao(faixa.valor), varios = qtdAtual > 1;
    barraInfo = brl(total) + " + " + (varios ? qtdAtual + " × " : "") + "R$ 59,90/mês";
    var txt = mensagem("Vi o anúncio no Google e quero agendar a instalação do rastreador.", endTxt, [
      "🗺️ *Região:* " + nomeReg + " (" + Math.round(km) + " km)",
      "",
      "💰 *Valor informado no site:*",
      "Instalação: " + brl(total) + (varios ? " (" + detalheExtras(faixa.valor) + ")" : ""),
      "Mensalidade: " + (varios ? qtdAtual + " × " : "") + "R$ 59,90/mês"
    ]);
    mostrar('<div class="res">' +
      '<p class="res__tit">' + IC_OK + ' Seu orçamento está pronto!</p>' +
      linhaPara() +
      '<p class="res__lbl">Valor da instalação' + (varios ? ' (' + nomeQtd() + ')' : '') + '</p>' +
      '<p class="res__val">' + brl(total) + ' <small>pagamento único</small></p>' +
      (varios ? '<p class="res__extras">' + detalheExtras(faixa.valor) + '</p>' : '') +
      mensBloco() +
      '<p class="res__ok">' + IC_OK + ' Sem contrato de fidelidade</p>' +
      local(endTxt) +
      JORNADA +
      '<p class="res__pergunta">Deseja agendar sua instalação?</p>' +
      botaoWa(txt, "Agendar pelo WhatsApp") +
      '<p class="res__rod"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g></svg> Agendamento rápido pelo WhatsApp</p>' +
      '</div>');
  }

  function naoAchou(q) {
    medir("busca_preco", { resultado: "nao_encontrado" });
    barraInfo = null;
    var txt = mensagem("Vi o anúncio no Google e quero saber o valor da instalação.", q);
    mostrar('<div class="res"><p class="res__err">Não encontramos esse endereço. Tente com <b>rua, número, bairro e cidade</b>, ou o <b>CEP</b>.</p>' +
      '<p class="res__det" style="margin-top:8px">Se preferir, mande o endereço no WhatsApp e respondemos o valor.</p>' +
      botaoWa(txt, "Mandar no WhatsApp") + '</div>');
  }

  function falhou(q) {
    medir("busca_preco", { resultado: "erro" });
    barraInfo = null;
    var txt = mensagem("Vi o anúncio no Google e quero saber o valor da instalação.", q);
    mostrar('<div class="res"><p class="res__err">Não conseguimos calcular agora.</p><p class="res__det" style="margin-top:8px">Mande o endereço no WhatsApp e respondemos o valor.</p>' +
      botaoWa(txt, "Mandar no WhatsApp") + '</div>');
  }

  function calcular(endTxt, r) {
    pinLL = r.ll || null;
    if (r.naoAchou) return naoAchou(endTxt);
    if (ehSerra(endTxt)) return resultadoConsultar(endTxt, "Na região serrana o valor depende do trajeto (pedágio e subida). Fale com a gente.");
    var lg = lagos(endTxt, r.ll);
    if (lg === true) return resultadoPreco(endTxt, { regiao: "Região dos Lagos", valor: CONFIG.lagos.valor }, r.km);
    if (lg === false) return resultadoConsultar(endTxt, "Fale com a gente para ver o valor da instalação nesse endereço.");
    if (!r.noRJ) return resultadoConsultar(endTxt, "Esse endereço fica fora do estado do Rio. Fale com a gente para ver se atendemos.");
    for (var i = 0; i < CONFIG.faixas.length; i++) {
      var f = CONFIG.faixas[i];
      if (r.km <= f.ateKm) {
        if (f.valor == null) return resultadoConsultar(endTxt, "Endereço fora da nossa área de atendimento padrão. Fale com a gente para ver o valor.");
        return resultadoPreco(endTxt, f, r.km);
      }
    }
  }

  if (form) form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var q = (campo.value || "").trim();
    if (campoModelo) {
      modeloAtual = campoModelo.value.trim().replace(/\s+/g, " ");
      if (qtdAtual === 1 && modeloAtual.length < 2) {
        campoModelo.parentNode.classList.add("erro"); if (avisoModelo) avisoModelo.hidden = false;
        campoModelo.focus(); return;
      }
    }
    if (qtdAtual >= 5) {
      campo.blur(); if (campoModelo) campoModelo.blur();
      esconderBarra(); resultadoFrota(q); abrirOrc(); return;
    }
    if (q.length < 3) { campo.focus(); return; }
    var bt = form.querySelector('button[type="submit"]'); bt.disabled = true;
    campo.blur(); if (campoModelo) campoModelo.blur();
    barraInfo = null; esconderBarra();
    mostrar('<p class="carregando">Calculando o valor no seu endereço…</p>');
    abrirOrc();
    var p;
    if (/^\d{5}-?\d{3}$/.test(q.replace(/\s/g, ""))) {
      // CEP: o ViaCEP dá o endereço por extenso; o Google calcula a rota até ele
      p = viaCep(q.replace(/\D/g, "")).then(function (c) {
        if (!c) return { endTxt: q, r: { naoAchou: true } };
        var endTxt = [c.logradouro, c.bairro, c.localidade].filter(Boolean).join(", ") + " (CEP " + c.cep + ")";
        if (c.uf !== "RJ") return { endTxt: endTxt, r: { km: 0, noRJ: false } };
        var dest = [c.logradouro, c.bairro, c.localidade, "RJ", c.cep, "Brasil"].filter(Boolean).join(", ");
        return rotaGoogle(dest, true).then(function (r) { return { endTxt: endTxt, r: r }; });
      });
    } else {
      var dest = /(\brj\b|rio de janeiro|brasil)/i.test(q) ? q + ", Brasil" : q + ", RJ, Brasil";
      p = rotaGoogle(dest).then(function (r) { return { endTxt: q, r: r }; });
    }
    p.then(function (o) { calcular(o.endTxt, o.r); })
      .catch(function () { falhou(q); })
      .then(function () {
        bt.disabled = false;
        // fechou a janela enquanto calculava: o orçamento aparece na barra de baixo
        if (!orcAberto() && barraInfo) mostrarBarra();
      });
  });

  /* ---------- Vídeos: carregam só ao tocar ---------- */
  document.addEventListener("click", function (ev) {
    var v = ev.target.closest && ev.target.closest("[data-vimeo]");
    if (!v) return;
    ev.preventDefault();
    var id = v.getAttribute("data-vimeo");
    // pausa outro vídeo que esteja tocando
    document.querySelectorAll(".video.tocando").forEach(function (o) {
      if (o !== v) { var f = o.querySelector("iframe"); if (f) f.remove(); o.classList.remove("tocando"); }
    });
    if (v.classList.contains("tocando")) return;
    var ifr = document.createElement("iframe");
    ifr.src = "https://player.vimeo.com/video/" + id + "?autoplay=1&title=0&byline=0&portrait=0&dnt=1&playsinline=1";
    ifr.allow = "autoplay; fullscreen; picture-in-picture";
    ifr.allowFullscreen = true;
    ifr.title = v.getAttribute("aria-label") || "Vídeo";
    v.appendChild(ifr);
    var vb = v.querySelector(".vbarra");
    if (!vb) { vb = document.createElement("span"); vb.className = "vbarra"; vb.innerHTML = "<i></i>"; v.appendChild(vb); }
    vb.firstChild.style.width = "0%";
    v.classList.add("tocando");
  });

  /* Quando o vídeo termina, volta a capa com o play (em vez da tela "Mais de..." do Vimeo) */
  window.addEventListener("message", function (ev) {
    if (!/^https:\/\/player\.vimeo\.com$/.test(ev.origin)) return;
    var d = ev.data; if (typeof d === "string") { try { d = JSON.parse(d); } catch (e) { return; } }
    if (!d) return;
    var ifr = null;
    document.querySelectorAll(".video.tocando iframe").forEach(function (f) { if (f.contentWindow === ev.source) ifr = f; });
    if (!ifr) return;
    if (d.event === "ready") {
      ifr.contentWindow.postMessage(JSON.stringify({ method: "addEventListener", value: "ended" }), "https://player.vimeo.com");
      ifr.contentWindow.postMessage(JSON.stringify({ method: "addEventListener", value: "finish" }), "https://player.vimeo.com");
      ifr.contentWindow.postMessage(JSON.stringify({ method: "addEventListener", value: "playProgress" }), "https://player.vimeo.com");
    } else if ((d.event === "playProgress" || d.event === "timeupdate") && d.data) {
      var bx = ifr.parentNode && ifr.parentNode.querySelector(".vbarra i");
      var pc = d.data.percent != null ? d.data.percent : (d.data.duration ? d.data.seconds / d.data.duration : 0);
      if (bx) bx.style.width = Math.min(100, pc * 100).toFixed(2) + "%";
      marcoVideo("vimeo_" + (ifr.parentNode.getAttribute("data-vimeo") || "?"), pc * 100);
    } else if (d.event === "ended" || d.event === "finish") {
      var box = ifr.parentNode; ifr.remove(); if (box) { box.classList.remove("tocando"); var b0 = box.querySelector(".vbarra i"); if (b0) b0.style.width = "0%"; }
    }
  });

  /* ---------- Vídeo do topo (no site): capa + play; toca com som; no fim volta para a capa ---------- */
  var bloqV = document.getElementById("bloq-video");
  var bloqBox = document.getElementById("video-topo");
  if (bloqV && bloqBox) {
    var iniciar = function () {
      if (bloqBox.classList.contains("tocando")) return;
      // pausa o vídeo da Fita se estiver com som
      var nv = document.getElementById("nfc-video"); if (nv && !nv.muted) { nv.muted = true; }
      bloqBox.classList.add("tocando");
      bloqV.controls = true; bloqV.muted = false; bloqV.preload = "auto";
      var p = bloqV.play(); if (p && p.catch) p.catch(function () {});
      /* 02/11/2026: no celular o vídeo é pequeno; ao tocar, abre em tela cheia */
      if (window.innerWidth < 900) {
        try {
          if (bloqV.requestFullscreen) { var f = bloqV.requestFullscreen(); if (f && f.catch) f.catch(function () {}); }
          else if (bloqV.webkitEnterFullscreen) bloqV.webkitEnterFullscreen();
        } catch (e) {}
      }
    };
    bloqBox.addEventListener("click", function (ev) { if (!bloqBox.classList.contains("tocando")) { ev.preventDefault(); iniciar(); } });
    bloqV.addEventListener("ended", function () {
      bloqV.controls = false; bloqBox.classList.remove("tocando");
      bloqV.currentTime = 0; bloqV.load();   // volta a mostrar a capa
    });
  }

  /* ---------- Vídeo da Fita NFC: toca sozinho (sem som) quando aparece na tela ---------- */
  var nfcV = document.getElementById("nfc-video");
  var nfcSom = document.getElementById("nfc-som");
  if (nfcV) {
    var tocar = function () { var p = nfcV.play(); if (p && p.catch) p.catch(function () {}); };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { if (nfcV.preload !== "auto") { nfcV.preload = "auto"; } tocar(); }
        else nfcV.pause();
      }, { threshold: 0.35 }).observe(nfcV);
    } else { nfcV.preload = "auto"; tocar(); }
    var alternarSom = function () {
      nfcV.muted = !nfcV.muted;
      if (!nfcV.muted) { tocar(); medir("fita_som_ligado", { segundo: Math.round(nfcV.currentTime) }); }   // continua de onde estava
      nfcSom.textContent = nfcV.muted ? "🔇 Toque para ativar o som" : "🔊 Som ligado";
      nfcSom.classList.toggle("ligado", !nfcV.muted);
      posSom();
      nfcSom.setAttribute("aria-label", nfcV.muted ? "Ligar o som do vídeo" : "Desligar o som do vídeo");
    };
    // Sem som: o botão aparece grande no meio quando a animação (3 s) passa para o vídeo
    var posSom = function () {
      if (!nfcSom) return;
      var noMeio = nfcV.muted && nfcV.currentTime >= 2.7;
      nfcSom.classList.toggle("nfc__som--centro", noMeio);
      nfcSom.classList.toggle("escondido", nfcV.muted && !noMeio);
    };
    nfcV.addEventListener("timeupdate", posSom); nfcV.addEventListener("seeked", posSom);
    if (nfcSom) nfcSom.addEventListener("click", function (ev) { ev.stopPropagation(); alternarSom(); });
    nfcV.addEventListener("click", alternarSom);
  }

  /* ---------- Vídeo do app: toca sozinho (sem som) quando aparece na tela ---------- */
  var appV = document.getElementById("app-video");
  /* 01/11/2026: escolhe o banner do celular ou do computador antes de carregar (o vídeo só baixa quando aparece na tela) */
  if (appV && appV.dataset.celular) {
    var largo = window.matchMedia && window.matchMedia("(min-width:760px)").matches;
    appV.poster = largo ? appV.dataset.computadorCapa : appV.dataset.celularCapa;
    appV.src = largo ? appV.dataset.computador : appV.dataset.celular;
    if (largo) { appV.width = 1200; appV.height = 420; }
  }
  if (appV) {
    var tocarApp = function () { var p = appV.play(); if (p && p.catch) p.catch(function () {}); };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { if (appV.preload !== "auto") { appV.preload = "auto"; } tocarApp(); }
        else appV.pause();
      }, { threshold: 0.35 }).observe(appV);
    } else { appV.preload = "auto"; tocarApp(); }
  }

  /* ---------- Barra de progresso nos vídeos do site (pedido do dono, 30/10) ---------- */
  [["bloq-video", "video-topo"], ["nfc-video", null], ["app-video", null]].forEach(function (par) {
    var vid = document.getElementById(par[0]); if (!vid) return;
    var caixa = par[1] ? document.getElementById(par[1]) : vid.parentNode; if (!caixa) return;
    var b = document.createElement("span"); b.className = "vbarra"; b.innerHTML = "<i></i>"; caixa.appendChild(b);
    var fill = b.firstChild, rodando = false;
    var pinta = function () {
      fill.style.width = vid.duration ? Math.min(100, vid.currentTime / vid.duration * 100).toFixed(2) + "%" : "0%";
      if (rodando) requestAnimationFrame(pinta);
    };
    vid.addEventListener("play", function () { if (!rodando) { rodando = true; requestAnimationFrame(pinta); } });
    vid.addEventListener("pause", function () { rodando = false; pinta(); });
    vid.addEventListener("ended", function () { rodando = false; pinta(); });
    vid.addEventListener("seeked", pinta);
    vid.addEventListener("emptied", function () { fill.style.width = "0%"; });
  });

  /* ---------- Medição dos vídeos, das seções e dos cliques ---------- */
  var marcosFeitos = {};
  function marcoVideo(nome, pct) {
    [[1, "inicio"], [25, "25"], [50, "50"], [75, "75"], [95, "fim"]].forEach(function (m) {
      var k = nome + "|" + m[1];
      if (pct >= m[0] && !marcosFeitos[k]) { marcosFeitos[k] = 1; medir(m[1] === "inicio" ? "video_inicio" : "video_progresso", { video: nome, marco: m[1] }); }
    });
  }
  [["bloq-video", "bloqueio_topo"], ["nfc-video", "fita_nfc"], ["app-video", "app"]].forEach(function (par) {
    var vid = document.getElementById(par[0]); if (!vid) return;
    vid.addEventListener("timeupdate", function () { if (vid.duration) marcoVideo(par[1], vid.currentTime / vid.duration * 100); });
  });
  if ("IntersectionObserver" in window) {
    var secVistas = {};
    var obsSec = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var nome = e.target.id || (e.target.className || "").split(" ")[0] || e.target.tagName.toLowerCase();
        if (secVistas[nome]) return; secVistas[nome] = 1;
        medir(nome === "rodape" ? "fim_da_pagina" : "secao_vista", { secao: nome });
        obsSec.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    document.querySelectorAll("main > section, body > section, .hero, .app-demo, .final, footer.rodape").forEach(function (s) { obsSec.observe(s); });
  }
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("[data-wa]");
    if (!a) return;
    var sec = a.closest("section, footer");
    var local = a.classList.contains("wa-fixo") ? "botao_fixo" : a.closest(".orc") ? "orcamento" : a.closest(".orc-barra") ? "barra_orcamento" : (sec ? (sec.id || (sec.className || "").split(" ")[0]) : "outro");
    medir("clique_whatsapp", { local: local });
  });

  /* ---------- Botão fixo do WhatsApp (celular) ---------- */
  var fixo = document.querySelector(".wa-fixo");
  var hero = document.querySelector(".hero");
  // Some quando já tem outro botão de WhatsApp na tela (topo, resultado do preço ou chamada final)
  if (fixo && hero && "IntersectionObserver" in window) {
    var naTela = [];
    var atualizaFixo = function () {
      var outro = naTela.some(function (el) { return el !== res || (orcAberto() && res.querySelector("[data-wa]")); });
      fixo.classList.toggle("ver", !outro);
    };
    var obsFixo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var i = naTela.indexOf(e.target);
        if (e.isIntersecting && i < 0) naTela.push(e.target);
        if (!e.isIntersecting && i >= 0) naTela.splice(i, 1);
      });
      atualizaFixo();
    }, { threshold: 0 });
    [hero, res, document.querySelector(".final")].forEach(function (el) { if (el) obsFixo.observe(el); });
    if (res && "MutationObserver" in window) new MutationObserver(atualizaFixo).observe(res, { childList: true });
  } else if (fixo) { fixo.classList.add("ver"); }

  /* ---------- Google Ads + aviso de cookies ---------- */
  var aviso = document.getElementById("cookies");
  var abrir = document.getElementById("cookies-abrir");
  var clarityCarregado = false;
  function aceitar() {
    if (window.gtag) window.gtag("consent", "update", { ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
    if (clarityCarregado) { window.clarity("consent"); return; }
    if (CONFIG.clarityId) {
      clarityCarregado = true;
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", CONFIG.clarityId);
      window.clarity("consent");
    }
  }
  function recusar() {
    if (window.gtag) window.gtag("consent", "update", { ad_storage: "denied", analytics_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    if (clarityCarregado && window.clarity) window.clarity("consent", false);
  }
  if (googleLigado) {
    if (abrir) abrir.hidden = false;
    var esc0 = ler();
    if (esc0 === "sim") aceitar();
    else if (!esc0 && aviso) aviso.hidden = false;
    if (aviso) aviso.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-cookies]"); if (!b) return;
      var v = b.getAttribute("data-cookies"); gravar(v); aviso.hidden = true;
      if (v === "sim") aceitar(); else recusar();
    });
    if (abrir) abrir.addEventListener("click", function () { aviso.hidden = false; });
  }

  // Conversão: clique em qualquer botão de WhatsApp
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("[data-wa]");
    if (!a || !window.gtag || !CONFIG.googleAdsRotuloWhatsApp) return;
    window.gtag("event", "conversion", { send_to: CONFIG.googleAdsId + "/" + CONFIG.googleAdsRotuloWhatsApp });
  });

})();

/* 02/11/2026: seção de recursos com vídeos do app. Só começa a tocar quando aparece na tela (economiza dados). */
(function () {
  var sec = document.getElementById("plano"), vid = document.getElementById("recVid");
  if (!sec || !vid) return;
  var bts = [].slice.call(sec.querySelectorAll(".rec__c"));
  var at = 0, auto = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches), tm = null, ativo = false, visivel = true;
  function el(id) { return document.getElementById(id); }
  function mostra(i) {
    at = (i + bts.length) % bts.length;
    var b = bts[at], d = b.dataset, dur = parseFloat(d.dur) || 4.5;
    bts.forEach(function (x, j) { x.classList.remove("on"); x.setAttribute("aria-pressed", j === at ? "true" : "false"); });
    b.style.setProperty("--t", dur + "s"); void b.offsetWidth;
    b.classList.add("on"); b.classList.toggle("parado", !auto);
    el("recCat").textContent = d.cat; el("recCont").textContent = ("0" + (at + 1)).slice(-2) + " / 06";
    el("recTit").textContent = d.tit; el("recDesc").textContent = d.desc;
    vid.loop = !auto; vid.poster = "/rastreador/img/recursos/" + d.v + "-capa.webp";
    vid.src = "/rastreador/img/recursos/" + d.v + ".mp4"; vid.setAttribute("aria-label", "Vídeo do app: " + d.tit);
    if (visivel) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
    clearTimeout(tm); if (auto && visivel) tm = setTimeout(function () { mostra(at + 1); }, (dur + 2) * 1000);
  }
  vid.addEventListener("ended", function () { if (auto) { clearTimeout(tm); mostra(at + 1); } });
  bts.forEach(function (b, i) { b.addEventListener("click", function () { auto = false; ativo = true; mostra(i); }); });
  var x0 = null, f = el("recFeat");
  f.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  f.addEventListener("touchend", function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) { auto = false; ativo = true; mostra(at + (dx < 0 ? 1 : -1)); } });
  function comeca() { if (ativo) return; ativo = true; mostra(0); }
  if ("IntersectionObserver" in window) {
    visivel = false;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        visivel = e.isIntersecting;
        if (e.isIntersecting) { if (ativo && auto && !vid.paused) return; if (ativo && auto) { mostra(at); return; } comeca(); if (vid.paused && vid.src) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } }
        else if (ativo) { vid.pause(); clearTimeout(tm); }
      });
    }, { rootMargin: "200px 0px" });
    io.observe(sec);
  } else comeca();
})();
