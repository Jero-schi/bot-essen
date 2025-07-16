# Bot de WhatsApp con Google Sheets

Este proyecto es un bot de WhatsApp que responde consultas sobre productos usando datos almacenados en una hoja de cálculo de Google Sheets. Está pensado para facilitar la consulta de precios y detalles de productos de forma automática y rápida.

---

## Características

- Consulta productos por nombre o parte del nombre.
- Devuelve información detallada: precios, cuotas, puntos y observaciones.
- Soporta múltiples coincidencias con mensajes claros.
- Validación simple de usuarios autorizados mediante una hoja adicional en Google Sheets.
- Manejo de sesiones local para evitar reconexiones frecuentes.
- Funciona con WhatsApp Web usando la librería [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).
- Despliegue sencillo en VPS con administración mediante PM2.

---

## Requisitos

- Node.js (versión 16 o superior recomendada)
- npm
- Cuenta de Google Cloud con una cuenta de servicio habilitada y la API de Google Sheets activada.
- Hoja de cálculo de Google Sheets con la información de productos y usuarios autorizados.
- Cuenta de WhatsApp para vincular mediante código QR.

---

## Instalación

1. Clonar el repositorio

```bash
git clone https://github.com/tu_usuario/tu_repositorio.git
cd tu_repositorio
```

2. Instalar dependencias

```bash
npm install
```

3. Crear un archivo `.env` en la raíz con las siguientes variables (no compartir ni subir este archivo a repositorios públicos):

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu_email@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_ID=tu_id_de_hoja_de_calculo
```

4. Configurar la hoja de cálculo

- Hoja `Productos` (o `Hoja1`): debe contener la lista de productos y detalles en columnas, empezando en A2.
- Hoja `Usuarios`: debe contener en la columna A la lista de números de WhatsApp autorizados (formato completo con código de país, por ejemplo: `5491123456789`).

5. Ejecutar el bot localmente o en VPS

```bash
node index.js
```

Al iniciar, el bot mostrará un código QR en la consola para vincular la cuenta de WhatsApp.

---

## Uso

- Envía mensajes con el nombre o parte del nombre de un producto para recibir información detallada.
- Si hay varias coincidencias, el bot muestra todas o pide refinar la búsqueda.
- Solo los usuarios autorizados (listados en la hoja `Usuarios`) pueden usar el bot.

---

## Buenas prácticas

- No subir al repositorio archivos sensibles como `.env` o carpetas de sesión (`.wwebjs_auth/` o `session/`).
- Usar `.gitignore` para evitar subir `node_modules/`, sesiones y archivos privados.
- Para producción, usar un VPS y un gestor de procesos como `pm2` para mantener el bot corriendo siempre.
- Considerar backups periódicos del proyecto y de las hojas de Google Sheets.

---

## Estructura básica del proyecto

```
/
├── index.js           # Código principal del bot
├── package.json       # Dependencias y scripts
├── .env               # Variables de entorno (no subir a repos)
├── .gitignore         # Ignorar node_modules, sesiones, .env
├── session/           # Carpeta con datos de sesión WhatsApp (auto generada)
└── README.md          # Documentación (este archivo)
```

---

## Problemas comunes y soluciones

- **Error al lanzar Puppeteer en VPS:** agregar argumentos `--no-sandbox --disable-setuid-sandbox` en la configuración.
- **Falta de memoria:** aumentar RAM o swap en el servidor.
- **No aparecen mensajes en consola:** verificar que el código tenga `console.log` y que el bot esté corriendo.
- **No llega el código QR:** revisar que Puppeteer se lance correctamente y que no haya errores previos.
- **Permisos negados al usar SCP:** asegurarse de tener acceso SSH correctamente configurado para el usuario del VPS.

---

## Licencia

Este proyecto es privado para uso comercial. No distribuir sin autorización.

---

¡Gracias por confiar en este bot!
