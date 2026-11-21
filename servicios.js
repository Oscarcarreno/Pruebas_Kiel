/* Servicios: tarjetas -> sección de cada servicio (bloques definidos en servicios-data.js) + visor de imágenes con zoom. */
(function () {
  const $ = id => document.getElementById(id);
  const lista = $('svcList'), detalle = $('svcDetail'), cuerpo = $('svcBody'), titulo = $('svcTitle'), cabecera = $('svcHead'), pie = $('svcPager');
  if (!lista || typeof SERVICIOS === 'undefined') return;
  const POR_SLUG = Object.fromEntries(SERVICIOS.map(s => [s.slug, s]));
  const TITULO_PAGINA = document.title;
  const seguro = u => typeof u === 'string' && /^(https:\/\/|images\/|\.\/|\/(?!\/))/.test(u);
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const parrafos = ps => (ps || []).map(t => el('p', null, t));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Medios: imagen, video (archivo o YouTube) ───────────────────────────
  function imagen(m, zoom = true) {
    if (!m || !seguro(m.src)) return null;
    const fig = el('figure', 'svc-figure'), img = el('img');
    img.src = m.src; img.alt = m.alt || ''; img.loading = 'lazy'; img.decoding = 'async';
    img.addEventListener('error', () => { fig.hidden = true; });
    if (zoom) {
      img.tabIndex = 0; img.setAttribute('role', 'button'); img.setAttribute('aria-label', 'Ampliar imagen' + (m.alt ? ': ' + m.alt : ''));
      const abrir = () => document.dispatchEvent(new CustomEvent('visor:abrir', { detail: { src: m.src, alt: m.alt || '', el: img } }));
      img.addEventListener('click', abrir);
      img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); } });
    }
    fig.appendChild(img);
    if (m.pie) fig.appendChild(el('figcaption', null, m.pie));
    return fig;
  }
  function video(m) {
    if (!m) return null;
    const fig = el('figure', 'svc-figure svc-video');
    if (m.youtube && /^[\w-]{11}$/.test(m.youtube)) {            // YouTube: se carga solo al pulsar (no pesa al abrir la sección)
      const b = el('button', 'svc-video-btn'); b.type = 'button'; b.setAttribute('aria-label', 'Reproducir video');
      if (seguro(m.poster)) b.style.backgroundImage = 'url("' + m.poster + '")';
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
      b.addEventListener('click', () => {
        const f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + m.youtube + '?autoplay=1&rel=0&loop=1&playlist=' + m.youtube; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.title = m.titulo || 'Video';
        b.replaceWith(f);
      });
      fig.appendChild(b);
    } else if (seguro(m.src)) {
      const v = document.createElement('video');
      v.autoplay = true;
      v.loop = true;
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('muted', '');
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.controls = true;
      v.preload = 'auto';
      v.src = m.src;
      v.addEventListener('canplay', () => { v.play().catch(() => {}); });
      if (seguro(m.poster)) v.poster = m.poster;
      v.addEventListener('error', () => { fig.hidden = true; });
      fig.appendChild(v);
    } else return null;
    if (m.pie) fig.appendChild(el('figcaption', null, m.pie));
    return fig;
  }
  const medio = m => !m ? null : m.imagen ? imagen(m.imagen) : m.video ? video(m.video) : m.youtube ? video({ youtube: m.youtube, poster: m.poster }) : null;

  // ── Bloques ─────────────────────────────────────────────────────────────
  const encabezado = (n, t) => { if (t) n.appendChild(el('h3', 'svc-h', t)); return n; };
  function lista_(b) {
    const items = b.items || [], estilo = b.estilo || 'puntos';
    if (estilo === 'etiquetas') { const w = el('div', 'svc-tags'); items.forEach(t => w.appendChild(el('span', 'tag', t))); return w; }
    if (estilo === 'tarjetas') {
      const w = el('div', 'svc-cards');
      items.forEach(i => { const c = el('div', 'svc-card'); c.appendChild(el('h4', null, i.titulo || i)); if (i.texto) c.appendChild(el('p', null, i.texto)); w.appendChild(c); });
      return w;
    }
    const ul = el('ul', 'svc-list'); items.forEach(t => ul.appendChild(el('li', null, t))); return ul;
  }
  const BLOQUES = {
    texto: b => { const n = encabezado(el('div'), b.titulo); parrafos(b.parrafos).forEach(p => n.appendChild(p)); return n; },
    lista: b => { const n = encabezado(el('div'), b.titulo); n.appendChild(lista_(b)); return n; },
    especificaciones: b => {
      const n = encabezado(el('div'), b.titulo), dl = el('dl', 'svc-specs');
      (b.filas || []).forEach(([k, v]) => { const r = el('div'); r.appendChild(el('dt', null, k)); r.appendChild(el('dd', null, v)); dl.appendChild(r); });
      n.appendChild(dl); return n;
    },
    imagen: b => imagen(b),
    galeria: b => {
      const g = el('div', 'svc-gallery'); g.style.setProperty('--cols', b.columnas || 3);
      (b.imagenes || []).forEach(i => { const f = imagen(i); if (f) g.appendChild(f); });
      return g.children.length ? g : null;
    },
    video: b => video(b),
    'medio-texto': b => {
      const n = el('div', 'svc-split' + (b.invertir ? ' svc-split-rev' : '')), t = encabezado(el('div', 'svc-text'), b.titulo);
      parrafos(b.parrafos).forEach(p => t.appendChild(p));
      if (b.lista) t.appendChild(lista_({ items: b.lista, estilo: 'puntos' }));
      n.appendChild(t); const m = medio(b.medio); if (m) n.appendChild(m); else n.classList.add('svc-split-solo');
      return n;
    },
    detalle: b => {
      const n = encabezado(el('div', 'svc-detalle'), b.titulo);
      const ps = b.parrafos || (b.texto ? [b.texto] : (b.detalle ? [b.detalle] : []));
      parrafos(ps).forEach(p => n.appendChild(p));
      if (b.items || b.lista) n.appendChild(lista_({ items: b.items || b.lista, estilo: b.estilo || 'puntos' }));
      return n;
    },
    cta: b => {
      const n = el('div', 'svc-cta'), bt = b.boton || {};
      n.appendChild(el('p', null, b.texto || '¿Tienes un proyecto? Cotizamos sobre dibujo o muestra; si no lo fabricamos, lo desarrollamos.'));
      const a = el('a', 'btn btn-primary btn-lg', bt.etiqueta || 'Solicitar cotización'); a.href = seguro(bt.href) || /^[\w-]+\.html/.test(bt.href || '') ? bt.href : 'contacto.html'; n.appendChild(a); return n;
    }
  };
  const MEDIA_TIPOS = new Set(['imagen', 'video', 'galeria']);
  const render = servicio => {
    cuerpo.textContent = '';
    const colText  = el('div', 'svc-col-text');
    const colMedia = el('div', 'svc-col-media');
    const ctaNodes = [];
    (servicio.bloques || []).forEach(b => {
      const f = BLOQUES[b.tipo]; if (!f) return;
      const nodo = f(b); if (!nodo) return;
      const s = el('section', 'svc-block svc-' + b.tipo);
      s.appendChild(nodo);
      if (b.tipo === 'cta') {
        ctaNodes.push(s);
      } else if (MEDIA_TIPOS.has(b.tipo)) {
        colMedia.appendChild(s);
      } else {
        colText.appendChild(s);
      }
    });
    const cols = el('div', 'svc-columns');
    cols.appendChild(colText);
    if (colMedia.children.length) cols.appendChild(colMedia);
    cuerpo.appendChild(cols);
    ctaNodes.forEach(s => cuerpo.appendChild(s));
    pie.textContent = '';
    const i = SERVICIOS.indexOf(servicio), nav = (s, txt, cls) => { const a = el('a', 'btn btn-outline ' + cls, txt + ' ' + s.titulo); a.href = 'servicios.html?servicio=' + s.slug; a.addEventListener('click', e => { e.preventDefault(); abrirServicio(s.slug); }); return a; };
    if (i > 0) pie.appendChild(nav(SERVICIOS[i - 1], '←', 'svc-prev'));
    if (i < SERVICIOS.length - 1) pie.appendChild(nav(SERVICIOS[i + 1], '→', 'svc-next'));
  };

  // ── Vistas ──────────────────────────────────────────────────────────────
  function abrirServicio(slug, opts = {}) {
    const s = POR_SLUG[slug]; if (!s) return;
    render(s); titulo.textContent = s.titulo; document.title = s.titulo + ' | Compañía Industrial KIEL';
    lista.hidden = true; detalle.hidden = false; document.documentElement.classList.remove('has-svc');
    history.replaceState(null, '', '?servicio=' + slug);
    if (opts.scroll !== false) { titulo.focus({ preventScroll: true }); cabecera.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  }
  function volver() {
    detalle.hidden = true; lista.hidden = false; document.title = TITULO_PAGINA; document.documentElement.classList.remove('has-svc');
    history.replaceState(null, '', location.pathname);
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('#svcCards .product-card').forEach(c => c.addEventListener('click', e => { e.preventDefault(); abrirServicio(c.dataset.card); }));
  $('svcBack').addEventListener('click', volver);
  document.addEventListener('DOMContentLoaded', () => {
    const k = new URLSearchParams(location.search).get('servicio');
    if (k && POR_SLUG[k]) abrirServicio(k, { scroll: false }); else document.documentElement.classList.remove('has-svc');
  });

  // ── Visor de imágenes con zoom (se abre al tocar una imagen de una sección) ─
  // ─── Visor de imagen de producto ─────────────────────────
      // Al seleccionar un item se muestra images/Producto/NN.ext (NN = número del item con dos cifras: 01, 02… 139).
      const VISOR = {
        carpeta: 'images/Producto/',
        extensiones: ['jpg'],   // todas las imágenes de Producto son .jpg (si algún día mezclas formatos: ['jpg', 'png'])
        zoomMin: 1,       // sin zoom
        zoomMax: 4,       // zoom máximo (4 = 400 %)
        zoomPaso: 0.5     // lo que suman/restan los botones + y −
      };

      (function () {
        const visor = document.getElementById('imgViewer');
        const stage = document.getElementById('imgvStage');
        const img = document.getElementById('imgvImg');
        const msg = document.getElementById('imgvMsg');
        const btnCerrar = document.getElementById('imgvClose');
        const btnMas = document.getElementById('imgvIn');
        const btnMenos = document.getElementById('imgvOut');
        if (!visor) return;

        let escala = 1, tx = 0, ty = 0;          // zoom y desplazamiento actuales
        let abierto = false, ticket = 0, apertura = null, overflowPrevio = '';
        let extOk = null;                        // extensión que ya se comprobó que existe
        const punteros = new Map();
        let gesto = null, huboMovimiento = false, tocoFuera = false;

        const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

        // Mantiene la imagen dentro de la pantalla: si es más pequeña que el área no se mueve; si es mayor, solo hasta sus bordes
        function ajustar() {
          const mx = Math.max(0, (img.offsetWidth * escala - stage.clientWidth) / 2);
          const my = Math.max(0, (img.offsetHeight * escala - stage.clientHeight) / 2);
          tx = limitar(tx, -mx, mx); ty = limitar(ty, -my, my);
        }
        function aplicar() {
          ajustar();
          img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + escala + ')';
          stage.classList.toggle('is-zoomed', escala > VISOR.zoomMin + 0.001);
          btnMenos.disabled = escala <= VISOR.zoomMin + 0.001;
          btnMas.disabled = escala >= VISOR.zoomMax - 0.001;
        }
        // Cambia el zoom manteniendo fijo el punto (px, py), medido desde el centro del área
        function zoomA(nueva, px, py, t0x = tx, t0y = ty, s0 = escala) {
          nueva = limitar(nueva, VISOR.zoomMin, VISOR.zoomMax);
          const k = nueva / s0;
          tx = px - (px - t0x) * k; ty = py - (py - t0y) * k; escala = nueva;
          aplicar();
        }
        function zoomBoton(delta) {
          img.style.transition = 'transform .2s ease';
          zoomA(Math.round((escala + delta) * 100) / 100, 0, 0);
          setTimeout(() => { img.style.transition = ''; }, 220);
        }

        // Busca images/Producto/NN.ext probando las extensiones configuradas
        function buscarImagen(n) {
          const base = VISOR.carpeta + String(n).padStart(2, '0') + '.';
          const orden = extOk ? [extOk, ...VISOR.extensiones.filter(e => e !== extOk)] : VISOR.extensiones;
          return new Promise(resolve => {
            let i = 0;
            const siguiente = () => {
              if (i >= orden.length) return resolve(null);
              const ext = orden[i++], prueba = new Image();
              prueba.onload = () => { extOk = ext; resolve(base + ext); };
              prueba.onerror = siguiente;
              prueba.src = base + ext;
            };
            siguiente();
          });
        }

        function abrir(n, nombre, origen) {
          apertura = origen || document.activeElement;
          const mio = ++ticket;
          abierto = true; escala = 1; tx = 0; ty = 0;
          img.hidden = true; img.removeAttribute('src'); img.style.transform = '';
          msg.textContent = 'Cargando…'; msg.hidden = false;
          visor.setAttribute('aria-label', 'Imagen de ' + (nombre || 'producto'));
          visor.hidden = false;
          overflowPrevio = document.body.style.overflow; document.body.style.overflow = 'hidden';
          aplicar(); btnCerrar.focus();
          Promise.resolve(n).then(src => {
            if (mio !== ticket) return;                       // se abrió otra imagen mientras cargaba
            if (!src) { msg.textContent = 'Imagen no disponible'; return; }
            img.onload = () => { if (mio !== ticket) return; msg.hidden = true; img.hidden = false; aplicar(); };
            img.alt = nombre || ''; img.src = src;
          });
        }

        function cerrar() {
          if (!abierto) return;
          abierto = false; ticket++; punteros.clear(); gesto = null;
          visor.hidden = true; img.removeAttribute('src');
          document.body.style.overflow = overflowPrevio;
          if (apertura && document.contains(apertura)) apertura.focus({ preventScroll: true });
        }

        // ── Gestos: pellizcar para hacer zoom y arrastrar (táctil) / arrastrar con zoom (ratón)
        const centro = () => { const r = stage.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
        function iniciarGesto() {
          const p = [...punteros.values()], c = centro();
          if (p.length >= 2) {
            gesto = {
              tipo: 'pellizco', d0: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, s0: escala, tx0: tx, ty0: ty,
              mx0: (p[0].x + p[1].x) / 2 - c.x, my0: (p[0].y + p[1].y) / 2 - c.y
            };
          } else if (p.length === 1) {
            gesto = { tipo: 'arrastre', x0: p[0].x, y0: p[0].y, tx0: tx, ty0: ty };
          } else gesto = null;
        }
        stage.addEventListener('pointerdown', e => {
          if (!abierto) return;
          stage.setPointerCapture(e.pointerId);
          punteros.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
          if (punteros.size === 1) { huboMovimiento = false; tocoFuera = false; }
          iniciarGesto();
          if (escala > VISOR.zoomMin) stage.classList.add('is-dragging');
        });
        stage.addEventListener('pointermove', e => {
          const p = punteros.get(e.pointerId); if (!p || !gesto) return;
          p.x = e.clientX; p.y = e.clientY;
          if (Math.hypot(p.x - p.x0, p.y - p.y0) > 6) huboMovimiento = true;
          const c = centro();
          if (gesto.tipo === 'pellizco' && punteros.size >= 2) {
            const [a, b] = [...punteros.values()];
            const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2 - c.x, my = (a.y + b.y) / 2 - c.y;
            const nueva = limitar(gesto.s0 * d / gesto.d0, VISOR.zoomMin, VISOR.zoomMax), k = nueva / gesto.s0;
            escala = nueva; tx = mx - (gesto.mx0 - gesto.tx0) * k; ty = my - (gesto.my0 - gesto.ty0) * k;
            aplicar();
          } else if (gesto.tipo === 'arrastre') {
            tx = gesto.tx0 + (p.x - gesto.x0); ty = gesto.ty0 + (p.y - gesto.y0);
            aplicar();
          }
        });
        function terminar(e) {
          const p = punteros.get(e.pointerId); if (!p) return;
          const solo = punteros.size === 1;
          punteros.delete(e.pointerId);
          if (solo && e.type === 'pointerup' && !huboMovimiento) {
            // toque o clic sin arrastrar: si fue fuera de la imagen, se cierra
            const r = img.getBoundingClientRect();
            tocoFuera = img.hidden || e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
          }
          iniciarGesto();
          if (!punteros.size) stage.classList.remove('is-dragging');
        }
        stage.addEventListener('pointerup', terminar);
        // Se cierra en el 'click' (no en pointerup): así el toque no "atraviesa" el visor y abre el item que quedaba debajo
        stage.addEventListener('click', () => { if (tocoFuera) { tocoFuera = false; cerrar(); } });
        stage.addEventListener('pointercancel', terminar);

        // ── Controles
        btnCerrar.addEventListener('click', cerrar);
        btnMas.addEventListener('click', () => zoomBoton(VISOR.zoomPaso));
        btnMenos.addEventListener('click', () => zoomBoton(-VISOR.zoomPaso));
        window.addEventListener('resize', () => { if (abierto) aplicar(); });
        document.addEventListener('keydown', e => {
          if (!abierto) return;
          if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
          else if (e.key === '+' || e.key === '=') zoomBoton(VISOR.zoomPaso);
          else if (e.key === '-' || e.key === '_') zoomBoton(-VISOR.zoomPaso);
          else if (e.key === 'Tab') {                          // el foco se queda dentro del visor
            const f = [btnCerrar, btnMenos, btnMas].filter(b => !b.disabled && b.offsetParent !== null);
            const i = f.indexOf(document.activeElement);
            e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
          }
        });

        document.addEventListener('visor:abrir', e => abrir(e.detail.src, e.detail.alt, e.detail.el));
      })();
})();
