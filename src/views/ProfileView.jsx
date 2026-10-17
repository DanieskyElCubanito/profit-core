import React, { useState } from 'react';
import { s } from '../styles/appStyles';
import { botApi } from '../api/botApi';
import toast from 'react-hot-toast';
import WebApp from '@twa-dev/sdk';

// Íconos SVG para el Portafolio
const IconCopy = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconQR = () => <svg width="24" height="24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;

export default function PortfolioView({ userData, activePlans, onUpdate }) {
  const [activeSection, setActiveSection] = useState('plans'); // 'plans', 'deposit', 'withdraw'
  
  // Estados para formularios
  const [amount, setAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDT');
  const [isLoading, setIsLoading] = useState(false);

  // Dirección estática para el demo de depósito (BSC / BEP-20)
  const depositWalletBSC = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"; 

  // --- LÓGICA: COPIAR AL PORTAPAPELES ---
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    WebApp.HapticFeedback.notificationOccurred('success');
    toast.success('Dirección copiada', { style: { background: '#2DD4BF', color: '#0B1220' }});
  };

  // --- LÓGICA: RECLAMAR GANANCIAS (CLAIM) ---
  const handleClaim = async (planId, pendingYield) => {
    // Aquí simularíamos la llamada a la API para reclamar:
    // await botApi.claimYield(userData.id, planId);
    
    WebApp.HapticFeedback.impactOccurred('heavy');
    const toastId = toast.loading('Reclamando rendimientos...');
    
    setTimeout(() => {
      toast.success(`+${pendingYield} USDT añadidos a tu balance principal.`, { id: toastId });
      WebApp.HapticFeedback.notificationOccurred('success');
      if (onUpdate) onUpdate();
    }, 1500);
  };

  // --- LÓGICA: VERIFICAR DEPÓSITO ---
  const handleVerifyDeposit = () => {
    WebApp.HapticFeedback.impactOccurred('medium');
    const toastId = toast.loading('Buscando transacciones en la red BSC...');
    
    setTimeout(() => {
      toast.error('No se detectaron depósitos nuevos aún. La red puede tardar hasta 3 minutos.', { id: toastId, duration: 4000 });
    }, 3000);
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
      <div style={{ ...s.card, background: 'linear-gradient(135deg, #111C2E 0%, #0B1220 100%)', border: '1px solid #2DD4BF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ ...s.textMuted, color: '#2DD4BF', fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '11px' }}>BALANCE PRINCIPAL</p>
          <h2 style={{ fontSize: '28px', margin: 0, color: '#F1F5F9' }}>
            ${Number(userData?.balance || 0).toFixed(4)} <span style={{ fontSize: '14px', color: '#94A3B8' }}>USDT</span>
          </h2>
        </div>
        {/* Atajo rápido superior */}
        <button onClick={() => setActiveSection('deposit')} style={{ backgroundColor: 'rgba(45, 212, 191, 0.1)', border: '1px solid #2DD4BF', color: '#2DD4BF', borderRadius: '8px', padding: '8px 12px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
          + RECARGAR
        </button>
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
          onClick={() => setActiveSection('deposit')} 
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', transition: '0.2s', backgroundColor: activeSection === 'deposit' ? '#2DD4BF' : 'transparent', color: activeSection === 'deposit' ? '#0B1220' : '#94A3B8' }}
        >
          Depositar
        </button>
        <button 
          onClick={() => setActiveSection('withdraw')} 
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', transition: '0.2s', backgroundColor: activeSection === 'withdraw' ? '#243247' : 'transparent', color: activeSection === 'withdraw' ? '#F1F5F9' : '#94A3B8' }}
        >
          Retirar
        </button>
      </div>

      {/* SECCIÓN: MIS PLANES (Con sistema CLAIM) */}
      {activeSection === 'plans' && (
        <div className="fade-in">
          {activePlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p style={s.textMuted}>No tienes fondos trabajando en el pool.</p>
              <button style={{ ...s.btnOutline, marginTop: '10px', width: 'auto' }} onClick={() => setActiveSection('deposit')}>Añadir Fondos</button>
            </div>
          ) : (
            activePlans.map((plan) => {
              const progressPercent = (plan.days_elapsed / 40) * 100;
              const pendingYield = (plan.daily_return_usdt * 1.5).toFixed(2); // Simulación de ganancia acumulada sin reclamar

              return (
                <div key={plan.id} style={{ ...s.card, position: 'relative', overflow: 'hidden' }}>
                  {/* Etiqueta lateral */}
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#2DD4BF' }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontWeight: 'bold', color: '#F1F5F9' }}>Plan Yield 5%</span>
                    <span style={s.textPremium}>ACTIVO</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px 0' }}>CAPITAL INVERTIDO</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#F1F5F9', fontSize: '18px' }}>${plan.capital_usdt}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px 0' }}>PENDIENTE POR RECLAMAR</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#22C55E', fontSize: '18px' }}>${pendingYield}</p>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '6px' }}>
                      <span>Día {plan.days_elapsed} de 40</span>
                      <span>{progressPercent.toFixed(0)}% Completado</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#243247', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPercent}%`, backgroundColor: '#2DD4BF', height: '100%', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  {/* Botón interactivo de Claim */}
                  <button 
                    onClick={() => handleClaim(plan.id, pendingYield)} 
                    style={{ ...s.btnMain, boxShadow: '0 0 15px rgba(45, 212, 191, 0.3)' }}
                  >
                    RECLAMAR ${pendingYield} USDT
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SECCIÓN: DEPOSITAR (Generador de Billetera BSC) */}
      {activeSection === 'deposit' && (
        <div className="fade-in" style={s.card}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={s.h3}>Depositar USDT</h3>
            <p style={s.textMuted}>Transfiere únicamente a través de la red seleccionada.</p>
          </div>
          
          <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>RED (NETWORK)</label>
          <select style={{ ...s.input, marginBottom: '20px' }}>
            <option value="BSC">BNB Smart Chain (BEP-20)</option>
            <option value="TON">The Open Network (TON)</option>
          </select>

          {/* Caja del Código QR Simulada */}
          <div style={{ backgroundColor: '#0B1220', border: '1px dashed #243247', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F1F5F9', borderRadius: '12px', marginBottom: '16px' }}>
              <IconQR />
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#94A3B8', letterSpacing: '1px' }}>DIRECCIÓN DE DEPÓSITO (BEP-20)</p>
            
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#111C2E', border: '1px solid #2DD4BF', borderRadius: '8px', padding: '10px', width: '100%', boxSizing: 'border-box' }}>
              <span style={{ flex: 1, fontSize: '13px', color: '#F1F5F9', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {depositWalletBSC}
              </span>
              <button onClick={() => handleCopy(depositWalletBSC)} style={{ background: 'none', border: 'none', color: '#2DD4BF', cursor: 'pointer', padding: '4px' }}>
                <IconCopy />
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(214, 181, 109, 0.1)', borderLeft: '3px solid #D6B56D', padding: '12px', borderRadius: '0 8px 8px 0', marginBottom: '24px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#D6B56D' }}>Envía más de 1 USDT. El saldo se acreditará automáticamente tras 15 confirmaciones de la red.</p>
          </div>

          <button onClick={handleVerifyDeposit} style={s.btnMain}>
            YA REALICÉ EL DEPÓSITO
          </button>
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
