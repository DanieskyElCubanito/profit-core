export const botApi = {
  
  // 1. Generar Billetera de Depósito
  generateDepositWallet: async (userId, network) => {
    try {
      const response = await fetch('/api/generateWallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, network })
      });
      return await response.json();
    } catch (error) {
      console.error("Error contactando al servidor:", error);
      return { success: false };
    }
  },

  // 2. Ejecutar Retiro Automático
  processAutoWithdraw: async (userId, network, address, amount) => {
    try {
      const response = await fetch('/api/autoWithdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, network, address, amount })
      });
      return await response.json();
    } catch (error) {
      console.error("Error contactando al servidor:", error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  // 3. Enviar ticket de soporte al Admin por Telegram
  sendSupportTicket: async (userId, username, category, message) => {
    try {
      const response = await fetch('/api/supportTicket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, category, message })
      });
      return await response.json();
    } catch (error) {
      console.error("Error enviando ticket:", error);
      return { success: false };
    }
  },

  // 4. NUEVA FUNCIÓN: Responder al usuario desde el panel Admin
  replyToUser: async (userId, message) => {
    try {
      const response = await fetch('/api/adminReply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message })
      });
      return await response.json();
    } catch (error) {
      console.error("Error enviando respuesta:", error);
      return { success: false };
    }
  }
  
};
