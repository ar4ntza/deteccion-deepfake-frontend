# Detector de audio deepfake · Frontend

Interfaz web del proyecto **Evaluación de modelos CNN y LSTM mediante representaciones espectrales para la detección de audios sintéticos**.
---

## Descripción

Aplicación de una sola página hecha con **React + Vite**. La persona sube una grabación de voz, el backend la analiza con dos redes neuronales (CNN y LSTM) y la interfaz muestra qué tan probable es que la voz sea real o falsa.

**Pantallas**

| Pantalla | Qué hace |
|---|---|
| **Inicio** | Presenta el proyecto con una explicación para el público general y el botón "Comenzar". |
| **Detección** | Explica cómo funciona, recibe el audio (arrastrando o eligiendo un archivo) y muestra los resultados. |
| **Acerca de** | Acordeón con la descripción del proyecto, el entrenamiento, cómo interpretar los resultados, las limitaciones y el contacto del equipo. |

**Características**

- Zona para subir o arrastrar el audio (WAV, MP3, FLAC y OGG, hasta 25 MB), con validación de tipo y tamaño y mensajes de error claros.
- Animación de ondas de audio mientras se procesa.
- Una tarjeta por modelo (CNN y LSTM) con un anillo de ondas que se enciende según el porcentaje, y el veredicto "voz real" o "voz falsa".
- Botón **Ver otras condiciones**: muestra además el modelo base (A) y el entrenado solo con español (C).
- Pie de página con el logo y los datos de la universidad.
- Diseño de pantalla dividida con textura de grano y efectos de vidrio, con la paleta Phlox `#CAA9F3`, Verbena `#B37AD4`, Periwinkle `#7997E6`, Atlantis `#206ABC` y Phthalo Blue `#0E155E`. Tipografías: Poppins (títulos) y Didact Gothic (texto).
- Accesible con teclado, adaptable a celular y respeta la opción "reducir movimiento" del sistema.

## Cómo funciona

```
Analyzer.jsx ──► api.js ──POST /predict (campo "audio")──► backend
     ▲                                                          │
     └──────── tarjetas (condición B) + "Ver otras condiciones" ◄┘
```

1. `Analyzer.jsx` valida el archivo y llama a `analyzeAudio` de `api.js`.
2. `api.js` lo envía a `{VITE_API_URL}/predict` y recibe una fila por modelo: `arquitectura`, `condicion`, `fake` y `real`.
3. Las dos tarjetas principales muestran la **condición B** (preentrenado y afinado con español) de cada arquitectura. El resto de los resultados alimenta "Ver otras condiciones".
4. Si la respuesta de la API es un error del audio (formato, tamaño, duración), se muestra el mensaje del servidor. Si el servidor no responde, se muestra un aviso genérico.

**Modo simulado.** Si la variable `VITE_API_URL` no está definida, `api.js` no llama a ningún servidor y devuelve resultados aleatorios tras unos segundos. Sirve para diseñar la interfaz sin el backend, pero **no son resultados reales**.

## Estructura

```
frontend/
├── index.html
├── package.json
├── .env                    VITE_API_URL
└── src/
    ├── main.jsx
    ├── App.jsx             navegación, pie de página y cambio de pantalla
    ├── api.js              comunicación con el backend (y modo simulado)
    ├── styles.css          todos los estilos y la paleta (variables en :root)
    ├── assets/logo.png     logo de la universidad
    └── components/
        ├── Hero.jsx        pantalla de inicio y la dona animada
        ├── Analyzer.jsx    carga del audio, animación de carga y resultados
        └── About.jsx       pantalla "Acerca de"
```

## Requisitos

- **Node.js** 20 o superior (versión LTS) y **npm**.
- Conexión a internet, para cargar las tipografías desde Google Fonts.
- El **backend** corriendo, para obtener resultados reales.

## Puesta en marcha

Desde la carpeta `frontend/`:

**1. Instalar dependencias**

```bash
npm install
```

**2. Conectar con el backend**

Crea un archivo `.env` en `frontend/` (junto a `package.json`) con la dirección de la API:

```
VITE_API_URL=http://localhost:8000
```

**3. Levantar el backend**

En otra terminal, en la raíz del repositorio, sigue los pasos del README del backend (`python -m uvicorn main:app --port 8000`).

**4. Levantar el frontend**

```bash
npm run dev
```

Abre `http://localhost:5173`. Vite lee el `.env` solo al arrancar: si lo creas o lo cambias, reinicia `npm run dev`.

### Cómo saber que sí está conectado al backend

- En la terminal del backend aparece `POST /predict … 200 OK` cada vez que subes un audio.
- En las herramientas del navegador (F12 → Network) se ve una petición `predict` a `localhost:8000` con estado 200.
- `http://localhost:8000/salud` muestra `"ok": true`.
- Si apagas el backend y la interfaz muestra "No pudimos analizar el audio…", se estaba conectando de verdad. Si sigue dando resultados, estás en modo simulado.

### Versión de producción

```bash
npm run build      # genera la carpeta dist/
npm run preview    # la sirve localmente para probarla
```

`VITE_API_URL` se incorpora en el momento de la compilación, así que define la dirección final de la API antes de correr `npm run build`. Además, agrega la dirección en la que publiques el frontend a `ALLOWED_ORIGINS` del backend.

## Personalización

| Qué | Dónde |
|---|---|
| Slogan y descripción de la pantalla de inicio | `src/components/Hero.jsx` |
| Pasos de "¿Cómo funciona?" y tamaño máximo del audio | `src/components/Analyzer.jsx` (`MAX_MB` debe coincidir con `MAX_MB` del backend) |
| Textos, cifras y contacto de "Acerca de" | `src/components/About.jsx` (arreglo `ITEMS`) |
| Colores y tipografías | `src/styles.css` (variables en `:root` y el `@import` de las fuentes) |
| Logo y datos del pie de página | `src/assets/logo.png` y `src/App.jsx` |

## Solución de problemas

| Síntoma | Causa y solución |
|---|---|
| Los resultados cambian cada vez con el mismo audio | Estás en modo simulado. Define `VITE_API_URL` en `.env` y reinicia `npm run dev`. |
| "No pudimos analizar el audio…" | El backend no está corriendo o no es accesible en la dirección de `VITE_API_URL`. |
| Error de CORS en la consola del navegador | La dirección del frontend no está en `ALLOWED_ORIGINS` del backend. Agrégala y reinicia la API. |
| La interfaz no ocupa toda la pantalla o el texto sale centrado | Quedan estilos de la plantilla de Vite. Vacía `src/index.css` y `src/App.css` (y quita sus `import`). |
| Las letras se ven con otra tipografía | No cargaron las fuentes de Google Fonts: revisa la conexión a internet. |
| No aparece el logo | Verifica que exista `src/assets/logo.png`. |
| El audio se rechaza con un mensaje | Revisa el formato (WAV, MP3, FLAC u OGG) y que pese menos de 25 MB. |

## Créditos

Arantza García Vázquez y Edna Samantha Cortés Carrisoza. Asesor: Mtro. Rafael Pérez Aguirre. Universidad Iberoamericana Puebla.