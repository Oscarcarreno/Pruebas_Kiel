/* ============================================================================
   PROMOCIÓN DEL MES — botón flotante + tarjeta con toda la información
   ----------------------------------------------------------------------------
   El contenido NO está escrito en las páginas: se lee de un JSON que puede venir de un
   sistema externo (para que el dueño lo cambie sin tocar el sitio).

   DOS FORMAS DE ADMINISTRARLA
   A) Todo en GitHub (la recomendada): el cliente edita promocion.json desde el formulario de Pages CMS (ver .pages.yml).
      promocion.json trae dos espacios, "actual" y "siguiente", cada uno con su fecha de inicio y de fin; el sitio muestra
      solo la que corresponde al día de hoy. No requiere ningún servidor.
   B) Sistema externo propio (carpeta promociones-admin): se escribe su dirección en promo-config.js y el sitio la lee de ahí.

   Cómo conectarlo (forma B):
     1) Antes de cargar este archivo, define la dirección del sistema externo (en cada página, o solo en el inicio):
          <script>window.PROMO_CONFIG = { endpoint: 'https://tu-sistema.com/api/promocion-actual' };</script>
        o escribe la dirección en "endpoint" aquí abajo. El sistema debe permitir CORS desde el dominio del sitio.
     2) Si el sistema externo falla o no responde, se usa el archivo local promocion.json.
     3) Si no hay promoción vigente (activa:false o fuera de fechas) el botón no aparece.

   Formato del JSON (todas las claves en español; solo "titulo" es obligatorio):
   {
     "activa": true,
     "desde": "2026-11-01", "hasta": "2026-11-30",              // opcionales: vigencia (AAAA-MM-DD)
     "texto_corto": "¡Promoción de noviembre! Aprovecha…",      // texto del botón pequeño (máx. 90 caracteres)
     "titulo": "¡Promoción de noviembre!",
     "contenido": [ "Un párrafo.", { "lista": ["Punto 1", "Punto 2"] }, "Otro párrafo." ],
     "medio": { "tipo": "imagen", "src": "images/promocion.jpg", "alt": "…" }          // o:
              { "tipo": "video",  "src": "https://…/video.mp4", "poster": "https://…/portada.jpg" }   // o:
              { "tipo": "youtube", "id": "ID_DEL_VIDEO", "poster": "…" },
     "pie": "Texto de pie: vigencia, condiciones…",
     "boton": { "etiqueta": "Pedir cotización", "href": "contacto.html" }               // opcional
   }
   Todo el texto se muestra como texto plano (no se interpreta HTML), por seguridad.
   ============================================================================ */
(function () {
  const CFG = Object.assign({
    endpoint: '',                    // dirección del sistema externo (JSON)
    archivoLocal: 'promocion.json',  // archivo que edita el cliente con Pages CMS (o respaldo del sistema externo)
    zonaHoraria: 'America/Monterrey',// con esta zona se cuentan los días de inicio y fin
    hoy: '',                         // SOLO PARA PRUEBAS: fecha fija AAAA-MM-DD
    tiempoEsperaMs: 4000,            // tiempo máximo de espera al sistema externo
    esperaTrasScrollMs: 3000         // el botón pasa a estático 3 s después de que el visitante empieza a hacer scroll
  }, window.PROMO_CONFIG || {});

  const grupo = document.querySelector('.float-contact-btns');
  if (!grupo) return;
  const esInicio = !!document.querySelector('.hero');
  const seguro = u => typeof u === 'string' && (/^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/|images\/|\.\/|\/(?!\/))/.test(u) || /^[\w-]+\.html(\?.*)?(#.*)?$/.test(u) || /^tel:\+?[\d-]+$/.test(u));
  const ruta = u => (typeof u === 'string' && /^\/(?!\/)/.test(u) ? u.replace(/^\/+/, '') : u);   // "/images/x.jpg" -> "images/x.jpg"
  const aviso = (t, u) => { try { console.warn('[promoción] ' + t + ':', u); } catch (_) {} };
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };

  async function leer(url) {
    const c = new AbortController(), t = setTimeout(() => c.abort(), CFG.tiempoEsperaMs);
    try {
      const r = await fetch(url, { cache: 'no-cache', signal: c.signal });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }
  const hoyTexto = () => CFG.hoy || new Intl.DateTimeFormat('en-CA', { timeZone: CFG.zonaHoraria, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const youtubeId = v => { const t = String(v || '').trim(); if (/^[\w-]{11}$/.test(t)) return t; const m = t.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/); return m ? m[1] : null; };
  // Texto del editor -> bloques: una línea en blanco separa párrafos; si todas las líneas empiezan con "- " es una lista.
  const parseContenido = t => String(t || '').replace(/\r/g, '').split(/\n{2,}/).map(b => b.trim()).filter(Boolean).map(b => { const l = b.split('\n').map(x => x.trim()).filter(Boolean); return l.every(x => /^[-•]\s+/.test(x)) ? { lista: l.map(x => x.replace(/^[-•]\s+/, '')) } : l.join(' '); });
  // Formato del editor (Pages CMS): { actual: {...}, siguiente: {...} } con campos planos
  function deRanura(r) {
    if (!r || typeof r !== 'object') return null;
    const titulo = String(r.titulo || '').trim(), f = /^\d{4}-\d{2}-\d{2}$/;
    if (!titulo || !f.test(r.desde || '') || !f.test(r.hasta || '')) return null;      // espacio vacío o incompleto: se ignora
    let medio = null; const y = youtubeId(r.youtube);
    if (r.medio_tipo === 'imagen' && r.imagen) medio = { tipo: 'imagen', src: String(r.imagen), alt: titulo };
    else if (r.medio_tipo === 'video' && r.video) medio = { tipo: 'video', src: String(r.video) };
    else if (r.medio_tipo === 'youtube' && y) medio = { tipo: 'youtube', id: y, poster: 'https://i.ytimg.com/vi/' + y + '/hqdefault.jpg' };
    return { desde: r.desde, hasta: r.hasta, titulo, texto_corto: r.texto_corto, contenido: parseContenido(r.contenido), medio, pie: r.pie, boton: r.boton_etiqueta && r.boton_destino ? { etiqueta: r.boton_etiqueta, href: r.boton_destino } : null };
  }
  // Elige la promoción de hoy: primero la "actual"; si ya terminó, la "siguiente". (Formato antiguo: se usa tal cual.)
  function elegir(raw) {
    if (!raw || !(raw.actual || raw.siguiente)) return raw;
    const h = hoyTexto();
    for (const k of ['actual', 'siguiente']) { const p = deRanura(raw[k]); if (p && p.desde <= h && h <= p.hasta) { delete p.desde; delete p.hasta; return p; } }
    return null;
  }
  function normalizar(raw) {
    if (!raw || typeof raw !== 'object' || raw.activa === false) return null;
    const ahora = new Date();
    if (raw.desde && new Date(raw.desde + 'T00:00:00') > ahora) return null;
    if (raw.hasta && new Date(raw.hasta + 'T23:59:59') < ahora) return null;
    const titulo = String(raw.titulo || '').trim(); if (!titulo) return null;
    return {
      titulo, corto: String(raw.texto_corto || titulo).slice(0, 90),
      contenido: Array.isArray(raw.contenido) ? raw.contenido : (raw.contenido ? [String(raw.contenido)] : []),
      medio: raw.medio && typeof raw.medio === 'object' ? raw.medio : null,
      pie: raw.pie ? String(raw.pie) : '', boton: raw.boton && typeof raw.boton === 'object' ? raw.boton : null
    };
  }
  async function cargar() {
    let raw;
    if (CFG.endpoint) { try { raw = await leer(CFG.endpoint); } catch (_) { raw = undefined; } }
    if (raw === undefined) { try { raw = await leer(CFG.archivoLocal); } catch (_) { return null; } }
    return normalizar(elegir(raw));
  }

  function medio(m) {
    if (!m) return null;
    const fig = el('figure', 'promo-media'), src = ruta(m.src), poster = ruta(m.poster);
    if (m.tipo === 'youtube' && /^[\w-]{11}$/.test(m.id || '')) {
      const b = el('button', 'promo-play'); b.type = 'button'; b.setAttribute('aria-label', 'Reproducir video');
      if (seguro(poster)) b.style.backgroundImage = 'url("' + poster + '")';
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
      b.addEventListener('click', () => { const f = document.createElement('iframe'); f.src = 'https://www.youtube-nocookie.com/embed/' + m.id + '?autoplay=1&rel=0'; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.title = 'Video de la promoción'; b.replaceWith(f); });
      fig.appendChild(b);
    } else if (m.tipo === 'video' && seguro(src)) {
      const v = document.createElement('video'); v.controls = true; v.playsInline = true; v.preload = 'metadata'; v.src = src; if (seguro(poster)) v.poster = poster;
      v.addEventListener('error', () => { aviso('no se pudo cargar el video', src); fig.hidden = true; }); fig.appendChild(v);
    } else if (seguro(src)) {
      const i = el('img'); i.src = src; i.alt = m.alt || ''; i.decoding = 'async'; i.addEventListener('error', () => { aviso('no se encontró la imagen (revisa el nombre y que ya se haya publicado)', i.src); fig.hidden = true; }); fig.appendChild(i);
    } else { aviso('la ruta del archivo no es válida', m.src); return null; }
    return fig;
  }

  function construir(p) {
    // Botón flotante (arriba de WhatsApp y teléfono)
    const boton = el('button', 'float-btn float-btn--promo'); boton.type = 'button'; boton.id = 'promoBtn';
    boton.setAttribute('aria-haspopup', 'dialog'); boton.setAttribute('aria-controls', 'promoModal'); boton.setAttribute('aria-label', 'Ver promoción: ' + p.corto); boton.dataset.tooltip = 'Promoción';
    boton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>';
    boton.appendChild(el('span', 'promo-label', p.corto));
    grupo.insertBefore(boton, grupo.firstChild);

    // Tarjeta en superposición
    const modal = el('div', 'promo-modal'); modal.id = 'promoModal'; modal.hidden = true; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'promoTitle');
    const card = el('div', 'promo-card');
    const cerrar = el('button', 'promo-close'); cerrar.type = 'button'; cerrar.setAttribute('aria-label', 'Cerrar promoción');
    cerrar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    const h = el('h2', 'promo-title', p.titulo); h.id = 'promoTitle';
    const cont = el('div', 'promo-content');
    p.contenido.forEach(b => {
      if (typeof b === 'string') cont.appendChild(el('p', null, b));
      else if (b && Array.isArray(b.lista)) { const ul = el('ul'); b.lista.forEach(t => ul.appendChild(el('li', null, String(t)))); cont.appendChild(ul); }
    });
    card.append(cerrar, h, cont);
    const m = medio(p.medio); if (m) card.appendChild(m);
    if (p.pie) card.appendChild(el('p', 'promo-foot', p.pie));
    if (p.boton && p.boton.etiqueta && seguro(p.boton.href)) { const a = el('a', 'btn btn-primary btn-lg promo-cta', String(p.boton.etiqueta)); a.href = p.boton.href; card.appendChild(a); }
    modal.appendChild(card); document.body.appendChild(modal);

    let previo = '';
    const abrir = () => { clearTimeout(temporizador); boton.classList.remove('is-expanded'); modal.hidden = false; previo = document.body.style.overflow; document.body.style.overflow = 'hidden'; cerrar.focus(); };
    const cerrarModal = () => { modal.hidden = true; document.body.style.overflow = previo; boton.focus({ preventScroll: true }); };
    boton.addEventListener('click', abrir);
    cerrar.addEventListener('click', cerrarModal);
    modal.addEventListener('click', e => { if (e.target === modal) cerrarModal(); });
    document.addEventListener('keydown', e => {
      if (modal.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); cerrarModal(); }
      else if (e.key === 'Tab') {
        const f = [...card.querySelectorAll('button,a[href]')].filter(x => x.offsetParent !== null);
        const i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });

    // Apariencia temporal (solo en el inicio): rectángulo con texto corto; pasa a estático 3 s después de empezar el scroll
    let temporizador;
    if (esInicio) {
      boton.classList.add('is-expanded');
      const alScroll = () => {
        if (window.scrollY > 4) { removeEventListener('scroll', alScroll); temporizador = setTimeout(() => boton.classList.remove('is-expanded'), CFG.esperaTrasScrollMs); }
      };
      addEventListener('scroll', alScroll, { passive: true }); alScroll();
    }
  }

  cargar().then(p => { if (p) construir(p); });
})();
