# Pueblos indígenas en la Independencia de México

Sitio educativo listo para publicarse como aplicación web con Node.js, Express y MongoDB.

## Ejecutar en la computadora

1. Abre `iniciar-servidor.bat`.
2. Entra a `http://localhost:8000/`.

La primera vez se ejecuta `npm install` para descargar dependencias.

## Compartir con celulares fuera de tu red

Un enlace `localhost`, `192.168...` o `file:///...` no sirve para otros dispositivos fuera de tu Wi-Fi. Para compartirlo por QR o WhatsApp con cualquier celular, publica la app en un hosting.

## Publicar en Vercel

La forma más directa desde esta carpeta es abrir `desplegar-vercel.bat`.

Ese archivo:

1. Instala dependencias si faltan.
2. Inicia sesión en Vercel.
3. Publica la app con `npx vercel --prod`.

Al terminar, Vercel mostrará una URL pública como `https://nombre-del-proyecto.vercel.app`. Esa es la URL que debes compartir o convertir en QR.

Si usas MongoDB, agrega estas variables en el panel de Vercel:

- `PUBLIC_URL`: la URL pública final de Vercel.
- `MONGODB_URI`: cadena de conexión de MongoDB Atlas.
- `MONGODB_DB`: `independencia_indigena`.

Después de agregarlas, vuelve a desplegar.

## Enlace temporal sin hosting

También puedes abrir `tunel-publico-temporal.bat`. Eso crea una URL pública temporal con ngrok.

Importante: ngrok ahora requiere una cuenta y un authtoken para funcionar. Si el túnel no arranca, crea una cuenta en https://dashboard.ngrok.com/signup y ejecuta:

```bash
npx ngrok config add-authtoken <token>
```

Después, vuelve a correr `tunel-publico-temporal.bat`.

Importante: no compartas `http://localhost:8000`. Debes copiar y usar la URL pública que muestra la ventana del túnel. El script ahora también abrirá automáticamente el navegador con la URL pública cuando el túnel se inicie.
Si abres el sitio solo en localhost, la página solo funcionará en tu computadora y el enlace no servirá para otros dispositivos.

Ese enlace sirve para probar desde celulares fuera de tu red, pero solo mientras tu computadora, el servidor y la ventana del túnel sigan encendidos. No reemplaza un hosting real.

Opciones sencillas:

- Render
- Railway
- Vercel con servidor Node

En Render, por ejemplo:

1. Sube esta carpeta a un repositorio de GitHub.
2. Crea un `Web Service`.
3. Usa estos comandos:
   - Build command: `npm install`
   - Start command: `npm start`
4. Agrega las variables de entorno:
   - `PUBLIC_URL`: la URL pública que te da Render, por ejemplo `https://mi-sitio.onrender.com`
   - `MONGODB_URI`: cadena de conexión de MongoDB Atlas
   - `MONGODB_DB`: `independencia_indigena`

Cuando esté publicado, el botón de compartir usará automáticamente esa URL pública.

## MongoDB

El frontend no se conecta directo a MongoDB. La conexión se hace desde `server.js`, que expone estos endpoints:

- `GET /api/config`: devuelve la URL pública y si MongoDB está configurado.
- `GET /api/health`: revisa si el servidor y MongoDB responden.
- `POST /api/visits`: guarda visitas en la colección `visits`.
- `POST /api/shares`: guarda eventos de compartir en la colección `shares`.

Crea un archivo `.env` a partir de `.env.example` si quieres probar MongoDB localmente.
