// --- CONFIGURACIÓN DE TU BOT ---
const BOT_TOKEN = "8717597733:AAFD50K9ZWFSHim6OwYAOTVI2lSA0hs11Ig"; 
const ADMIN_ID = "8968109534"; 

export default async function handler(req, res) {
  // CORS para Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { userId, username, category, message } = req.body;

    // Formato del mensaje que te llegará a Telegram
    const text = `🛠 *NUEVO TICKET DE SOPORTE* 🛠\n\n👤 *Usuario ID:* \`${userId}\` (@${username || 'SinUsuario'})\n📂 *Categoría:* ${category}\n📝 *Mensaje:*\n_${message}_\n\n💬 _Búscalo en Telegram por su @usuario para responderle._`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_ID, text: text, parse_mode: 'Markdown' })
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
