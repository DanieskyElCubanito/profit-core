export const botApi = {
  // Función para pedirle al backend de Vercel que genere la billetera de depósito
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

  // Función para ejecutar un retiro automático real en la blockchain
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
  }
};
