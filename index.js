// Nueva versión para usar con whatsapp-web.js
envPath = './.env'; // Asegurate de que exista y esté en .gitignore
require("dotenv").config({ path: envPath });

const { google } = require("googleapis");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require('fs')

// 🔤 Función para quitar tildes y normalizar texto
function limpiarTexto(texto) {
  return texto
    .normalize("NFD") // descompone caracteres Unicode
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u200B-\u200D\uFEFF\s]/g, '') // remueve acentos
    .toLowerCase()
    .trim();
}

// Autenticación de Google Sheets
const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets.readonly"]
);
const sheets = google.sheets({ version: "v4", auth });

console.log('ejecutando index.js actualizado');

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './session' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("✅ Bot conectado a WhatsApp");

  try {
    const resUsuarios = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Usuarios!A2:A",
    });

    const usuariosAutorizados = (resUsuarios.data.values || []).flat();
    console.log("📋 Usuarios autorizados:");
    usuariosAutorizados.forEach((num, i) => {
      console.log(`${i + 1}. ${num}`);
    });

    // fs.writeFileSync('usuarios.log', usuariosAutorizados.join('\n')); // opcional
  } catch (error) {
    console.error("❌ Error al obtener usuarios autorizados:", error);
  }
});

client.on("message", async (message) => {
  const incomingMsg = limpiarTexto(message.body);
  const senderNumber = message.from.replace('@c.us', '')

  try {
    // verificar si el usuario esta autorizado
    const userCheck = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Usuarios!A2:A'
    })

    const authorizedNumbers = (userCheck.data.values || []).flat()

    if (!authorizedNumbers.includes(senderNumber)) {
      await message.reply('🚫 No estás autorizado para usar este bot.')
      console.log(`❌ Acceso denegado para ${senderNumber}`);
      console.log(authorizedNumbers);
      
      return      
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Hoja1!A2:M",
    });

    const rows = response.data.values || [];
    const coincidencias = [];

    for (let row of rows) {
      const producto = (row[0] || "").toLowerCase();
      if (producto.includes(incomingMsg)) {
        const reply = `📦 Producto: ${row[0]}\n💳 Precio Lista: *${row[1]}*\n💰 PSVP: *${row[2]}*\n💳 Precio Preferencial: *${row[3]}*\n3 Cuotas: *${row[4]}*\n6 Cuotas: *${row[5]}*\n9 Cuotas: *${row[6]}*\n10 Cuotas: *${row[7]}*\n12 Cuotas: *${row[8]}*\n14 Cuotas: *${row[9]}*\n18 Cuotas: *${row[10]}*`;
        coincidencias.push({ producto: row[0], texto: reply });
      }
    }

    if (coincidencias.length === 0) {
      await message.reply("❌ Producto no encontrado. Por favor, intentá con otro nombre.");
    } else if (coincidencias.length === 1) {
      await message.reply(coincidencias[0].texto);
    } else if (coincidencias.length <= 5) {
      const respuestas = coincidencias.map(c => c.texto);
      await message.reply(respuestas.join("\n\n"));
    } else {
      // Muestra solo los nombres
      const nombres = coincidencias.slice(0, 10).map(c => `🔸 ${c.producto}`);
      await message.reply(`🔎 Encontré *${coincidencias.length}* coincidencias:\n\n${nombres.join("\n")}\n\n📌 Escribí el nombre más completo para filtrar mejor.`);
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    await message.reply("⚠️ Hubo un error al buscar el producto. Intentalo de nuevo más tarde.");
  }
});

client.initialize();
