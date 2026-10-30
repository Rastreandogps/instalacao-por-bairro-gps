/* Rastreando GPS — página /rastreador
   CONFIGURAÇÃO: troque aqui preços, faixas e a tag do Google Ads. */
var CONFIG = {
  whatsapp: "5521980886087",
  // Base da equipe (Jardim 25 de Agosto, Duque de Caxias) — coordenada arredondada
  base: { lat: -22.787, lon: -43.308 },
  // Chave do Google só para calcular a rota (restrita a este site e à Routes API; teto de 300/dia)
  googleRotasChave: "AIzaSyDBA1qcNcAgZ3XB5smm67o09m8fQpfNz-k",
  // Preço da instalação por KM DE ESTRADA a partir da base. valor null = "Consultar pelo WhatsApp"
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
  googleAdsRotuloWhatsApp: "7qkoCIG7j68dELm5rsY9"
};

(function () {
  "use strict";
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

  function resultadoConsultar(endTxt, motivo) {
    var txt = "Olá! Vi o anúncio no Google e quero saber o valor da instalação. Endereço: " + endTxt;
    mostrar('<div class="res"><p class="res__end">' + esc(endTxt) + '</p>' +
      '<p class="res__val">Consultar</p><p class="res__det">' + esc(motivo) + '</p>' +
      '<a class="btn btn--wa btn--lg" data-wa target="_blank" rel="noopener" href="' + esc(waLink(txt)) + '">Consultar pelo WhatsApp</a></div>');
  }

  function resultadoPreco(endTxt, faixa, km) {
    var nomeReg = typeof faixa.regiao === "number" ? "Região " + faixa.regiao : faixa.regiao;
    var txt = "Olá! Vi o anúncio no Google e quero agendar a instalação do rastreador. Endereço: " + endTxt +
      " (" + nomeReg + ", " + Math.round(km) + " km). Valor informado no site: " + brl(faixa.valor) + ".";
    mostrar('<div class="res"><p class="res__end">' + esc(endTxt) + '</p>' +
      '<p class="res__val">' + brl(faixa.valor) + ' <small>instalação</small></p>' +
      '<p class="res__mens"><span>Mensalidade</span><b>R$ 59,90<small>/mês</small></b></p>' +
      '<p class="res__det">Sem fidelidade.</p>' +
      '<a class="btn btn--wa btn--lg" data-wa target="_blank" rel="noopener" href="' + esc(waLink(txt)) + '">Agendar pelo WhatsApp</a></div>');
  }

  function naoAchou(q) {
    var txt = "Olá! Vi o anúncio no Google e quero saber o valor da instalação. Endereço: " + q;
    mostrar('<div class="res"><p class="res__err">Não encontramos esse endereço. Tente com <b>rua, número, bairro e cidade</b>, ou o <b>CEP</b>.</p>' +
      '<p class="res__det" style="margin-top:8px">Se preferir, mande o endereço no WhatsApp e respondemos o valor.</p>' +
      '<a class="btn btn--wa btn--lg" data-wa target="_blank" rel="noopener" href="' + esc(waLink(txt)) + '">Mandar no WhatsApp</a></div>');
  }

  function falhou(q) {
    var txt = "Olá! Vi o anúncio no Google e quero saber o valor da instalação. Endereço: " + q;
    mostrar('<div class="res"><p class="res__err">Não conseguimos calcular agora.</p><p class="res__det" style="margin-top:8px">Mande o endereço no WhatsApp e respondemos o valor.</p>' +
      '<a class="btn btn--wa btn--lg" data-wa target="_blank" rel="noopener" href="' + esc(waLink(txt)) + '">Mandar no WhatsApp</a></div>');
  }

  function calcular(endTxt, r) {
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
    if (q.length < 3) { campo.focus(); return; }
    var bt = form.querySelector("button"); bt.disabled = true;
    mostrar('<p class="carregando">Calculando a distância…</p>');
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
      .then(function () { bt.disabled = false; });
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
    } else if (d.event === "ended" || d.event === "finish") {
      var box = ifr.parentNode; ifr.remove(); if (box) box.classList.remove("tocando");
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
      if (!nfcV.muted) { nfcV.currentTime = 0; tocar(); }
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
  if (appV) {
    var tocarApp = function () { var p = appV.play(); if (p && p.catch) p.catch(function () {}); };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { if (appV.preload !== "auto") { appV.preload = "auto"; } tocarApp(); }
        else appV.pause();
      }, { threshold: 0.35 }).observe(appV);
    } else { appV.preload = "auto"; tocarApp(); }
  }

  /* ---------- Botão fixo do WhatsApp (celular) ---------- */
  var fixo = document.querySelector(".wa-fixo");
  var hero = document.querySelector(".hero");
  if (fixo && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { fixo.classList.toggle("ver", !e[0].isIntersecting); }, { threshold: 0 }).observe(hero);
  } else if (fixo) { fixo.classList.add("ver"); }

  /* ---------- Google Ads + aviso de cookies ---------- */
  var CHAVE = "rg_cookies";
  var aviso = document.getElementById("cookies");
  var abrir = document.getElementById("cookies-abrir");
  function ler() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravar(v) { try { localStorage.setItem(CHAVE, v); } catch (e) {} }
  var adsCarregado = false;
  function carregarAds() {
    if (adsCarregado || !CONFIG.googleAdsId) return;
    adsCarregado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CONFIG.googleAdsId);
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.googleAdsId);
    document.head.appendChild(s);
  }
  if (CONFIG.googleAdsId) {
    if (abrir) abrir.hidden = false;
    var esc0 = ler();
    if (esc0 === "sim") carregarAds();
    else if (!esc0 && aviso) aviso.hidden = false;
    if (aviso) aviso.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-cookies]"); if (!b) return;
      var v = b.getAttribute("data-cookies"); gravar(v); aviso.hidden = true;
      if (v === "sim") carregarAds();
    });
    if (abrir) abrir.addEventListener("click", function () { aviso.hidden = false; });
  }

  // Conversão: clique em qualquer botão de WhatsApp
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("[data-wa]");
    if (!a || !adsCarregado || !CONFIG.googleAdsRotuloWhatsApp) return;
    window.gtag("event", "conversion", { send_to: CONFIG.googleAdsId + "/" + CONFIG.googleAdsRotuloWhatsApp });
  });

})();
