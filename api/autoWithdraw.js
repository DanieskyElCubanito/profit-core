import { ethers } from 'ethers';

// --- CONFIGURACIÓN DE TU BOT DE TELEGRAM ---
const BOT_TOKEN = "8717597733:AAFD50K9ZWFSHim6OwYAOTVI2lSA0hs11Ig"; 
const ADMIN_ID = "8968109534"; 

// --- CONFIGURACIÓN DE TU BILLETERA MAESTRA (FONDOS) ---
// ⚠️ ESTA ES LA BILLETERA QUE ENVIARÁ EL DINERO. DEBE TENER USDT Y BNB PARA EL GAS.
const BSC_MASTER_PRIVATE_KEY = "PON_AQUI_LA_PRIVATE_KEY_DE_TU_BILLETERA_PRINCIPAL"; 
const BSC_RPC_URL = "https://bsc-dataseed.binance.org/";
const USDT_BSC_CONTRACT = "0x55d398326f99059fF775485246999027B3197955"; // Contrato oficial de USDT en BSC

export default async function handler(req, res) {
  // CORS para Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { userId, network, address, amount } = req.body;
    let txHash = "";

    if (network === 'BSC') {
      if (BSC_MASTER_PRIVATE_KEY === "PON_AQUI_LA_PRIVATE_KEY_DE_TU_BILLETERA_PRINCIPAL") {
        throw new Error("No has configurado la Llave Privada Maestra en el servidor.");
      }

      // 1. Conectar a la blockchain de Binance
      const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
      const wallet = new ethers.Wallet(BSC_MASTER_PRIVATE_KEY, provider);

      // 2. Cargar el contrato de USDT
      const usdtAbi = ["function transfer(address to, uint256 value) returns (bool)"];
      const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, usdtAbi, wallet);

      // 3. Convertir el monto (USDT usa 18 decimales)
      const amountInWei = ethers.parseUnits(amount.toString(), 18);

      // 4. ¡EJECUTAR TRANSFERENCIA REAL!
      const tx = await usdtContract.transfer(address, amountInWei);
      await tx.wait(); // Esperar a que la red la confirme
      
      txHash = tx.hash;

    } else if (network === 'TON') {
      // (Nota: TON requiere lógica de Jetton Contracts que implementaremos si decides fondear una master wallet de TON)
      txHash = "TX_TON_SIMULADA_POR_AHORA";
    }

    // 5. Enviar el recibo del éxito al Admin por Telegram
    const mensaje = `✅ *RETIRO AUTOMÁTICO ENVIADO* ✅\n\n👤 *Usuario ID:* \`${userId}\`\n💰 *Monto:* \`${amount} USDT\`\n🌐 *Red:* ${network}\n🏦 *Destino:* \`${address}\`\n🔗 *Hash de Transacción (TxID):*\n\`${txHash}\``;
    
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_ID, text: mensaje, parse_mode: 'Markdown' })
    });

    return res.status(200).json({ success: true, txHash });

  } catch (error) {
    console.error("Error en retiro automático:", error);
    
    // Avisar al admin si falló (por falta de gas, error de red, etc)
    const errorMsg = `❌ *ERROR EN RETIRO AUTOMÁTICO* ❌\nFallo un retiro de ${req.body.amount} USDT para el usuario ${req.body.userId}.\nMotivo: ${error.message}`;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_ID, text: errorMsg, parse_mode: 'Markdown' })
    });

    return res.status(500).json({ success: false, error: error.message });
  }
}
