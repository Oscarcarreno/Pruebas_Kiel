/* ============================================================================
   SERVICIOS DE COMPAÑÍA INDUSTRIAL KIEL
   Cada servicio es una tarjeta en servicios.html; al seleccionarla se muestra su sección,
   armada con los "bloques" de abajo, en el orden en que los escribas. Puedes combinarlos con libertad.

   BLOQUES DISPONIBLES (campo "tipo"):
   { tipo:'texto', titulo?, parrafos:['…','…'] }
   { tipo:'detalle', titulo?, texto?:'…' | parrafos:['…','…'] }                        // texto centrado en color oscuro con opacidad
   { tipo:'lista', titulo?, estilo:'puntos'|'etiquetas'|'tarjetas', items:['…'] }      // en 'tarjetas': items:[{titulo, texto?}]
   { tipo:'especificaciones', titulo?, filas:[['Diámetros','1/8″ a 3/8″'], …] }
   { tipo:'imagen', src, alt?, pie? }                                                  // al tocarla se amplía (zoom)
   { tipo:'galeria', columnas?:2|3|4, imagenes:[{src, alt?, pie?}, …] }
   { tipo:'video', src:'…mp4', poster?, titulo?, pie? }                                // o youtube:'ID_DEL_VIDEO'
   { tipo:'medio-texto', titulo?, parrafos?, lista?:['…'], invertir?:true,             // texto junto a una imagen o video
       medio:{ imagen:{src, alt?} }  |  { video:{src, poster?} }  |  { youtube:'ID', poster? } }
   { tipo:'cta', texto?, boton?:{ etiqueta, href } }                                   // llamada a la acción (por defecto, cotizar)

   Las imágenes que no existan se ocultan solas, así que puedes dejar las rutas listas y subir los archivos después.
   Imágenes sugeridas: images/Servicios/<slug>.jpg (tarjeta) e images/Servicios/<slug>-1.jpg, -2.jpg… (sección).
   ============================================================================ */
const SERVICIOS = [
  {
    slug: 'remache-semi-tubular',
    titulo: 'Remache Semi-Tubular',
    etiqueta: 'Remaches',
    resumen: 'Fabricación de remache semi-tubular en Monterrey.',
    imagen: 'images/Remaches_Semitubulares.jpg',
    bloques: [
      { tipo: 'lista', titulo: 'Remache semi-tubular en Monterrey.', estilo: 'puntos', items: ['Manejamos medidas "estándar" y "especiales" sobre especificación de el cliente, hasta 3" de largo y 1/2" de diámetro.', 'Se fabrican en diferentes materiales como acero al carbón, acero inóxidable, aluminio, latón o acabado latonado'] },
      { tipo: 'imagen', src: 'images/Remaches_Semitubulares.jpg', alt: 'Remache semi-tubular' },
      { tipo: 'cta' }
    ]
  },
  {
    slug: 'cortinas-de-acero',
    titulo: 'Cortinas de Acero',
    etiqueta: 'Pernos',
    resumen: 'Fabricación y venta de pernos para cortina de acero.',
    imagen: 'images/Remaches_Cortinas.jpg',
    bloques: [
      { tipo: 'texto', parrafos: ['Fabricamos para la industria de Cortinas de Acero'] },
      { tipo: 'lista', titulo: 'Remaches sólidos', estilo: 'puntos', items: ['Remache cabeza redonda 3/16 x ½', 'Remache cabeza plana No. 2, 3, 4 y 5', 'Remache # 12'] },
      { tipo: 'texto', parrafos: ['Nuestro remache es maleable y de excelente calidad, solicita muestras.', 'Enviamos a todo México; tenemos convenio de precios y excelentes tiempos de entrega con compañías fleteras.'] },
      { tipo: 'imagen', src: 'images/Remaches_Cortinas.jpg', alt: 'Remaches Cortinas' },
      { tipo: 'cta' }
    ]
  },
  {
    slug: 'carroceros',
    titulo: 'Carroceros',
    etiqueta: 'Tornillos',
    resumen: 'Fabricación de tornillos carroceros.',
    imagen: 'images/Tornillos_Carroceros.jpg',
    bloques: [
      { tipo: 'lista', titulo: 'Fabricamos tornillos y remaches carroceros', estilo: 'puntos', items: ['Torx 30 1/4 x 1".', 'Torx 30 1/4 x 2".', 'Torx 30 1/4 x 1-1/2".', 'Remache para redila 1/4 x 2".', 'Remache para redila 1/4 x 1-1/8".', 'Remache para redila 1/4 x 1-1/4".', 'Remache para redila 1/4 x 1-1/2".', 'Remache 3/16" para redila chica.', 'Pija autorroscante cabeza estufa pavonada 1/4 x 2" Torx 30.'] },
      { tipo: 'imagen', src: 'images/Tornillos_Carroceros.jpg', alt: 'Tornillos Carroceros' },
      { tipo: 'cta' }
    ]
  },
  {
    slug: 'ferreteros',
    titulo: 'Ferreteros',
    etiqueta: 'Distribuidores',
    resumen: 'Amplia gama de tornillos ferreteros para distribuidores.',
    imagen: 'images/Tornillos_Ferreteros.jpg',
    bloques: [
      { tipo: 'texto', titulo: 'Amplia gama de tornillos ferreteros', parrafos: ['Para los distribuidores ferreteros contamos con una amplia gama de productos.'] },
      { tipo: 'lista', titulo: 'Tornillo estufa combinación sin tuerca negro y galvanizado a granel.', estilo: 'puntos', items: ['5/32 x 1/2″', '5/32 x 3/4″', '5/32 x 1″', '5/32 x 1-1/12″', '3/16 x 1/2″', '3/16 x 3/4″', '3/16 x 1″', '3/16 x 2″', '1/4 x 1/2″', '1/4 x 3/4″', '1/4 x 1″', '1/4 x 1-1/2″', '1/4 x 2″', 'Birlo 5/32 x 1-1/12″', 'Perno 1/4 x 2.650“'] },
      { tipo: 'detalle', texto: 'Pedido mínimo: 50 mil surtido.' },
      { tipo: 'especificaciones', titulo: 'Remaches Sólidos', filas: [['Remache Cabeza Plana No. 2, 3, 4 y 5', 'Negro y Galvanizado'], ['Remache Cabeza Redonda 3/16 x 1/2″', 'Negro'], ['Remache No. 12', 'Negro y Galvanizado'], ['Remache para redila, recocido 1/4 x 1-1/8" cabeza redonda o plana', 'Negro y Galvanizado'], ['Remaches escalonados', 'Negro y Galvanizado']] },
      { tipo: 'detalle', texto: 'Pedido mínimo 100Kg; surtidos.' },
      { tipo: 'especificaciones', titulo: 'Otros Productos', filas: [['Pija Autorroscante Cabeza Estufa Pavonada', '1/4 x 2″ (Torx 30)'], ['Torx 30 Galvanizada', '1/4 x 1″'], ['Tornillo Binding Negro', '10/32 x 5/16″'], ['Tornillo Cabeza Redonda Galvanizado', '12/24 x 3/8″'], ['Tornillo C/T.T (Tipo F) Galvanizado', '8/32 x 1/4″'], ['Tornillo Combinado Galvanizado', '8/32 x 3/8″']] },
      { tipo: 'imagen', src: 'images/Tornillos_Ferreteros_1.jpg', alt: 'Tornillos ferreteros' },
      { tipo: 'imagen', src: 'images/Tornillos_Ferreteros_2.jpg', alt: 'Tornillos ferreteros' },
      { tipo: 'imagen', src: 'images/Tornillos_Ferreteros_3.jpg', alt: 'Tornillos ferreteros' },
      { tipo: 'cta' }
    ]
  },
  {
    slug: 'industria-nacional',
    titulo: 'Industria Nacional',
    etiqueta: 'Todas las industrias',
    resumen: 'Tornillos y pernos para toda la industria nacional, de 1/8″ a 3/8″.',
    imagen: 'images/Industria_Nacional.jpg',
    bloques: [
      { tipo: 'texto', titulo: 'Tornillos y pernos a toda la industria nacional', parrafos: ['Contamos con un amplio catálogo de fabricación de tornillos para todo tipo de industria.', 'Desde diámetros de 1/8″ hasta 3/8″ y largos hasta 3.060″ con todo tipo de acabados y para todo tipo de Industria.'] },
      { tipo: 'texto', titulo: 'Integrados a tu línea de producción', parrafos: ['Somos una empresa altamente confiable para estar integrados en tu línea de producción: tornillería de excelente calidad y a tiempo, según tus requerimientos y programas.'] },
      { tipo: 'lista', estilo: 'tarjetas', items: [{ titulo: 'Cortineros metálicos' }, { titulo: 'Carroceros y redilas' }, { titulo: 'Fabricantes de bisagras' }, { titulo: 'Industria Eléctrica' }, { titulo: 'Enseres Electrodomésticos' }, { titulo: 'Fabricantes de Muebles' }] },
      { tipo: 'video', src: 'images/Tornillo_Empacado.mp4' },
      { tipo: 'galeria', columnas: 3, imagenes: [{ src: 'images/Industria_Nacional_1.jpg', alt: '' }, { src: 'images/Industria_Nacional_2.jpg', alt: '' }, { src: 'images/Industria_Nacional_3.jpg', alt: '' }, { src: 'images/Industria_Nacional_4.jpg', alt: '' }, { src: 'images/Industria_Nacional_5.jpg', alt: '' }, { src: 'images/Industria_Nacional_6.jpg', alt: '' }] },
      { tipo: 'cta' }
    ]
  },
  {
    slug: 'industria-electrica',
    titulo: 'Industria Eléctrica',
    etiqueta: 'Tornillos Electricos',
    resumen: 'Tornillería y sujeciones para la industria eléctrica.',
    imagen: 'images/Tornillos_Electricos.jpg',
    bloques: [
      { tipo: 'texto', titulo: 'Fabricación para la Industria Eléctrica', parrafos: ['Fabricamos tornillos para centros de carga, apagadores, cajas de fusibles, sockets y cualquier similar. Contamos con el siguiente stock:'] },
      { tipo: 'especificaciones', filas: [['Tornillo', '8/32″ x 3/8″'], ['Tornillo', '6/32″ x 1/2″ CP Ran'], ['Tornillo Binding', '10/32″ x 5/16″'], ['Tornillo Tipo F con Tratamiento Térmico', '8/32″ x 1/4″']] },
      { tipo: 'detalle', texto: 'Pedido mínimo 25 mil piezas' },
      { tipo: 'imagen', src: 'images/Tornillos_Electricos.jpg', alt: 'Tornillería para la industria eléctrica' },
      { tipo: 'cta' }
    ]
  },
  {
    slug: 'pernos-para-bisagras',
    titulo: 'Pernos para Bisagras',
    etiqueta: 'Pernos',
    resumen: 'Fabricación de pernos para fabricantes de bisagras.',
    imagen: 'images/Pernos_Bisagras.jpg',
    bloques: [
      { tipo: 'texto', titulo: 'Fabricación de pernos para bisagras', parrafos: ['Fabricamos cualquier tipo de perno con diámetros desde 1/8″ hasta 3/8” y largos hasta 3.060″. También fabricamos pernos especiales. Las medidas de pernos en stock son las siguientes:'] },
      { tipo: 'lista', estilo: 'puntos', items: ['Perno para Bisagra 0.157" Ø x 3", Negro, Con o sin cuello.', 'Perno para Bisagra 0.164" Ø x 3", Negro, Con o sin cuello.', 'Perno para Bisagra 0.172" Ø x 3", Negro, Con o sin cuello.', 'Perno para Bisagra 0.187" Ø x 3", Negro, Con o sin cuello.', 'Perno para Bisagra 0.250" Ø x 3", Negro, Con o sin cuello.'] },
      { tipo: 'detalle', texto: 'Pedido mínimo 100kg' },
      { tipo: 'imagen', src: 'images/Pernos_Bisagras.jpg', alt: 'Perno para bisagra' },
      { tipo: 'cta' }
    ]
  }
];
