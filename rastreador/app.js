/* Rastreando GPS — página /rastreador
   CONFIGURAÇÃO: troque aqui preços, faixas e a tag do Google Ads. */
var CONFIG = {
  whatsapp: "5521980886087",
  // Base da equipe (Jardim 25 de Agosto, Duque de Caxias) — coordenada arredondada
  base: { lat: -22.787, lon: -43.308 },
  // Faixas por distância em linha reta (km). valor null = "Consultar pelo WhatsApp"
  faixas: [
    { ateKm: 30, valor: 89.90 },
    { ateKm: 35, valor: 120.00 },
    { ateKm: 50, valor: 150.00 },
    { ateKm: 9999, valor: null }
  ],
  // Cidades da serra: sempre "Consultar" (pedágio/distância)
  serra: ["petropolis", "teresopolis", "nova friburgo", "miguel pereira", "paty do alferes",
    "sao jose do vale do rio preto", "areal", "tres rios", "paraiba do sul", "vassouras",
    "mendes", "engenheiro paulo de frontin", "sumidouro", "bom jardim", "duas barras", "sapucaia"],
  // Google Ads: preencher quando tiver (ex.: "AW-123456789" e o rótulo da conversão)
  googleAdsId: "",
  googleAdsRotuloWhatsApp: ""
};

(function () {
  "use strict";
  function semAcento(s) { return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim(); }
  function brl(v) { return "R$ " + v.toFixed(2).replace(".", ","); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function waLink(texto) { return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto); }
  function distKm(a, b) {
    var R = 6371, r = Math.PI / 180;
    var dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  /* ---------- 2. Buscador de preço por raio ---------- */
  var form = document.getElementById("busca");
  var campo = document.getElementById("busca-q");
  var res = document.getElementById("resultado");
  if (form) form.hidden = false;

  function viaCep(cep) {
    return fetch("https://viacep.com.br/ws/" + cep + "/json/").then(function (r) { return r.json(); })
      .then(function (j) { return j && !j.erro ? j : null; });
  }
  function nominatim(q, limitarRJ) {
    var u = "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=br&accept-language=pt-BR&q=" + encodeURIComponent(q);
    if (limitarRJ) u += "&viewbox=-44.9,-21.0,-40.9,-23.4&bounded=1";
    return fetch(u).then(function (r) { return r.json(); }).then(function (a) { return a && a[0] ? a[0] : null; });
  }
  function tentar(lista) {
    // tenta cada busca em ordem até achar
    var i = 0;
    function prox() {
      if (i >= lista.length) return Promise.resolve(null);
      var q = lista[i++];
      return nominatim(q, true).then(function (r) { return r || prox(); });
    }
    return prox();
  }

  function mostrar(html) { res.innerHTML = html; }

  function resultadoConsultar(endTxt, motivo) {
    var txt = "Olá! Vi o anúncio no Google e quero saber o valor da instalação. Endereço: " + endTxt;
    mostrar('<div class="res"><p class="res__end">' + esc(endTxt) + '</p>' +
      '<p class="res__val">Consultar</p><p class="res__det">' + esc(motivo) + '</p>' +
      '<a class="btn btn--wa btn--lg" data-wa target="_blank" rel="noopener" href="' + esc(waLink(txt)) + '">Consultar pelo WhatsApp</a></div>');
  }

  function resultadoPreco(endTxt, km, valor) {
    var txt = "Olá! Vi o anúncio no Google e quero agendar a instalação do rastreador. Endereço: " + endTxt + ". Valor informado no site: " + brl(valor) + ".";
    mostrar('<div class="res"><p class="res__end">' + esc(endTxt) + '</p>' +
      '<p class="res__val">' + brl(valor) + ' <small>instalação</small></p>' +
      '<p class="res__det">+ mensalidade de R$ 59,90 · sem fidelidade · cerca de ' + Math.round(km) + ' km da nossa base</p>' +
      '<a class="btn btn--wa btn--lg" data-wa target="_blank" rel="noopener" href="' + esc(waLink(txt)) + '">Agendar pelo WhatsApp</a></div>');
  }

  function naoAchou(q) {
    var txt = "Olá! Vi o anúncio no Google e quero saber o valor da instalação. Endereço: " + q;
    mostrar('<div class="res"><p class="res__err">Não encontramos esse endereço. Tente com <b>rua, bairro e cidade</b>, ou só <b>bairro e cidade</b>.</p>' +
      '<p class="res__det" style="margin-top:8px">Se preferir, mande o endereço no WhatsApp e respondemos o valor.</p>' +
      '<a class="btn btn--wa btn--lg" data-wa target="_blank" rel="noopener" href="' + esc(waLink(txt)) + '">Mandar no WhatsApp</a></div>');
  }

  function calcular(achado, endTxt, cidade, uf) {
    var c = semAcento(cidade);
    if (uf && semAcento(uf) !== "rio de janeiro" && semAcento(uf) !== "rj") {
      return resultadoConsultar(endTxt, "Esse endereço fica fora do estado do Rio. Fale com a gente para ver se atendemos.");
    }
    if (c && CONFIG.serra.indexOf(c) >= 0) {
      return resultadoConsultar(endTxt, "Na região serrana o valor depende do trajeto (pedágio e distância).");
    }
    var km = distKm(CONFIG.base, { lat: parseFloat(achado.lat), lon: parseFloat(achado.lon) });
    for (var i = 0; i < CONFIG.faixas.length; i++) {
      if (km <= CONFIG.faixas[i].ateKm) {
        if (CONFIG.faixas[i].valor == null) return resultadoConsultar(endTxt, "Endereço a mais de 50 km da nossa base. Fale com a gente para ver o valor.");
        return resultadoPreco(endTxt, km, CONFIG.faixas[i].valor);
      }
    }
  }

  function textoEndereco(a, fallback) {
    if (!a) return fallback;
    var ad = a.address || {};
    var partes = [ad.road, ad.house_number, ad.suburb || ad.neighbourhood || ad.city_district, ad.city || ad.town || ad.municipality || ad.village].filter(Boolean);
    return partes.length ? partes.join(", ") : fallback;
  }

  if (form) form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var q = (campo.value || "").trim();
    if (q.length < 3) { campo.focus(); return; }
    var bt = form.querySelector("button"); bt.disabled = true;
    mostrar('<p class="carregando">Procurando o endereço…</p>');
    var soNum = q.replace(/\D/g, "");
    var p;
    if (/^\d{5}-?\d{3}$/.test(q.replace(/\s/g, ""))) {
      p = viaCep(soNum).then(function (c) {
        if (!c) return { nada: true, q: q };
        var endTxt = [c.logradouro, c.bairro, c.localidade].filter(Boolean).join(", ") + " (CEP " + c.cep + ")";
        if (c.uf !== "RJ") return { forauf: true, endTxt: endTxt };
        if (CONFIG.serra.indexOf(semAcento(c.localidade)) >= 0) return { serra: true, endTxt: endTxt };
        var buscas = [];
        if (c.logradouro) buscas.push(c.logradouro + ", " + c.bairro + ", " + c.localidade + ", RJ");
        if (c.bairro) buscas.push(c.bairro + ", " + c.localidade + ", RJ");
        buscas.push(c.localidade + ", RJ");
        return tentar(buscas).then(function (a) { return { a: a, endTxt: endTxt, cidade: c.localidade, uf: "RJ" }; });
      });
    } else {
      p = tentar([q, q + ", RJ"]).then(function (a) {
        if (a) return { a: a, endTxt: textoEndereco(a, q), cidade: (a.address || {}).city || (a.address || {}).town || (a.address || {}).municipality || "", uf: (a.address || {}).state || "" };
        return nominatim(q, false).then(function (b) {
          if (!b) return { nada: true, q: q };
          return { a: b, endTxt: textoEndereco(b, q), cidade: (b.address || {}).city || (b.address || {}).town || "", uf: (b.address || {}).state || "" };
        });
      });
    }
    p.then(function (r) {
      if (r.nada) return naoAchou(r.q);
      if (r.forauf) return resultadoConsultar(r.endTxt, "Esse endereço fica fora do estado do Rio. Fale com a gente para ver se atendemos.");
      if (r.serra) return resultadoConsultar(r.endTxt, "Na região serrana o valor depende do trajeto (pedágio e distância).");
      if (!r.a) return naoAchou(q);
      calcular(r.a, r.endTxt, r.cidade, r.uf);
    }).catch(function () {
      var txt = "Olá! Vi o anúncio no Google e quero saber o valor da instalação. Endereço: " + q;
      mostrar('<div class="res"><p class="res__err">Não conseguimos consultar agora.</p><p class="res__det" style="margin-top:8px">Mande o endereço no WhatsApp e respondemos o valor.</p>' +
        '<a class="btn btn--wa btn--lg" data-wa target="_blank" rel="noopener" href="' + esc(waLink(txt)) + '">Mandar no WhatsApp</a></div>');
    }).then(function () { bt.disabled = false; });
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
