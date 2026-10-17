import React, { useState } from 'react';
import { s } from '../styles/appStyles';
import { botApi } from '../api/botApi';
import toast from 'react-hot-toast';
import WebApp from '@twa-dev/sdk';

export default function PortfolioView({ userData, activePlans, onUpdate }) {
  // Sub-navegación dentro de Portafolio
  const [activeSection, setActiveSection] = useState('plans'); // 'plans', 'invest', 'withdraw'
  
  // Estados para formularios
  const [amount, setAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDT');
  const [isLoading, setIsLoading] = useState(false);

  // --- LÓGICA: CREAR PLAN ---
  const handleInvest = async (e) => {
    e.preventDefault();
    const investAmount = parseFloat(amount);
    
    if (isNaN(investAmount) || investAmount < 1) return toast.error('Mínimo 1 USDT');
    if (investAmount > userData?.balance) return toast.error('Saldo insuficiente');

    setIsLoading(true);
    const toastId = toast.loading('Activando plan...');
    try {
      const res = await botApi.createPlan(userData.id, investAmount);
      if (res.success) {
        toast.success('Plan activado con éxito', { id: toastId });
        WebApp.HapticFeedback.notificationOccurred('success');
        setAmount('');
        setActiveSection('plans');
        if (onUpdate) onUpdate(); // Refresca los datos en App.jsx
      } else {
        toast.error(res.error, { id: toastId });
      }
    } catch (err) {
      toast.error('Error de conexión', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA: REINVERTIR ---
  const handleReinvest = async (planId, currentCapital) => {
    const reinvestAmount = parseFloat(prompt(`Monto a reinvertir (Mínimo ${currentCapital} USDT):`, currentCapital));
    if (isNaN(reinvestAmount) || reinvestAmount < currentCapital) {
      return toast.error(`Debe ser igual o mayor a ${currentCapital} USDT`);
    }

    const toastId = toast.loading('Procesando reinversión...');
    try {
      const res = await botApi.reinvest(userData.id, planId, reinvestAmount);
      if (res.success) {
        toast.success('Reinversión exitosa', { id: toastId });
        WebApp.HapticFeedback.notificationOccurred('success');
        if (onUpdate) onUpdate();
      } else {
        toast.error(res.error, { id: toastId });
      }
    } catch (err) {
      toast.error('Error de conexión', { id: toastId });
    }
  };

  // --- LÓGICA: RETIRAR ---
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const wAmount = parseFloat(amount);
    
    if (!withdrawAddress.trim()) return toast.error('Ingresa una dirección válida');
    if (isNaN(wAmount) || wAmount < 1) return toast.error('Mínimo 1 USDT');
    if (wAmount > userData?.balance) return toast.error('Saldo insuficiente');

    setIsLoading(true);
    const toastId = toast.loading('Procesando retiro...');
    try {
      const res = await botApi.requestWithdraw(userData.id, withdrawCurrency, withdrawAddress, wAmount);
      if (res.success) {
        toast.success(`Retiro en proceso. Neto: ${res.details.net}`, { id: toastId });
        WebApp.HapticFeedback.notificationOccurred('success');
        setAmount('');
        setWithdrawAddress('');
        if (onUpdate) onUpdate();
      } else {
        toast.error(res.error, { id: toastId });
      }
    } catch (err) {
      toast.error('Error de conexión', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ ...s.h1, marginBottom: '16px' }}>Portafolio</h2>

      {/* Tarjeta de Saldo Disponible */}
      <div style={{ ...s.card, background: 'linear-gradient(135deg, #111C2E 0%, #0B1220 100%)', border: '1px solid #2DD4BF' }}>
        <p style={{ ...s.textMuted, color: '#2DD4BF', fontWeight: 'bold', margin: '0 0 8px 0' }}>SALDO DISPONIBLE</p>
        <h2 style={{ fontSize: '28px', margin: 0, color: '#F1F5F9' }}>
          ${Number(userData?.balance || 0).toFixed(4)} <span style={{ fontSize: '14px', color: '#94A3B8' }}>USDT</span>
        </h2>
      </div>

      {/* Selector de Acción (Tabs internos) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', backgroundColor: '#111C2E', padding: '6px', borderRadius: '14px' }}>
        <button 
          onClick={() => setActiveSection('plans')} 
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', transition: '0.2s', backgroundColor: activeSection === 'plans' ? '#243247' : 'transparent', color: activeSection === 'plans' ? '#F1F5F9' : '#94A3B8' }}
        >
          Activos
        </button>
        <button 
          onClick={() => setActiveSection('invest')} 
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', transition: '0.2s', backgroundColor: activeSection === 'invest' ? '#2DD4BF' : 'transparent', color: activeSection === 'invest' ? '#0B1220' : '#94A3B8' }}
        >
          Invertir
        </button>
        <button 
          onClick={() => setActiveSection('withdraw')} 
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', transition: '0.2s', backgroundColor: activeSection === 'withdraw' ? '#243247' : 'transparent', color: activeSection === 'withdraw' ? '#F1F5F9' : '#94A3B8' }}
        >
          Retirar
        </button>
      </div>

      {/* SECCIÓN: MIS PLANES */}
      {activeSection === 'plans' && (
        <div className="fade-in">
          {activePlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p style={s.textMuted}>No hay capital trabajando.</p>
              <button style={{ ...s.btnOutline, marginTop: '10px', width: 'auto' }} onClick={() => setActiveSection('invest')}>Comenzar a Invertir</button>
            </div>
          ) : (
            activePlans.map((plan) => {
              const progressPercent = (plan.days_elapsed / 40) * 100;
              return (
                <div key={plan.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 'bold', color: '#F1F5F9' }}>Plan Yield 5%</span>
                    <span style={s.textPremium}>{plan.status}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px 0' }}>CAPITAL</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#F1F5F9' }}>${plan.capital_usdt}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px 0' }}>GANANCIA DIARIA</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#22C55E' }}>+${plan.daily_return_usdt}</p>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '6px' }}>
                      <span>Día {plan.days_elapsed} de 40</span>
                      <span>Reinversiones: {plan.reinvestment_count}/3</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#243247', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPercent}%`, backgroundColor: '#2DD4BF', height: '100%', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  {plan.reinvestment_count < 3 && (
                    <button 
                      onClick={() => handleReinvest(plan.id, plan.capital_usdt)} 
                      style={{ ...s.btnOutline, marginTop: '16px', padding: '10px', fontSize: '12px' }}
                    >
                      🔄 REINVERTIR CAPITAL
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SECCIÓN: INVERTIR (CREAR PLAN) */}
      {activeSection === 'invest' && (
        <div className="fade-in" style={s.card}>
          <h3 style={s.h3}>Nuevo Plan de Rendimiento</h3>
          <p style={s.textMuted}>Genera un 5% diario fijo durante 40 días. El capital inicial queda bloqueado en el pool de liquidez.</p>
          
          <form onSubmit={handleInvest} style={{ marginTop: '20px' }}>
            <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>MONTO A INVERTIR (USDT)</label>
            <input 
              type="number" 
              step="0.01" 
              min="1" 
              style={s.input} 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="Ej: 50.00"
              required
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#0B1220', padding: '12px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #243247' }}>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>Retorno Estimado Total:</span>
              <span style={{ fontWeight: 'bold', color: '#22C55E' }}>${amount ? (parseFloat(amount) * 0.05 * 40).toFixed(2) : '0.00'}</span>
            </div>

            <button type="submit" style={s.btnMain} disabled={isLoading}>
              {isLoading ? 'PROCESANDO...' : 'ACTIVAR PLAN'}
            </button>
          </form>
        </div>
      )}

      {/* SECCIÓN: RETIRAR */}
      {activeSection === 'withdraw' && (
        <div className="fade-in" style={s.card}>
          <h3 style={s.h3}>Solicitar Retiro</h3>
          <p style={s.textMuted}>Comisiones de red en tiempo real. Sin recargos extra.</p>
          
          <form onSubmit={handleWithdraw} style={{ marginTop: '20px' }}>
            <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>RED DE DESTINO</label>
            <select style={s.input} value={withdrawCurrency} onChange={e => setWithdrawCurrency(e.target.value)}>
              <option value="USDT">BNB Smart Chain (BEP-20) - Fee est: 0.30$</option>
              <option value="GRAM">The Open Network (TON) - Fee est: 0.05$</option>
            </select>

            <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold', marginTop: '10px' }}>DIRECCIÓN DE BILLETERA</label>
            <input 
              type="text" 
              style={s.input} 
              placeholder={withdrawCurrency === 'USDT' ? '0x...' : 'EQ... o UQ...'}
              value={withdrawAddress} 
              onChange={e => setWithdrawAddress(e.target.value)} 
              required
            />

            <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold', marginTop: '10px' }}>MONTO A RETIRAR (USDT)</label>
            <input 
              type="number" 
              step="0.01" 
              min="1" 
              style={s.input} 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="Monto"
              required
            />

            <button type="submit" style={{ ...s.btnMain, backgroundColor: '#243247', color: '#F1F5F9' }} disabled={isLoading}>
              {isLoading ? 'VERIFICANDO RED...' : 'CONFIRMAR RETIRO'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
