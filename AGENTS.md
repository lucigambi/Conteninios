# Landing Conteniños × FlexFlix — brief de proyecto

Vas a construir una landing en esta carpeta. Leé todo este brief antes de hacer nada.

## Cómo trabajar conmigo

- Respondé en español, breve y concreto. Sin excusas ni promesas que no puedas cumplir.
- **No escribas código hasta que yo te lo pida.** Primer paso: revisá la carpeta `assets/`, comparala con la lista de assets de este brief, decime qué falta y presentame el plan de archivos. Esperá mi OK.
- **La estructura de carpetas ya está armada y es la mía.** No la reorganices ni muevas carpetas. Podés renombrar archivos dentro de cada carpeta, mostrándome antes la tabla de cambios.
- Si en `docs/` hay archivos de estándares (tipografía responsive, tokens de color), leelos y aplicalos. Si no están, usá estas bases: tipografía fluida con `clamp()`, y colores como tokens CSS en tres capas (primitivos → semánticos → componentes), de modo que cambiar 2 o 3 colores base actualice toda la paleta.
- No edites video. Todo lo que sea video va como placeholder (ver sección "Video").
- Si algo de este brief no se puede hacer bien, decímelo antes de improvisar otra cosa.

## Objetivo

Conteniños es un producto infantil que ya existe, con cuatro personajes. La landing es una propuesta comercial de FlexFlix (flexflix.ai, plataforma educativa argentina con IA) para los dueños de Conteniños. Tiene que demostrar cómo FlexFlix transformaría el producto en algo muy educativo y divertido, con material gráfico de excelente calidad.

Resultado buscado: que el dueño diga "sí, quiero desarrollar Conteniños con FlexFlix".

Nivel visual esperado: WOW. Mucha animación y mucho diseño. Nada genérico ni con aspecto de plantilla.

## Contexto de uso (condiciona todo)

- Se muestra **en una reunión, proyectada desde una notebook**. Desktop es la prioridad; mobile tiene que funcionar bien pero es secundario.
- Resoluciones que tienen que verse perfectas: **1280×720, 1366×768, 1440×900, 1536×864, 1920×1080**.
- El alto manda: en 1366×768 quedan unos 650 px útiles. Cada sección fijada tiene que entrar completa ahí. Escalá por alto de viewport además de por ancho.
- Proyector: lava colores y baja contraste. Textos grandes, contraste alto, nada de detalles finos sobre fondos claros.
- Tiene que funcionar **sin internet y abriendo `index.html` directo** (file://). Por eso: GSAP y fuentes locales, sin CDN, y los datos en un archivo `.js`, no en un `.json` cargado con fetch.
- Con proyector conectado algunas notebooks pierden cuadros: limitá partículas, `filter: blur` y `backdrop-filter`. Animá solo `transform` y `opacity`.

## Stack

- HTML, CSS nativo y JavaScript vanilla. Sin frameworks ni build.
- **GSAP + ScrollTrigger** (copia local en `assets/vendor/`) para lo atado al scroll.
- **lottie-web** (copia local en `assets/vendor/`) solo para el logo animado de FlexFlix. Cargá la animación embebida como datos en un `.js`, no por ruta: leer el `.json` por ruta falla al abrir `index.html` sin servidor.
- Todo lo demás en CSS nativo: hovers, flotación continua, transiciones de color, brillos, entradas simples.
- Respetar `prefers-reduced-motion`: todo queda estático y legible.

## Concepto: "Cruzá el portal"

El fondo del hero es una nebulosa con un resplandor central, que funciona como portal. Es el hilo conductor: el scroll es un viaje y cada personaje abre un mundo con su color. Mensaje: los personajes ya son geniales; FlexFlix les da algo para enseñar.

Colores por personaje (aproximados, tomados de la guía; ajustalos contra los assets):

| Personaje | Color | Quién es |
|---|---|---|
| Charlie | Verde | Nene de pelo castaño, anteojos azules, libro rojo |
| ED | Naranja | Nene zombie de pelo naranja, un solo lente cuadrado, campera con corazón |
| Vamp | Violeta | Murciélago violeta peludo, con zapatillas |
| Alma | Celeste | Nena fantasma de pelo blanco y vestido blanco |

Colores de marca de FlexFlix: tomalos del Lottie del logo, no los inventes. Tipografía: preguntame si hay una de marca; si te digo que no, usá **Fredoka** para títulos y **Nunito** para textos, las dos locales.

## Navegación: scroll cinematográfico con anclaje

- Las animaciones siguen al scroll (scrub).
- Al soltar, la página se acomoda sola en el punto exacto de cada sección (snap), así nunca queda una animación a medio camino.
- **Modo presentación:** flechas y barra espaciadora avanzan o retroceden de sección en sección con la transición completa.
- Probalo específicamente a 1366×768.

## Estructura de secciones

1. **Hero.** Parallax en dos planos: el fondo de nebulosa y los personajes en pose de acción, cada uno a su profundidad. Sumá profundidad con partículas y brillos en CSS, con medida. Intro con el video del logo ensamblándose. Los personajes entran. Logo animado de FlexFlix chico, como firma "by FlexFlix". Titular sugerido: "Los mismos personajes. Ahora enseñan." CTA.
2. **Números.** Contadores animados: 4 personajes, 72 temas, 8 escenas, tráiler de 3:00. Dato destacado: **43 de los 72 temas ya existen en Currícula FlexFlix** (no se parte de cero).
3. **Charlie**, 4. **ED**, 5. **Vamp**, 6. **Alma.** Una sección fijada por personaje. El fondo vira a su color. Muestra: el personaje con su giro de 8 vistas, su frase, su descripción, sus 3 áreas con 6 temas cada una, sus 2 escenas ilustrativas y su loop de video.
7. **Banco de 72 temas.** Grilla filtrable por personaje y por origen (Currícula FlexFlix o Propuesta), con animación al reordenar.
8. **Tráiler.** Reproductor del teaser (con botón de play, porque el autoplay con audio se bloquea) y debajo la línea de tiempo del tráiler de 3:00 como "lo que viene".
9. **Por qué FlexFlix.** Tres puntos: currícula, producción gráfica, plataforma. El texto final me lo pedís a mí.
10. **Cierre.** Los 4 personajes juntos (imagen de grupo), el portal, el logo animado de FlexFlix en grande y un único CTA.

**CTA:** va a una URL que todavía no existe. Definila en una sola constante (por ejemplo `CTA_URL`) con un placeholder, para cambiarla en un único lugar.

**Giro del personaje:** hay 8 vistas por personaje, una cada 45°. El giro avanza con el scroll pasando de una vista a la siguiente. Entre vistas hay pequeñas diferencias de dibujo (por ejemplo el velo de Alma), así que el cambio tiene que ser ágil, no un fundido lento que las delate. No simules 3D con deformaciones.

**Tono:** el público final son nenes de 3 a 5 años. El fondo oscuro de nebulosa queda solo en el hero y el cierre. En las secciones educativas usá la estética luminosa de las escenas ilustrativas.

## Desktop y mobile

| Elemento | Desktop | Mobile |
|---|---|---|
| Hero | Parallax de fondo y personajes, con seguimiento de mouse | Sin seguimiento de mouse |
| Personaje | Fijado, con giro de 8 vistas por scroll | Sin fijar, giro por swipe o automático |
| Temas | 3 columnas visibles | Acordeón por área |
| Escenas | Lado a lado con hover | Carrusel con scroll-snap |
| Banco de 72 | Grilla completa con filtros | 6 por personaje y "ver más" |
| Línea de tiempo del tráiler | Horizontal | Lista vertical |
| Partículas y brillos | Sí, con medida | No |
| Navegación por teclado | Sí | No aplica |

## Video: solo placeholders

No proceses ni recortes video. En cada lugar donde va uno, dejá un placeholder con la proporción final y una ficha visible con la descripción. Usá estos nombres exactos para que, cuando yo ponga los archivos en `assets/video/` (si ya existe una carpeta de videos con otro nombre, usá esa), aparezcan sin tocar código. Cada video tiene un póster JPG con el mismo nombre.

| Archivo | Contenido | Ficha |
|---|---|---|
| `intro-logo.mp4` | El logo se ensambla con piezas volando (0–3 s del teaser) | Mudo, sin loop, 1:1 |
| `charlie-loop.mp4` | Charlie leyendo con auriculares entre pilas de libros (3–8 s) | Mudo, loop, 1:1, menos de 1 MB |
| `ed-loop.mp4` | ED enamorado, con corazones, de noche (8–12 s) | Mudo, loop, 1:1, menos de 1 MB |
| `vamp-loop.mp4` | Vamp con anteojos de sol tocando la guitarra eléctrica (12–16 s) | Mudo, loop, 1:1, menos de 1 MB |
| `alma-loop.mp4` | Alma flotando, come una galletita y toma leche (16–20 s) | Mudo, loop, 1:1, menos de 1 MB |
| `teaser.mp4` | Teaser completo de 23 s, cierra con "by FlexFlix.ai" | Con audio y controles, 1:1, 2 a 4 MB |

Los videos son cuadrados y traen fondo propio. Para integrarlos sin que se note el corte: recortalos con una **máscara CSS de bordes difuminados** (40 a 60 px) con forma orgánica o de portal. Si yo exporto alguno con fondo plano, el color de la sección se toma del video ya exportado, no al revés. No asumas transparencia en los videos.

## Assets

Estructura real del proyecto (ya armada, no la cambies):

```
landing_conteninios/
├── AGENTS.md
├── assets/
│   ├── img/
│   │   ├── escenas/      las 8 escenas ilustrativas
│   │   ├── giros/        4 grillas de 8 vistas, una por personaje
│   │   ├── hero/         fondo de nebulosa
│   │   ├── logo-conte/   logo de Conteniños
│   │   ├── lottie/       logo animado de FlexFlix
│   │   ├── personajes/   4 poses de acción y la imagen de grupo
│   │   └── og-image.jpg
│   ├── video/            vacía por ahora
│   └── vendor/           GSAP, lottie-web y fuentes locales (la creás vos)
└── docs/                 PDF de la guía y archivos de estándares, si están
```

Los archivos no tienen los nombres finales. Identificalos mirándolos y proponeme el renombrado:

| Carpeta | Qué hay | Nombre final |
|---|---|---|
| `giros/` | Grillas de 4×2 con 8 vistas | Se procesan, ver abajo |
| `personajes/` | Nene de anteojos corriendo | `charlie-corriendo.png` |
| `personajes/` | Zombie corriendo | `ed-corriendo.png` |
| `personajes/` | Murciélago volando | `vamp-volando.png` |
| `personajes/` | Nena fantasma flotando | `alma-flotando.png` |
| `personajes/` | Los cuatro juntos | `personajes-grupo.png` |
| `escenas/` | 8 imágenes exportadas del PDF | `{charlie,ed,vamp,alma}-escena-{1,2}` según la tabla de más abajo |
| `hero/` | Nebulosa | `hero-fondo` |
| `logo-conte/` | Logo de Conteniños | `logo-conteninos.png` |

Cuidado con el cruce más probable: **Charlie es el nene de anteojos azules y ED es el zombie de pelo naranja.**

**Procesado de las grillas de giro**, con un script. Las grillas son de 4 columnas por 2 filas, con transparencia real, y el orden de giro es de izquierda a derecha, fila de arriba y después fila de abajo.

Limpieza previa:

1. Verificá que cada grilla tenga canal alfa real. Si alguna no lo tiene, avisame antes de intentar quitar el fondo.
2. Para medir, usá solo píxeles con alfa mayor a 50 %. Los bordes semitransparentes no cuentan para calcular cajas ni apoyos.
3. Eliminá los fragmentos sueltos: componentes pequeños separados del cuerpo principal (restos de color del recorte alrededor del pelo). Conservá solo el componente principal de cada celda y lo que esté pegado a él.
4. Si en los bordes del pelo queda un halo de color ajeno al personaje, corregilo (defringe) y mostrame un antes y después ampliado de una vista antes de aplicarlo a todas.

Corte:

5. Detectá las 8 figuras por el contenido, no dividiendo la imagen en partes iguales.
6. Revisá que ninguna figura esté cortada contra el borde de la grilla (pies, orejas, velo). Si alguna lo está, avisame.

Alineación (lo más importante para que el giro no salte):

7. **Misma escala para las 8 vistas.** No reescales cada vista para igualar alturas: las orejas, el pelo o el velo cambian de alto según el ángulo y eso deformaría el cuerpo. Si hay que corregir escala entre vistas, medila con algo estable del cuerpo (por ejemplo la distancia entre la suela y los ojos), nunca con la caja total, y mostrame los factores antes de aplicarlos.
8. **Línea de piso común:** el punto más bajo de las suelas apoya en la misma fila de píxeles en las 8 vistas.
9. **Eje vertical por los pies, no por el contorno:** centrá cada vista usando el centro horizontal de la zona de los pies y las piernas (el 15 % inferior de la figura), no el centro de la caja total. Orejas, alas, mochila, libro y velo son asimétricos y desplazarían el cuerpo.
10. Mismo tamaño de lienzo para las 8 vistas de un personaje, con margen suficiente para la vista más ancha y la más alta.

Salida:

11. Guardá cada vista como PNG con transparencia en `assets/img/giros/{personaje}/`, con nombre `{personaje}-00.png` a `-07.png` en orden de giro.
12. No borres ni pises las grillas originales.
13. Armá por personaje una hoja de contacto sobre fondo oscuro y un GIF o página de prueba que pase las 8 vistas en loop, para que yo vea si el cuerpo salta o cambia de tamaño.

**Notas por personaje** (revisadas sobre las grillas reales). Las cuatro giran en el mismo sentido: vistas 01 y 02 mirando hacia la derecha de la imagen, vistas 06 y 07 mirando hacia la izquierda.

*Vamp*
- Las orejas son muy grandes y asimétricas en tres cuartos y perfil: es el caso donde centrar por la caja total más desplaza el cuerpo. Usá el eje por los pies.
- La oreja en perfil es más alta que de frente: no iguales alturas.
- Restos rosas y azules sueltos alrededor del pelo: eliminá los fragmentos y corregí el halo.
- Las alas se ven chicas de frente y desplegadas de espalda. Es correcto, no lo "arregles".

*ED*
- Grilla ya corregida y limpia.
- El lente va sobre su ojo izquierdo. No espejes ninguna vista para completar el giro.
- La mochila sobresale hacia atrás en los perfiles: no la uses para centrar.

*Charlie*
- Grilla ya corregida y limpia.
- El libro y la mochila sobresalen hacia un lado distinto en cada vista: no los uses para centrar.

*Alma*
- Grilla ya limpia: la transparencia la corregí yo a mano. No le apliques defringe ni retoques de alfa; solo corte y alineación.
- El velo cambia de forma entre el perfil derecho y el izquierdo. No se corrige; el cambio de vista tiene que ser ágil para que no se note.
- El pelo y el velo son mucho más anchos que el cuerpo: usá el eje por los pies.

Si en alguna grilla encontrás algo que parezca un error de dibujo o de recorte, no lo corrijas: avisame.

Otras reglas:

- Si falta un asset, poné un placeholder con el nombre de archivo esperado a la vista.
- Los originales son PNG y JPG pesados. Proponeme un script que genere WebP/AVIF en varios tamaños de una pasada y usá `<picture>` con `srcset`.
- `og-image.jpg` va en las meta tags para compartir.

Correspondencia de las escenas:

| Archivo | Tema | Qué muestra |
|---|---|---|
| `charlie-escena-1` | C13 La semilla | Charlie frente a una maceta con un brote y un libro abierto |
| `charlie-escena-2` | C09 Figuras geométricas | Charlie arma una casa con bloques de colores |
| `ed-escena-1` | E01 Historia de los juguetes | ED juega al trompo con dos chicos en una plaza de época |
| `ed-escena-2` | E07 Las cartas | ED con una carta lacrada en un correo antiguo |
| `vamp-escena-1` | V15 Carnavales | Vamp con un antifaz de plumas en un carnaval de barrio |
| `vamp-escena-2` | V03 Montañas, llanuras y costas | Vamp saluda a una nena en un valle de montaña |
| `alma-escena-1` | A01 Las emociones | Alma con un espejo y tarjetas de caritas, junto a una nena |
| `alma-escena-2` | A16 Puedo reparar un error | Alma limpia leche derramada con un paño |

Textos de cada escena (bajada y "Explora"):

- **C13:** La pregunta nace frente a la maceta. El libro acompaña el seguimiento del crecimiento con dibujos de distintos días. *Explora:* Observar cambios en una planta a lo largo del tiempo y explorar los cuidados que acompañan su crecimiento.
- **C09:** Charlie combina piezas y prueba posiciones. La construcción vuelve visible un problema matemático cercano. *Explora:* Reconocer formas geométricas sencillas y explorar cómo combinarlas para componer figuras.
- **E01:** Recreación ficcional de época: una plaza inspirada en el siglo XIX. ED comparte el trompo con sus amigos; el juego conecta pasado y presente. *Explora:* Comparar un juego de antes con su práctica actual y reconocer que jugar juntos puede unir a distintas generaciones.
- **E07:** Una carta abre un recuerdo: el mensaje se escribe, se transporta y llega a otra persona. ED comparte una experiencia que vivió. *Explora:* Comparar maneras de comunicarse a distancia en diferentes épocas y reconocer qué tienen en común.
- **V15:** Vamp explora máscaras, vestuarios y música en un carnaval de barrio. La celebración permite conocer una forma de vida en comunidad. *Explora:* Descubrir maneras de celebrar el carnaval mediante músicas, máscaras, vestuarios y encuentros comunitarios.
- **V03:** Las montañas cambian el entorno del viaje. Vamp mira el relieve y encuentra nuevas personas y recorridos. *Explora:* Observar y comparar rasgos visibles de diferentes paisajes, incorporando palabras para describirlos.
- **A01:** Frente al espejo y con tarjetas de emociones, Alma reconoce y nombra alegría, tristeza y enojo. *Explora:* Reconocer y nombrar alegría, tristeza y enojo a partir de gestos y situaciones cotidianas.
- **A16:** Alma vuelca leche por accidente. Reconoce lo ocurrido y participa en una reparación concreta: limpiar la mesa con un paño. *Explora:* Reconocer el efecto de una acción y proponer una reparación relacionada con lo ocurrido.

## Contenido

Fuente: la guía "Temas educativos y propuesta de tráiler" (PDF en `docs/`). Si hay diferencias entre este brief y el PDF, manda el PDF y avisame.

Textos generales de la guía:

- "Cuatro personajes, cuatro maneras de acercarse al conocimiento."
- "Una identidad compartida. Cuatro miradas."
- Público de referencia: nivel inicial, aproximadamente 3 a 5 años (hipótesis de desarrollo).
- 72 temas, 8 visualizaciones, tráiler de 3:00.

Guardá los 72 temas en un único archivo de datos (`data/temas.js`) y generá desde ahí las tarjetas, las secciones de personaje y los filtros. Campos: código, personaje, área, título, origen (`curricula` o `propuesta`), descripción.

Origen por personaje: Charlie 16 Currícula y 2 Propuesta; ED 11 y 7; Vamp 12 y 6; Alma 4 y 14. Total: 43 Currícula FlexFlix y 29 Propuesta.

### Charlie — "Pregunta, observa y descubre."

Lengua, Matemática y Ciencias Naturales mediante curiosidad, imaginación, libros y música. Etiquetas cortas: Lengua · Matemática · Ciencias.

**Lengua**
- C01 Partes del cuento (Currícula): Ordenar una historia sencilla: qué pasa al principio, después y al final.
- C02 La descripción (Currícula): Observar detalles y encontrar palabras para contar cómo es algo o alguien.
- C03 Adivinanzas y trabalenguas (Currícula): Jugar con pistas, palabras y sonidos, disfrutando también de los intentos.
- C04 Poesías y limericks (Currícula): Escuchar versos breves y descubrir rimas, ritmos y palabras que suenan parecido.
- C05 Obras de teatro (Currícula): Representar personajes y pequeñas historias con la voz, los gestos y el cuerpo.
- C06 Inventamos otro final (Propuesta): Imaginar distintas maneras de terminar una historia y compartir las propias ideas.

**Matemática**
- C07 Primeros números (Currícula): Contar pequeñas colecciones y descubrir cuántos objetos hay en un juego compartido.
- C08 Más, menos o igual (Currícula): Comparar grupos pequeños usando objetos concretos: dónde hay más, menos o igual cantidad.
- C09 Figuras geométricas (Currícula): Reconocer círculos, cuadrados y triángulos al construir una casa con piezas de colores.
- C10 Aprender a medir (Currícula): Comparar largos y alturas con pasos, bloques y otras unidades de uso cotidiano.
- C11 El ritmo que se repite (Propuesta): Reconocer y continuar una secuencia sencilla de sonidos, movimientos o colores.
- C12 Ubicación en el espacio (Currícula): Explorar dentro, fuera, arriba, abajo y cerca mediante un juego de búsqueda.

**Ciencias Naturales**
- C13 La semilla (Currícula): Observar cómo una semilla cambia con el tiempo y descubrir cómo cuidarla.
- C14 Luz y sombras (Currícula): Explorar qué sucede con una sombra cuando se mueve la luz o el objeto.
- C15 Abejas (Currícula): Observar cómo son las abejas y qué hacen cuando visitan las flores.
- C16 Los sentidos (Currícula): Descubrir sonidos, texturas, aromas e imágenes y poner en palabras lo que percibimos.
- C17 Animales acuáticos (Currícula): Conocer animales que viven en el agua y comparar sus formas de moverse.
- C18 Estados del agua (Currícula): Observar hielo que se derrite y reconocer cambios del agua en situaciones cotidianas.

### ED — "Conoce el pasado porque estuvo allí."

El pasado y el paso del tiempo, con recuerdos, cambios cotidianos y amistad. Etiquetas cortas: Historia · Memoria · Amistad.

**La vida de otros tiempos**
- E01 Historia de los juguetes (Currícula): Descubrir juegos de otras épocas y reconocer cuáles seguimos compartiendo en el presente.
- E02 La escuela de otros tiempos (Propuesta): Comparar objetos y costumbres escolares del pasado con los que conocemos hoy.
- E03 La ropa cuenta historias (Propuesta): Observar prendas de otras épocas y conversar sobre sus usos y diferencias.
- E04 Compras de otros tiempos (Propuesta): Descubrir cómo eran algunos comercios y qué cambió en las compras cotidianas.
- E05 Una cocina con historia (Propuesta): Comparar utensilios y tareas de una cocina del pasado con una cocina actual.
- E06 Oficios y profesiones (Currícula): Conocer trabajos y comparar algunas herramientas del pasado con sus versiones actuales.

**Inventos y comunicación**
- E07 Las cartas (Currícula): Seguir el viaje de un mensaje escrito y conocer cómo se comunicaban a distancia.
- E08 La rueda (Currícula): Explorar para qué sirven las ruedas y reconocerlas en vehículos de distintas épocas.
- E09 Historia del ferrocarril (Currícula): Viajar a una estación de otra época y descubrir qué transportaban los trenes.
- E10 Historia del teléfono (Currícula): Comparar teléfonos de antes y de ahora y descubrir qué permite una llamada.
- E11 El origen del lápiz (Currícula): Descubrir que los objetos para dibujar y escribir también tienen una historia.
- E12 Historia de la animación (Currícula): Explorar cómo una secuencia de dibujos puede producir una sensación de movimiento.

**Culturas y recuerdos**
- E13 Pirámides de Egipto (Currícula): Conocer construcciones del antiguo Egipto y observar sus formas, tamaños y entorno.
- E14 Historia de los Juegos Olímpicos (Currícula): Conocer una celebración deportiva del pasado y descubrir juegos que reúnen a las personas.
- E15 Mozart (Currícula): Acercarse a un músico de otra época mediante la escucha y el juego musical.
- E16 Un objeto, un recuerdo (Propuesta): Descubrir cómo un objeto puede ayudarnos a contar algo que vivimos hace tiempo.
- E17 Un museo de cosas comunes (Propuesta): Observar objetos del pasado, imaginar sus usos y compartir preguntas sobre su historia.
- E18 Así empezó nuestra amistad (Propuesta): Reconstruir un recuerdo compartido y reconocer cómo crecen los vínculos con el tiempo.

### Vamp — "Explora lugares y formas de vivir."

Lugares, paisajes, culturas y formas de vivir, integrando inclusión y respeto. Etiquetas cortas: Mundo · Culturas · Geografía.

**Paisajes del mundo**
- V01 Islas Galápagos (Currícula): Conocer un paisaje de islas y observar algunos animales que viven en ellas.
- V02 Amazonia (Currícula): Descubrir un paisaje de selva y río y algunas formas de vivir en él.
- V03 Montañas, llanuras y costas (Propuesta): Comparar paisajes y encontrar palabras para describir alturas, superficies y encuentros con el agua.
- V04 La magia de la Antártida (Currícula): Conocer un paisaje de hielo y descubrir cómo se preparan quienes lo visitan.
- V05 La Gran Barrera de Coral (Currícula): Descubrir un paisaje bajo el agua y reconocer que allí viven muchos seres distintos.
- V06 El Gran Cañón (Currícula): Conocer un paisaje de grandes paredes rocosas y observar su río desde un mirador.

**Viajes y vida cotidiana**
- V07 Construcciones (Currícula): Observar distintas viviendas y edificios y descubrir cómo responden a necesidades y entornos.
- V08 Un viaje para conocernos (Propuesta): Descubrir formas de saludar y encontrarnos con personas que hablan distintas lenguas.
- V09 Ciudad, pueblo y campo (Currícula): Comparar lugares donde viven las personas y reconocer actividades, recorridos y espacios compartidos.
- V10 Cartografía (Currícula): Usar un mapa sencillo para encontrar lugares, reconocer referencias y seguir un recorrido.
- V11 Los medios de transporte (Currícula): Conocer formas de viajar según el recorrido: por tierra, por agua o por aire.
- V12 Una mesa con sabores (Propuesta): Conocer comidas y costumbres de distintas personas sin suponer que todos comen igual.

**Culturas y convivencia**
- V13 El arte de la danza (Currícula): Conocer danzas de distintos lugares y explorar sus movimientos, músicas y ocasiones.
- V14 La familia (Currícula): Reconocer distintas formas de familia y escuchar cómo se organiza la vida compartida.
- V15 Carnavales (Currícula): Descubrir maneras de celebrar el carnaval mediante músicas, vestuarios y encuentros comunitarios.
- V16 Mi colmillo es diferente (Propuesta): Reconocer diferencias personales y descubrir que no impiden compartir juegos ni pertenecer al grupo.
- V17 Juegos que viajan (Propuesta): Conocer juegos de distintos lugares y probar sus reglas con nuevos compañeros.
- V18 Todos podemos entrar (Propuesta): Identificar barreras de participación e imaginar cambios para que más personas puedan sumarse.

### Alma — "Reconoce lo que siente y pide lo que necesita."

Emociones, expresión de necesidades, cuidado y vínculos, con acompañamiento de los miedos cotidianos. Etiquetas cortas: Emociones · Cuidado · Vínculos.

**Reconocer emociones**
- A01 Las emociones (Currícula): Reconocer alegría, tristeza y enojo y encontrar palabras para contar cómo nos sentimos.
- A02 Lo siento en el cuerpo (Propuesta): Reconocer señales del cuerpo que pueden acompañar diferentes emociones y necesidades.
- A03 Cosas que me alegran (Propuesta): Reconocer situaciones que nos dan alegría y descubrir que pueden ser distintas para cada persona.
- A04 Cuando estoy triste (Propuesta): Poner en palabras la tristeza y explorar qué compañía o cuidado podemos necesitar.
- A05 Eso me enojó (Propuesta): Reconocer el enojo y buscar formas de expresarlo cuidándonos y cuidando a los demás.
- A06 Dos emociones a la vez (Propuesta): Reconocer que una misma situación puede despertar más de una emoción al mismo tiempo.

**Expresar necesidades y cuidarse**
- A07 El diálogo (Currícula): Expresar lo que necesitamos y escuchar lo que otra persona quiere contarnos.
- A08 Cuando necesito compañía (Propuesta): Nombrar un miedo cotidiano y elegir pedir compañía para acercarnos a lo que nos inquieta.
- A09 Un ratito para calmarme (Propuesta): Probar pequeñas pausas y elegir qué nos ayuda cuando sentimos mucho enojo o inquietud.
- A10 Mis manos pueden cuidar (Propuesta): Elegir acciones de cuidado hacia nosotros, otras personas y los objetos que compartimos.
- A11 Mi cuerpo y mis límites (Propuesta): Expresar comodidad o incomodidad y reconocer que podemos pedir que una acción se detenga.
- A12 ¿A quién pido ayuda? (Propuesta): Identificar personas de confianza y practicar cómo pedir ayuda cuando la necesitamos.

**Amistad y convivencia**
- A13 ¿Quieres jugar conmigo? (Propuesta): Invitar a jugar, expresar deseos y escuchar la respuesta de otra persona.
- A14 El reglamento (Currícula): Acordar reglas sencillas, esperar turnos y revisar qué ayuda a jugar juntos.
- A15 Los dos queremos lo mismo (Propuesta): Expresar deseos y buscar acuerdos cuando dos personas quieren usar un mismo objeto.
- A16 Puedo reparar un error (Propuesta): Reconocer lo que ocurrió y proponer una acción concreta para reparar sus efectos.
- A17 Pregunto cómo acompañarte (Propuesta): Escuchar lo que otro necesita antes de decidir de qué manera podemos ayudarlo.
- A18 Etapas de la vida (Currícula): Reconocer cambios al crecer y valorar lo que podemos hacer solos o con ayuda.

### Tráiler de 3 minutos (línea de tiempo)

Cuatro bloques de 35 s. Suman 2:20; el resto se define en el montaje, así que mostralo como apertura y cierre "a definir".

| Bloque | Tema | Foco educativo |
|---|---|---|
| Charlie, 35 s | La semilla | Una semilla puede comenzar a crecer; observar sus cambios lleva varios días. |
| ED, 35 s | Historia de los juguetes | Algunos juegos siguen presentes a través del tiempo y se comparten con amigos. |
| Vamp, 35 s | Carnavales | Conocer músicas, máscaras y vestuarios del carnaval como formas de celebrar en comunidad. |
| Alma, 35 s | Las emociones | Reconocer y nombrar alegría, tristeza y enojo a partir de gestos y situaciones cotidianas. |

## Antes de darlo por terminado

- Revisá la página en las cinco resoluciones de notebook, más 390×844 en mobile.
- Verificá que cada sección fijada entre completa en 1366×768.
- Probá la navegación por teclado de punta a punta.
- Probá abriendo `index.html` sin servidor y sin internet.
- Probá con `prefers-reduced-motion` activado.
- Decime qué quedó con placeholder y qué no pudiste verificar.

## Datos que todavía me tenés que pedir

1. Si FlexFlix tiene tipografía de marca.
2. Textos finales de "Por qué FlexFlix".
3. URL del CTA.
