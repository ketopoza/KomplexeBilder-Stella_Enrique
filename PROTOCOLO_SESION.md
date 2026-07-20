# Protocolo de Sesión — Patterns of Democracy AR

**Fecha del documento:** 17 julio 2026
**Proyecto:** KomplexeBilder-Stella_Enrique (ex turkey-ar)
**URL:** https://ketopoza.github.io/KomplexeBilder-Stella_Enrique/
**Repositorio:** github.com/ketopoza/KomplexeBilder-Stella_Enrique

---

## 1. Contexto del Proyecto

Instalación de Realidad Aumentada que visualiza datos de transformación democrática (1900–2025) mediante diagramas de anillos arbóreos. Colaboración entre UdK y WZB Berlin Social Science Center (equipo "WAVES of Regime Transformation", Dra. Vanessa Boese-Schlosser). Los datos provienen del dataset ERT (Episodes of Regime Transformation) de V-Dem.

El proyecto comenzó **meses antes de julio 2026** en fase conceptual: diseño de la visualización de datos, análisis del dataset V-Dem ERT, estructura narrativa de los slides, y exploración de tecnologías AR.

A principios de julio se materializó en un repositorio git basado en el template `8th Wall Studio Build` (8frame + webpack).

### Tecnologías

| Componente | Tecnología |
|------------|-----------|
| Plataforma AR | 8th Wall (engine-binary, landing-page, xrextras) |
| Framework 3D | A-Frame (8frame-1.5.0) |
| UI overlay | HTML + CSS plano (sin frameworks) |
| Visualización | Three.js (bundle-turkey.js — animaciones AR) |
| Build | Webpack 5 + Babel |
| Deploy | GitHub Pages vía GitHub Actions |
| Tracking | Git + GitHub |

### Archivos principales

| Archivo | Propósito |
|---------|-----------|
| `src/index.html` | Página de producción con 8th Wall |
| `test.html` | Prototipo AR autónomo (sin 8th Wall) |
| `src/concentric.html` | Visualización concéntrica embebida en iframe |
| `src/bundle-turkey.js` | Lógica Three.js para animaciones AR |
| `.github/workflows/deploy.yml` | Pipeline de deploy a GitHub Pages |

---

## 2. Línea de Tiempo Completa (del repositorio)

### Pre-repositorio (meses antes — fase conceptual)

- Análisis del dataset V-Dem ERT
- Diseño de la metáfora visual "tree rings" para datos democráticos
- Selección de países a visualizar (turkey, germany, + exploración de RussiaPrueba)
- Definición de la estructura narrativa (About → AR → Data → Graphic → Colophon)
- Elección de tecnología 8th Wall + A-Frame

### Fase 1 — Fundación (9–12 julio)

| Fecha | Commit | Cambio |
|-------|--------|--------|
| 9 jul | `fefa389` | **first commit** — template inicial 8th Wall Studio Build |
| 9 jul | `e8adefb` | fix workflow: disable LFS |
| 11 jul | `e899cd6` | Add Germany AR animation with rings, text boxes, images |
| 12 jul | `dcc6b61` | Refine overlay UI: 🎥 start button, dots navigation, slides, contact card, loading overlay |

### Fase 2 — Overlay burbuja (12 julio)

| Fecha | Commit | Cambio |
|-------|--------|--------|
| 12 jul | `e92fdf0` | Burbuja: show ⁉️ on H1 click, ✕ close button to return to scanner |
| 12 jul | `434089c` | Burbuja: expand animation from bottom-left, visible ✕ |
| 12 jul | `55489de` | Burbuja: fix close button z-index (above H1) |
| 13 jul | `414b29e` | Close button: ❌ emoji, moved to top:80px |

### Fase 3 — Reestructuración de slides (13 julio)

| Fecha | Commit | Cambio |
|-------|--------|--------|
| 13 jul | `dcf9aa3` | Restructure: delete old slide 2 & Sources, move 🎥 to slide 1 |
| 13 jul | `ff408e2` | Slide 1: replace About the Data with AR Technologies text |
| 13 jul | `74680df` | New targets TUR.png/GER.png; reformat AR text, Colophon content (test.html) |
| 13 jul | `368e1b8` | Sync index.html with test.html: About the Data, Colophon, AR text |

### Fase 4 — Calibración AR targets (13 julio)

| Fecha | Commit | Cambio |
|-------|--------|--------|
| 13 jul | `4a4f3f0` | Rotate AR content -90deg for new target orientation |
| 13 jul | `2df0bef` | Fix rotation 0 0 90 |

### Fase 5 — Overlay concéntrico + iframe (15 julio)

| Fecha | Commit | Cambio |
|-------|--------|--------|
| 15 jul | `4c40cc2` | Concentric overlay, slide fix, z-index stacking, contact padding, fonts |
| 15 jul | `16ffe48` | Webpack dev-server: serve concentric.html + test.html; copy to dist |
| 15 jul | `450d2d5` | Fix iframe src: remove `src/` prefix for GitHub Pages |
| 16 jul | `d47064c` | Fix: exclude iframe src from html-loader processing |

### Fase 6 — Calibración posiciones AR (16 julio)

Turkey y Germany targets — ajustes finos de posición y escala:

| Orden | Commit | Turkey | Germany |
|-------|--------|--------|---------|
| 1 | `2013edb` | Y 0.4 | — |
| 2 | `7be69ca` | 0.06 0 0 | — |
| 3 | `261c005` | origin, scale 0.1 | — |
| 4 | `adec5f6` | -0.03 0 0, scale 0.12 | — |
| 5 | `34927be` | scale 0.11 | — |
| 6 | `a770042` | scale 0.115 | — |
| 7 | `420b246` | Y -0.003, scale 0.112 | — |
| 8 | `99dffe9` | Y 0.003 | — |
| 9 | `4fd42c5` | — | match turkey pos/scale |
| 10 | `afd78d7` | — | Y 0, scale 0.166 |
| 11 | `1cda40a` | — | Y 0.03, scale 0.146 |
| 12 | `db851d5` | — | Y 0.01, scale 0.148 |
| 13 | `3501f25` | rotation 0 | rotation 0 |

**Commit `3501f25`** = deploy #37 — **última versión funcional conocida**.

### Fase 7 — Sesión actual (17 julio): Sincronización + fixes

#### 7a. Sincronización test.html → index.html

| Acción | Cambios |
|--------|---------|
| Slide unification | Modo único `main` (5 slides) en vez de `initial`(2) + `info`(3) |
| Text updates | About, AR, Data, Graphic, Colophon — versión simplificada |
| CTA button | Añadido "click to continue" (luego eliminado) |
| Concentric padding | 40px 0 0 0 |

#### 7b. Problema: clicks no funcionan

**Síntoma:** La página en GitHub Pages no responde a clicks/touch. El loading screen es visible pero la animación no se dispara.

**Hipótesis:** 8th Wall `landing-page` intercepta los eventos.

**Iteraciones de fix:**

| # | Commit | Fix | Resultado |
|---|--------|-----|-----------|
| 1 | `4c8c352` | `document.addEventListener('click', startAnim, { once: true })` | ❌ |
| 2 | `011344b` | Capture phase `{ capture: true }` | ❌ |
| 3 | `0484cd7` | `pointer-events: none` en overlays invisibles | ❌ |
| 4 | `aabca37` | Eliminar loading screen + mostrar overlay directo | ❌ rompe flujo |
| 5 | `f36c8e1` | **Revert** de aabca37 | ✅ restaura |
| 6 | `066a1c7` | Quitar CTA, `touchstart`+`mousedown` capture, z-index 99999 | ❌ |
| 7 | `881d6a1` | Auto-start animación 2s tras page load | ❌ |

**Posibles causas raíz (no resuelta):**
- 8th Wall `landing-page` overlay → `stopImmediatePropagation()`
- iOS: `preventDefault()` en touchstart impide generación de `click`
- Permisos de cámara bloquean main thread
- Captura de eventos táctiles por el canvas/webgl de 8th Wall
- `a-scene` de A-Frame con `xrweb` monopoliza event loop

#### 7c. Reset + port limpio

| # | Acción | Resultado |
|---|--------|-----------|
| 8 | `git reset --hard 3501f25` + force push | Vuelve a deploy #37 |
| 9 | `1c3639e` | Porto solo unificación slides + textos + padding (sin CTA) |

---

## 3. Arquitectura del Stack de Capas (z-index)

```
z-index: 99999 → #loading-screen  (título + subtítulo, fondo blanco)
z-index: 400   → #page-h1, #page-h3  (headers fijos arriba/abajo)
z-index: 350   → #concentric-overlay, #contact-overlay
z-index: 310   → #close-burbuja, #close-concentric
z-index: 250   → #dots-nav, #info-btn, #concentric-btn
z-index: 200   → #info-overlay  (cards con slides)
```

### Flujo de animación (desde 3501f25)

1. Página carga → `#loading-screen` visible con título + subtítulo centrados
2. Usuario click/touch → `startLoadingAnim()`:
   - Calcula offset entre título actual y posición de `#page-h1`/`#page-h3`
   - Aplica CSS custom properties (`--title-dy`, `--sub-dy`)
   - 300ms delay → añade clase `.animate` (CSS transition mueve título → header)
   - 1500ms después → `.show` en info-overlay (aparecen slides)
   - 2000ms → `.done` + `display:none` en loading screen

---

## 4. Problemas Técnicos

### 4.1 Intercepción de eventos por 8th Wall
- **Síntoma:** Click/touch no dispara animación en sitio desplegado
- **Funciona en localhost** (sin 8th Wall real)
- **Soluciones intentadas:** 7 iteraciones, ninguna funcionó
- **Hipótesis principal:** El `landing-page` component de 8th Wall crea un overlay que intercepta TODOS los eventos táctiles antes de que lleguen a nuestro código, incluso con capture phase

### 4.2 Overlays invisibles bloqueando interacción
- Elementos con `position: fixed; top:0; left:0; right:0; bottom:0` cubren toda la pantalla aunque tengan `opacity: 0`
- **Solución:** `pointer-events: none` por defecto
- Aplicado en commit `0484cd7` pero revertido junto con otros cambios

### 4.3 GitHub Pages + 8th Wall
- Repo renombrado: `ketopoza/turkey-ar` → `ketopoza/KomplexeBilder-Stella_Enrique`
- GitHub Pages deshabilitado y re-habilitado con GitHub Actions como source
- URL cambió: antes era `/turkey-ar/`, ahora `/KomplexeBilder-Stella_Enrique/`
- 8th Wall app key NO está en el código fuente (embebida en el template/build)
- **No verificado:** si el nuevo dominio está whitelisted en dashboard 8th Wall

### 4.4 Dualidad test.html vs src/index.html
- `test.html` usa A-Frame standalone — funcional pero sin 8th Wall
- `src/index.html` requiere 8th Wall — el `landing-page` se interpone
- Las pruebas en localhost no reproducen el problema de producción
- `concentric.html` se renderiza en iframe dentro del overlay concéntrico

### 4.5 Webpack + GitHub Pages
- `CopyWebpackPlugin` copia `dist/` con todos los assets
- `html-loader` con `sources: false` para iframe src
- Build exitoso siempre, pero deploy puede servir versión cacheada

---

## 5. Decisiones de Diseño

| Decisión | Alternativa | Motivo |
|----------|-------------|--------|
| Modo único `main` (5 slides) | Dos modos initial + info | Simplifica navegación, swipe continuo |
| Loading screen con animación (título→header) | Sin loading screen | Transición suave entre splash y UI |
| Sin CTA button | CTA "click to continue" | Eliminar punto de fricción; cualquier click funciona |
| Animación vía CSS transitions + clases | JS animations | Menor complejidad, mejor rendimiento |
| Fondo blanco loading screen | Fondo con imagen | Neutral, no compite con contenido AR |
| Overlay burbuja (scale 0→1) | Fade simple | Efecto visual más pulido |
| z-index 99999 loading screen | z-index 500 | Asegurar que esté sobre cualquier elemento de 8th Wall |

---

## 6. Estado Actual (Commit `1c3639e`)

- **Base:** `3501f25` (deploy #37 funcional)
- **Slides:** Modo único `main` con 5 slides (About, AR Technologies, About the Data, About the Graphic, Colophon)
- **Textos:** Versión actualizada y simplificada (porteda de test.html)
- **Concentric padding:** `40px 0 0 0`
- **Loading animation:** Original de `3501f25` — primer click/touch dispara animación
- **CTA:** No existe
- **pointer-events fix:** No incluido
- **Capture phase:** No incluido

---

## 7. Pendientes / Próximos Pasos

### 7.1. Diagnóstico
- [ ] Conectar Safari Remote Inspector al iPhone con la página abierta
- [ ] Examinar consola JS en busca de errores
- [ ] Verificar qué elementos están recibiendo eventos táctiles
- [ ] Confirmar si 8th Wall `landing-page` está apareciendo

### 7.2. 8th Wall
- [ ] Verificar dashboard de 8th Wall: ¿el nuevo dominio está whitelisted?
- [ ] Probar desactivando `landing-page` en `<a-scene>`
- [ ] Probar con ngrok para HTTPS local

### 7.3. Alternativas
- [ ] Si 8th Wall sigue sin cooperar, considerar migrar a test.html como producción
- [ ] Evaluar otras plataformas AR (AR.js, model-viewer)

---

## 8. Referencias

- **Dataset:** V-Dem Institute. 2023. Episodes of Regime Transformation Project.
- **Tipografía:** Newsreader (Google Fonts)
- **8th Wall Docs:** https://www.8thwall.com/docs
- **A-Frame:** https://aframe.io

---

*Documento generado el 17 julio 2026 — cubre todo el historial del proyecto desde el primer commit (9 julio) hasta el estado actual, incluyendo la fase conceptual previa.*
