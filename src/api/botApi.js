export const botApi = {
  
  // 1. Función para pedirle al backend de Vercel que genere la billetera de depósito
  generateDepositWallet: async (userId, network) => {
    try {
      const response = await fetch('/api/generateWallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, network })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error contactando al servidor:", error);
      return { success: false };
    }
  },

  // 2. Función para ejecutar un retiro automático real en la blockchain
  processAutoWithdraw: async (userId, network, address, amount) => {
    try {
      const response = await fetch('/api/autoWithdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, network, address, amount })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error contactando al servidor:", error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  // 3. Función para enviar un ticket de soporte al Admin por Telegram
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
  }
  
};
