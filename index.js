const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// Configurar autenticación con Google
const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets.readonly"],
);

const sheets = google.sheets({ version: "v4", auth });

// async function cargarMapaDesdePlanilla() {
//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId: process.env.HOJA_MAESTRA_ID,
//     range: "Hoja1!A1:B", // número | hojaId
//   });

//   const filas = response.data.values;
//   const mapa = {};
//   for (const fila of filas) {
//     const numero = fila[0];
//     const hojaId = fila[1];
//     if (numero && hojaId) {
//       mapa[numero] = hojaId;
//     }
//   }
//   return mapa;
// }

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body.trim().toLowerCase();
  const from = req.body.From.replace("whatsapp:+", "").replace("+", ""); // deja solo el número

  try {
    // Lee siempre de la misma hoja de precios central
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Hoja1!A2:J", // Ajustá el rango si tu hoja tiene otro nombre o estructura
    });

    const rows = response.data.values;
    let found = false;
    let reply = "";

    for (let row of rows) {
      const producto = row[0].toLowerCase();
      if (producto.includes(incomingMsg)) {
        reply = `📦 Producto: ${row[0]}\n💳 Precio Lista: *${row[1]}*\n💰 PSVP: *${row[2]}*\n💳 Precio Preferencial: *${row[3]}*\n6 Cuotas: *${row[4]}*\n9 Cuotas: *${row[5]}*\n12 Cuotas: *${row[6]}*\n18 Cuotas: *${row[7]}*\n⭐ Puntos Essen: ${row[8]}\n📝 Observaciones: ${row[9] || "Ninguna"}`;
        found = true;
        break;
      }
    }

    if (!found) {
      reply = "❌ Producto no encontrado. Por favor, intentá con otro nombre.";
    }

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: reply,
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});