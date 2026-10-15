export const botApi = {
  // Verificar y registrar usuario al abrir la Mini App
  async verifyUser(user) {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user })
      });
      return await response.json();
    } catch (error) {
      console.error("Error en botApi.verifyUser:", error);
      throw error;
    }
  },

  // Crear un plan de rendimiento (5% diario por 40 días)
  async createPlan(userId, amount) {
    try {
      const response = await fetch('/api/plans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount })
      });
      return await response.json();
    } catch (error) {
      console.error("Error en botApi.createPlan:", error);
      throw error;
    }
  },

  // Reinvertir saldo en un nuevo plan (hasta 3 veces)
  async reinvest(userId, parentPlanId, amount) {
    try {
      const response = await fetch('/api/plans/reinvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, parentPlanId, amount })
      });
      return await response.json();
    } catch (error) {
      console.error("Error en botApi.reinvest:", error);
      throw error;
    }
  },

  // Solicitar retiro (USDT BEP-20 o GRAM TON)
  async requestWithdraw(userId, currency, address, amount) {
    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currency, address, amount })
      });
      return await response.json();
    } catch (error) {
      console.error("Error en botApi.requestWithdraw:", error);
      throw error;
    }
  }
};
