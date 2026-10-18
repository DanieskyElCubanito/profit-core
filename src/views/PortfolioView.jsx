import React, { useState } from 'react';
import { s } from '../styles/appStyles';
import { botApi } from '../api/botApi';
import toast from 'react-hot-toast';
import WebApp from '@twa-dev/sdk';

const IconCopy = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconQR = () => <svg width="24" height="24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconChevron = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconBack = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

export default function PortfolioView({ userData, activePlans, onUpdate }) {
  const [activeSection, setActiveSection] = useState('deposit'); 

  // Control de red y monto de inversión
  const [showNetworkDrop, setShowNetworkDrop] = useState(false);
  const [depositNetwork, setDepositNetwork] = useState('BSC');
  const [investmentAmount, setInvestmentAmount] = useState('');

  // Estados del flujo de la billetera
  const [showWalletStep, setShowWalletStep] = useState(false);
  const [depositWallet, setDepositWallet] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const safeHaptic = (style = 'medium') => {
    try { if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred(style); } catch (e) {}
  };

  // Cálculos dinámicos de rendimiento (Basado en 5% diario)
  const amountNum = parseFloat(investmentAmount) || 0;
  const yieldDaily = (amountNum * 0.05).toFixed(2);
  const yieldWeekly = (amountNum * 0.35).toFixed(2);
  const yieldMonthly = (amountNum * 1.50).toFixed(2);

  // Generación de Wallet bajo demanda (Solo cuando el usuario da clic)
  const handleGenerateInvestment = async () => {
    if (!investmentAmount || amountNum < 5) {
      safeHaptic('error');
      return toast.error('El mínimo de inversión es 5 USDT', { style: { background: '#111C2E', color: '#F87171' }});
    }

    safeHaptic('heavy');
    setShowWalletStep(true);
    setIsGenerating(true);
    setDepositWallet('');
    
    try {
      const res = await botApi.generateDepositWallet(userData?.id || 'Desconocido', depositNetwork);
      
      if (res && res.success && res.address) {
        setDepositWallet(res.address);
      } else {
        setDepositWallet('Error al generar dirección');
        toast.error('No se pudo conectar con el servidor seguro');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsGenerating(false);
    }
  };

  // Volver a la calculadora
  const handleCancelInvestment = () => {
    safeHaptic('light');
    setShowWalletStep(false);
    setDepositWallet('');
  };

  const handleCopy = (text) => {
    if (isGenerating || !text) return;
    safeHaptic('light');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      toast.success('Billetera copiada', { style: { background: '#2DD4BF', color: '#0B1220' }});
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success('Billetera copiada', { style: { background: '#2DD4BF', color: '#0B1220' }});
    }
  };

  const handleClaim = (planId, pendingYield) => {
    safeHaptic('heavy');
    const toastId = toast.loading('Reclamando rendimientos...');
    setTimeout(() => {
      toast.success(`+${pendingYield} USDT añadidos.`, { id: toastId });
      if (onUpdate) onUpdate();
    }, 1500);
  };

  return (
    <div className="fade-in">
      <h2 style={{ ...s.h1, marginBottom: '16px' }}>Portafolio</h2>

      <div style={{ ...s.card, background: 'linear-gradient(135deg, #111C2E 0%, #0B1220 100%)', border: '1px solid #2DD4BF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ ...s.textMuted, color: '#2DD4BF', fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '11px' }}>BALANCE PRINCIPAL</p>
          <h2 style={{ fontSize: '28px', margin: 0, color: '#F1F5F9' }}>
            ${Number(userData?.balance || 0).toFixed(4)} <span style={{ fontSize: '14px', color: '#94A3B8' }}>USDT</span>
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', backgroundColor: '#111C2E', padding: '6px', borderRadius: '14px' }}>
        <button onClick={() => setActiveSection('plans')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', transition: '0.2s', backgroundColor: activeSection === 'plans' ? '#243247' : 'transparent', color: activeSection === 'plans' ? '#F1F5F9' : '#94A3B8' }}>
          Activos
        </button>
        <button onClick={() => setActiveSection('deposit')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', transition: '0.2s', backgroundColor: activeSection === 'deposit' ? '#2DD4BF' : 'transparent', color: activeSection === 'deposit' ? '#0B1220' : '#94A3B8' }}>
          Invertir
        </button>
        <button onClick={() => setActiveSection('withdraw')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', transition: '0.2s', backgroundColor: activeSection === 'withdraw' ? '#243247' : 'transparent', color: activeSection === 'withdraw' ? '#F1F5F9' : '#94A3B8' }}>
          Retirar
        </button>
      </div>

      {activeSection === 'plans' && (
        <div className="fade-in">
          {activePlans.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '30px 0' }}><p style={s.textMuted}>No tienes fondos trabajando en el pool.</p></div>
          ) : (
            activePlans.map((plan) => {
              const pendingYield = (plan.daily_return_usdt * 1.5).toFixed(2);
              return (
                <div key={plan.id} style={{ ...s.card, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#2DD4BF' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontWeight: 'bold', color: '#F1F5F9' }}>Plan Yield 5%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px 0' }}>CAPITAL</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#F1F5F9', fontSize: '18px' }}>${plan.capital_usdt}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px 0' }}>POR RECLAMAR</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#22C55E', fontSize: '18px' }}>${pendingYield}</p>
                    </div>
                  </div>
                  <button onClick={() => handleClaim(plan.id, pendingYield)} style={s.btnMain}>RECLAMAR</button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- FLUJO DE INVERSIÓN MEJORADO --- */}
      {activeSection === 'deposit' && !showWalletStep && (
        <div className="fade-in" style={s.card}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={s.h3}>Calculadora de Inversión</h3>
            <p style={s.textMuted}>Gana un 5% de rendimiento diario automático.</p>
          </div>

          <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>RED DE PAGO</label>
          <div style={{ position: 'relative', marginBottom: '20px', marginTop: '6px' }}>
            <div 
              onClick={() => setShowNetworkDrop(!showNetworkDrop)}
              style={{ backgroundColor: '#0B1220', border: '1px solid #243247', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#F1F5F9' }}
            >
              <span style={{ fontWeight: 'bold' }}>
                {depositNetwork === 'BSC' ? 'BNB Smart Chain (BEP-20)' : 'The Open Network (TON)'}
              </span>
              <div style={{ transform: showNetworkDrop ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', color: '#94A3B8' }}>
                <IconChevron />
              </div>
            </div>
            
            {showNetworkDrop && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#111C2E', border: '1px solid #2DD4BF', borderRadius: '12px', marginTop: '8px', zIndex: 10, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <div onClick={() => { setDepositNetwork('BSC'); setShowNetworkDrop(false); }} style={{ padding: '14px 16px', borderBottom: '1px solid #243247', cursor: 'pointer', color: depositNetwork === 'BSC' ? '#2DD4BF' : '#F1F5F9', fontWeight: depositNetwork === 'BSC' ? 'bold' : 'normal' }}>BNB Smart Chain (BEP-20)</div>
                <div onClick={() => { setDepositNetwork('TON'); setShowNetworkDrop(false); }} style={{ padding: '14px 16px', cursor: 'pointer', color: depositNetwork === 'TON' ? '#2DD4BF' : '#F1F5F9', fontWeight: depositNetwork === 'TON' ? 'bold' : 'normal' }}>The Open Network (TON)</div>
              </div>
            )}
          </div>

          <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>MONTO A INVERTIR (USDT)</label>
          <div style={{ position: 'relative', marginTop: '6px', marginBottom: '24px' }}>
            <span style={{ position: 'absolute', left: '16px', top: '14px', color: '#94A3B8', fontWeight: 'bold' }}>$</span>
            <input 
              type="number" 
              style={{ ...s.input, paddingLeft: '32px', fontSize: '18px', fontWeight: 'bold' }} 
              placeholder="0.00" 
              value={investmentAmount} 
              onChange={e => setInvestmentAmount(e.target.value)} 
            />
          </div>

          {/* Proyección de Ganancias */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#111C2E', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #243247' }}>
              <p style={{ fontSize: '10px', color: '#94A3B8', margin: '0 0 4px 0', fontWeight: 'bold' }}>24 HORAS</p>
              <p style={{ margin: 0, color: '#22C55E', fontWeight: 'bold', fontSize: '14px' }}>+${yieldDaily}</p>
            </div>
            <div style={{ backgroundColor: '#111C2E', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #243247' }}>
              <p style={{ fontSize: '10px', color: '#94A3B8', margin: '0 0 4px 0', fontWeight: 'bold' }}>7 DÍAS</p>
              <p style={{ margin: 0, color: '#22C55E', fontWeight: 'bold', fontSize: '14px' }}>+${yieldWeekly}</p>
            </div>
            <div style={{ backgroundColor: '#111C2E', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid rgba(45, 212, 191, 0.4)' }}>
              <p style={{ fontSize: '10px', color: '#2DD4BF', margin: '0 0 4px 0', fontWeight: 'bold' }}>30 DÍAS</p>
              <p style={{ margin: 0, color: '#22C55E', fontWeight: 'bold', fontSize: '14px' }}>+${yieldMonthly}</p>
            </div>
          </div>

          <button onClick={handleGenerateInvestment} style={{ ...s.btnMain, boxShadow: '0 0 15px rgba(45, 212, 191, 0.3)' }}>
            GENERAR ORDEN DE INVERSIÓN
          </button>
        </div>
      )}

      {/* --- PASO 2: MOSTRAR BILLETERA GENERADA --- */}
      {activeSection === 'deposit' && showWalletStep && (
        <div className="fade-in" style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={handleCancelInvestment} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}>
              <IconBack />
            </button>
            <h3 style={{ ...s.h3, margin: '0 auto', paddingRight: '20px' }}>Realizar Pago</h3>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 4px 0' }}>Enviando inversión de:</p>
            <h2 style={{ margin: 0, color: '#F1F5F9', fontSize: '32px' }}>${amountNum.toFixed(2)} <span style={{fontSize: '16px', color: '#2DD4BF'}}>USDT</span></h2>
          </div>

          <div style={{ backgroundColor: '#0B1220', border: '1px dashed #2DD4BF', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F1F5F9', borderRadius: '12px', marginBottom: '16px' }}><IconQR /></div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#94A3B8', letterSpacing: '1px' }}>ENVÍA SOLO USDT ({depositNetwork}) A ESTA DIRECCIÓN</p>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#111C2E', border: '1px solid #2DD4BF', borderRadius: '8px', padding: '12px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ flex: 1, fontSize: '13px', color: isGenerating ? '#94A3B8' : '#F1F5F9', fontFamily: 'monospace', wordBreak: 'break-all', paddingRight: '10px', lineHeight: '1.4' }}>
                {isGenerating ? 'Generando canal de pago seguro...' : depositWallet}
              </div>
              <button 
                onClick={() => handleCopy(depositWallet)} 
                disabled={isGenerating}
                style={{ background: 'none', border: 'none', color: isGenerating ? '#243247' : '#2DD4BF', cursor: isGenerating ? 'not-allowed' : 'pointer', padding: '4px' }}
              >
                <IconCopy />
              </button>
            </div>
          </div>

          <button onClick={() => { safeHaptic('heavy'); toast.success('Buscando pago en la red...'); }} disabled={isGenerating} style={{ ...s.btnMain, opacity: isGenerating ? 0.5 : 1 }}>
            YA REALICÉ EL DEPÓSITO
          </button>
        </div>
      )}

      {activeSection === 'withdraw' && (
        <div className="fade-in" style={s.card}>
          <h3 style={s.h3}>Solicitar Retiro</h3>
          <form style={{ marginTop: '20px' }}>
            <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>DIRECCIÓN DE BILLETERA</label>
            <input type="text" style={s.input} placeholder="0x... o EQ..." value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />

            <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold', marginTop: '10px' }}>MONTO A RETIRAR (USDT)</label>
            <input type="number" style={s.input} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Monto" />

            <button type="button" style={{ ...s.btnMain, backgroundColor: '#243247', color: '#F1F5F9' }}>CONFIRMAR RETIRO</button>
          </form>
        </div>
      )}
    </div>
  );
}
