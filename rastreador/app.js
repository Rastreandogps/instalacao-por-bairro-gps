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
    { ateKm: 40, regiao: 1, valor: 89.90 },
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
  // Google Ads: preencher quando tiver (ex.: "AW-123456789" e o rótulo da conversão)
  googleAdsId: "",
  googleAdsRotuloWhatsApp: ""
};

(function () {
  "use strict";
  function semAcento(s) { return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  function ehSerra(texto) {
    // Olha só a cidade: o último pedaço do endereço (ignorando "RJ", "Brasil" e o CEP)
    var partes = semAcento(texto).replace(/\(cep[^)]*\)/g, "").split(/[,\-]/).map(function (p) { return p.trim(); })
      .filter(function (p) { return p && !/^(rj|brasil|rio de janeiro estado|\d[\d .]*)$/.test(p); });
    var t = " " + (partes.length ? partes[partes.length - 1] : "").replace(/[^a-z0-9]+/g, " ") + " ";
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
  function rotaGoogle(endereco) {
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
      if (geo.partialMatch && grosso) return { naoAchou: true };
      var fimLL = rt.legs && rt.legs[0] && rt.legs[0].endLocation && rt.legs[0].endLocation.latLng;
      var noRJ = !fimLL || (fimLL.latitude > -23.45 && fimLL.latitude < -20.7 && fimLL.longitude > -44.95 && fimLL.longitude < -40.9);
      return { km: rt.distanceMeters / 1000, noRJ: noRJ };
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
    var txt = "Olá! Vi o anúncio no Google e quero agendar a instalação do rastreador. Endereço: " + endTxt +
      " (Região " + faixa.regiao + ", " + Math.round(km) + " km). Valor informado no site: " + brl(faixa.valor) + ".";
    mostrar('<div class="res"><p class="res__end">' + esc(endTxt) + '</p>' +
      '<p class="res__val">' + brl(faixa.valor) + ' <small>instalação</small></p>' +
      '<p class="res__det">+ mensalidade de R$ 59,90 · sem fidelidade</p>' +
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
        return rotaGoogle(dest).then(function (r) { return { endTxt: endTxt, r: r }; });
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
