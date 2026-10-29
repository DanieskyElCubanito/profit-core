const BOT_TOKEN = "8761317222:AAGqOZziDYtZV8Lzo0vHf9ClcT0-mQXeiMA"; // Este SÍ o SÍ debe ir en Vercel
const ADMIN_ID = "8968109534"; // Escrito directo en el código
 

export default async function handler(req, res) {
  res.status(200).send('OK');

  if (req.method !== 'POST') return;

  try {
    const body = req.body;

    // 1. PROCESAR MENSAJES DE TEXTO
    if (body.message) {
      const chatId = body.message.chat.id.toString();
      const text = body.message.text;

      // Seguridad: Ignorar si no es el administrador
      if (chatId !== ADMIN_ID) return;

      // Comando /admin
      if (text === '/admin') {
        const adminMenu = {
          inline_keyboard: [
            [{ text: "⚙️ Configurar Billeteras", callback_data: "admin_wallets" }],
            [{ text: "📊 Planes Gamificados", callback_data: "admin_plans" }],
            [{ text: "⏸️ Pausar Retiros", callback_data: "admin_pause" }, { text: "📈 Estadísticas", callback_data: "admin_stats" }]
          ]
        };

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: "👑 *PANEL DE CONTROL MAESTRO* 👑\n\nSelecciona una opción para administrar la plataforma:",
            parse_mode: 'Markdown',
            reply_markup: adminMenu
          })
        });
      }
    }

    // 2. PROCESAR CLICS EN LOS BOTONES DEL MENÚ
    if (body.callback_query) {
      const chatId = body.callback_query.message.chat.id.toString();
      const action = body.callback_query.data;
      const messageId = body.callback_query.message.message_id;

      if (chatId !== ADMIN_ID) return;

      let responseText = "";

      if (action === 'admin_wallets') responseText = "Bóveda Segura: Envíame la nueva Private Key de la BSC.";
      if (action === 'admin_plans') responseText = "Selecciona el plan a editar: Starter, Pro, o Whale.";
      if (action === 'admin_pause') responseText = "⚠️ Retiros pausados por mantenimiento.";
      if (action === 'admin_stats') responseText = "Usuarios totales activos: 0\nLiquidez: $0 USDT";

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: `*Acción:* ${responseText}`,
          parse_mode: 'Markdown'
        })
      });
    }

  } catch (error) {
    console.error("Error procesando webhook:", error);
  }
}
