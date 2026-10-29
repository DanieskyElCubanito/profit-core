import React, { useState } from 'react';
import { s } from '../styles/appStyles';
import { botApi } from '../api/botApi';
import toast from 'react-hot-toast';
import WebApp from '@twa-dev/sdk';

const IconCopy = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconQR = () => <svg width="24" height="24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconChevron = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconBack = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

// --- CONFIGURACIÓN DE PLANES GAMIFICADOS (Luego se podrán cargar de la BD) ---
const PLANS = [
  { id: 'starter', name: 'Starter', icon: '🥉', yield: 0.03, min: 5, color: '#CD7F32' },
  { id: 'pro', name: 'Pro', icon: '🥈', yield: 0.05, min: 100, color: '#94A3B8' },
  { id: 'whale', name: 'Whale', icon: '🥇', yield: 0.07, min: 1000, color: '#EAB308' }
];

const translations = {
  es: {
    portfolio: "Portafolio",
    balance: "BALANCE DISPONIBLE",
    assets: "Activos",
    invest: "Invertir",
    withdraw: "Retirar",
    noFunds: "No tienes fondos trabajando en el pool.",
    capital: "CAPITAL",
    toClaim: "POR RECLAMAR",
    claimBtn: "RECLAMAR",
    calcTitle: "Planes de Inversión",
    calcDesc: "Sube de nivel invirtiendo más para desbloquear mejores porcentajes.",
    network: "RED DE PAGO",
    amountInvest: "MONTO A INVERTIR (USDT)",
    h24: "24 HORAS",
    d7: "7 DÍAS",
    d30: "30 DÍAS",
    generateOrder: "GENERAR ORDEN DE INVERSIÓN",
    makePayment: "Realizar Pago",
    sending: "Enviando inversión de:",
    sendOnly: "ENVÍA SOLO USDT",
    toAddress: "A ESTA DIRECCIÓN",
    generating: "Generando canal de pago seguro...",
    alreadyPaid: "YA REALICÉ EL DEPÓSITO",
    withdrawTitle: "Solicitar Retiro",
    withdrawDesc: "Los retiros se envían automáticamente a tu billetera.",
    withdrawNetwork: "RED DE RETIRO",
    walletAddress: "DIRECCIÓN DE BILLETERA",
    amountUsdt: "MONTO (USDT)",
    max: "MÁX:",
    processing: "PROCESANDO RETIRO...",
    confirmWithdraw: "CONFIRMAR RETIRO",
    msgMinInvest: "El mínimo de inversión es 5 USDT",
    msgCopied: "Copiado al portapapeles",
    msgClaiming: "Reclamando rendimientos...",
    msgAdded: "USDT añadidos.",
    msgInvalidWallet: "Ingresa una dirección de billetera válida",
    msgInvalidAmount: "Ingresa un monto válido",
    msgNoFunds: "Fondos insuficientes",
    msgProcessing: "Procesando pago en la blockchain...",
    msgSuccess: "¡Retiro enviado con éxito!",
    msgError: "Error al procesar la solicitud",
    unlocked: "¡NIVEL DESBLOQUEADO!"
  },
  en: {
    portfolio: "Portfolio",
    balance: "AVAILABLE BALANCE",
    assets: "Assets",
    invest: "Invest",
    withdraw: "Withdraw",
    noFunds: "You have no funds working in the pool.",
    capital: "CAPITAL",
    toClaim: "UNCLAIMED",
    claimBtn: "CLAIM",
    calcTitle: "Investment Plans",
    calcDesc: "Level up by investing more to unlock better yields.",
    network: "PAYMENT NETWORK",
    amountInvest: "AMOUNT TO INVEST (USDT)",
    h24: "24 HOURS",
    d7: "7 DAYS",
    d30: "30 DAYS",
    generateOrder: "GENERATE INVESTMENT ORDER",
    makePayment: "Make Payment",
    sending: "Sending investment of:",
    sendOnly: "SEND ONLY USDT",
    toAddress: "TO THIS ADDRESS",
    generating: "Generating secure payment channel...",
    alreadyPaid: "I HAVE MADE THE DEPOSIT",
    withdrawTitle: "Request Withdrawal",
    withdrawDesc: "Withdrawals are sent automatically to your wallet.",
    withdrawNetwork: "WITHDRAWAL NETWORK",
    walletAddress: "WALLET ADDRESS",
    amountUsdt: "AMOUNT (USDT)",
    max: "MAX:",
    processing: "PROCESSING WITHDRAWAL...",
    confirmWithdraw: "CONFIRM WITHDRAWAL",
    msgMinInvest: "Minimum investment is 5 USDT",
    msgCopied: "Copied to clipboard",
    msgClaiming: "Claiming yields...",
    msgAdded: "USDT added.",
    msgInvalidWallet: "Enter a valid wallet address",
    msgInvalidAmount: "Enter a valid amount",
    msgNoFunds: "Insufficient funds",
    msgProcessing: "Processing payment on blockchain...",
    msgSuccess: "Withdrawal sent successfully!",
    msgError: "Error processing request",
    unlocked: "LEVEL UNLOCKED!"
  }
};

export default function PortfolioView({ userData, activePlans, onUpdate }) {
  const userLang = WebApp.initDataUnsafe?.user?.language_code === 'en' ? 'en' : 'es';
  const t = translations[userLang];

  const [activeSection, setActiveSection] = useState('deposit'); 

  // Estados
  const [showNetworkDrop, setShowNetworkDrop] = useState(false);
  const [depositNetwork, setDepositNetwork] = useState('BSC');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showWalletStep, setShowWalletStep] = useState(false);
  const [depositWallet, setDepositWallet] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [showWithdrawNetworkDrop, setShowWithdrawNetworkDrop] = useState(false);
  const [withdrawNetwork, setWithdrawNetwork] = useState('BSC');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const safeHaptic = (style = 'medium') => {
    try { if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred(style); } catch (e) {}
  };

  // --- LÓGICA DE GAMIFICACIÓN (Auto-selección de Nivel) ---
  const amountNum = parseFloat(investmentAmount) || 0;
  
  // Buscar el plan más alto que el usuario califica (recorremos de mayor a menor)
  const currentPlan = PLANS.slice().reverse().find(p => amountNum >= p.min) || PLANS[0];

  const yieldDaily = (amountNum * currentPlan.yield).toFixed(2);
  const yieldWeekly = (amountNum * currentPlan.yield * 7).toFixed(2);
  const yieldMonthly = (amountNum * currentPlan.yield * 30).toFixed(2);

  const handleGenerateInvestment = async () => {
    if (!investmentAmount || amountNum < PLANS[0].min) {
      safeHaptic('error');
      return toast.error(t.msgMinInvest, { style: { background: '#111C2E', color: '#F87171' }});
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
        setDepositWallet('Error');
        toast.error(t.msgError);
      }
    } catch (error) {
      toast.error(t.msgError);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClaim = (planId, pendingYield) => {
    safeHaptic('heavy');
    const toastId = toast.loading(t.msgClaiming);
    setTimeout(() => {
      toast.success(`+${pendingYield} ${t.msgAdded}`, { id: toastId });
      if (onUpdate) onUpdate();
    }, 1500);
  };

  const handleRequestWithdraw = async () => {
    const amountToWithdraw = parseFloat(withdrawAmount);
    const userBalance = parseFloat(userData?.balance || 0);

    if (!withdrawAddress || withdrawAddress.length < 10) return toast.error(t.msgInvalidWallet);
    if (!withdrawAmount || amountToWithdraw <= 0) return toast.error(t.msgInvalidAmount);
    if (amountToWithdraw > userBalance) return toast.error(t.msgNoFunds);

    safeHaptic('heavy');
    setIsWithdrawing(true);
    const toastId = toast.loading(t.msgProcessing);

    try {
      const res = await botApi.processAutoWithdraw(userData?.id, withdrawNetwork, withdrawAddress, amountToWithdraw);
      if (res && res.success) {
        toast.success(t.msgSuccess, { id: toastId });
        setWithdrawAmount('');
        setWithdrawAddress('');
        if (onUpdate) onUpdate(); 
      } else {
        toast.error(`${t.msgError}: ${res.error || ''}`, { id: toastId });
      }
    } catch (error) {
      toast.error(t.msgError, { id: toastId });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ ...s.h1, marginBottom: '16px' }}>{t.portfolio}</h2>

      <div style={{ ...s.card, background: 'linear-gradient(135deg, #111C2E 0%, #0B1220 100%)', border: `1px solid ${currentPlan.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.3s' }}>
        <div>
          <p style={{ ...s.textMuted, color: currentPlan.color, fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '11px', transition: 'color 0.3s' }}>{t.balance}</p>
          <h2 style={{ fontSize: '28px', margin: 0, color: '#F1F5F9' }}>
            ${Number(userData?.balance || 0).toFixed(4)} <span style={{ fontSize: '14px', color: '#94A3B8' }}>USDT</span>
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', backgroundColor: '#111C2E', padding: '6px', borderRadius: '14px' }}>
        <button onClick={() => setActiveSection('plans')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', transition: '0.2s', backgroundColor: activeSection === 'plans' ? '#243247' : 'transparent', color: activeSection === 'plans' ? '#F1F5F9' : '#94A3B8' }}>{t.assets}</button>
        <button onClick={() => setActiveSection('deposit')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', transition: '0.2s', backgroundColor: activeSection === 'deposit' ? '#2DD4BF' : 'transparent', color: activeSection === 'deposit' ? '#0B1220' : '#94A3B8' }}>{t.invest}</button>
        <button onClick={() => setActiveSection('withdraw')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', transition: '0.2s', backgroundColor: activeSection === 'withdraw' ? '#243247' : 'transparent', color: activeSection === 'withdraw' ? '#F1F5F9' : '#94A3B8' }}>{t.withdraw}</button>
      </div>

      {/* --- INVERSIÓN DINÁMICA --- */}
      {activeSection === 'deposit' && !showWalletStep && (
        <div className="fade-in" style={{...s.card, border: `1px solid ${currentPlan.color}40`}}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h3 style={s.h3}>{t.calcTitle}</h3>
            <p style={s.textMuted}>{t.calcDesc}</p>
          </div>

          {/* BARRA DE NIVELES GAMIFICADA */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {PLANS.map(plan => (
              <div key={plan.id} style={{ flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: '12px', backgroundColor: currentPlan.id === plan.id ? `${plan.color}20` : '#111C2E', border: `1px solid ${currentPlan.id === plan.id ? plan.color : '#243247'}`, opacity: currentPlan.id === plan.id ? 1 : 0.6, transition: '0.3s' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{plan.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: currentPlan.id === plan.id ? plan.color : '#94A3B8' }}>{plan.name}</div>
                <div style={{ fontSize: '10px', color: '#F1F5F9' }}>{(plan.yield * 100).toFixed(0)}% /día</div>
                <div style={{ fontSize: '9px', color: '#64748B', marginTop: '4px' }}>Min ${plan.min}</div>
              </div>
            ))}
          </div>

          <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>{t.network}</label>
          <div style={{ position: 'relative', marginBottom: '20px', marginTop: '6px' }}>
            <div onClick={() => setShowNetworkDrop(!showNetworkDrop)} style={{ backgroundColor: '#0B1220', border: '1px solid #243247', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#F1F5F9' }}>
              <span style={{ fontWeight: 'bold' }}>{depositNetwork === 'BSC' ? 'BNB Smart Chain (BEP-20)' : 'The Open Network (TON)'}</span>
              <div style={{ transform: showNetworkDrop ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', color: '#94A3B8' }}><IconChevron /></div>
            </div>
            {showNetworkDrop && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#111C2E', border: '1px solid #2DD4BF', borderRadius: '12px', marginTop: '8px', zIndex: 10, overflow: 'hidden' }}>
                <div onClick={() => { setDepositNetwork('BSC'); setShowNetworkDrop(false); }} style={{ padding: '14px 16px', borderBottom: '1px solid #243247', cursor: 'pointer', color: '#F1F5F9' }}>BNB Smart Chain (BEP-20)</div>
                <div onClick={() => { setDepositNetwork('TON'); setShowNetworkDrop(false); }} style={{ padding: '14px 16px', cursor: 'pointer', color: '#F1F5F9' }}>The Open Network (TON)</div>
              </div>
            )}
          </div>

          <label style={{ fontSize: '12px', color: currentPlan.color, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>{t.amountInvest}</span>
            {amountNum > 0 && <span style={{fontSize: '10px'}}>{t.unlocked} {currentPlan.name}</span>}
          </label>
          <div style={{ position: 'relative', marginTop: '6px', marginBottom: '24px' }}>
            <span style={{ position: 'absolute', left: '16px', top: '14px', color: '#94A3B8', fontWeight: 'bold' }}>$</span>
            <input type="number" style={{ ...s.input, paddingLeft: '32px', fontSize: '18px', fontWeight: 'bold', borderColor: currentPlan.color }} placeholder={`Mínimo ${PLANS[0].min}`} value={investmentAmount} onChange={e => setInvestmentAmount(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#111C2E', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #243247' }}>
              <p style={{ fontSize: '10px', color: '#94A3B8', margin: '0 0 4px 0', fontWeight: 'bold' }}>{t.h24}</p>
              <p style={{ margin: 0, color: currentPlan.color, fontWeight: 'bold', fontSize: '14px' }}>+${yieldDaily}</p>
            </div>
            <div style={{ backgroundColor: '#111C2E', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #243247' }}>
              <p style={{ fontSize: '10px', color: '#94A3B8', margin: '0 0 4px 0', fontWeight: 'bold' }}>{t.d7}</p>
              <p style={{ margin: 0, color: currentPlan.color, fontWeight: 'bold', fontSize: '14px' }}>+${yieldWeekly}</p>
            </div>
            <div style={{ backgroundColor: '#111C2E', borderRadius: '10px', padding: '12px', textAlign: 'center', border: `1px solid ${currentPlan.color}80` }}>
              <p style={{ fontSize: '10px', color: currentPlan.color, margin: '0 0 4px 0', fontWeight: 'bold' }}>{t.d30}</p>
              <p style={{ margin: 0, color: currentPlan.color, fontWeight: 'bold', fontSize: '14px' }}>+${yieldMonthly}</p>
            </div>
          </div>

          <button onClick={handleGenerateInvestment} style={{ ...s.btnMain, backgroundColor: currentPlan.color, color: '#0B1220', boxShadow: `0 0 15px ${currentPlan.color}40` }}>
            {t.generateOrder}
          </button>
        </div>
      )}

      {/* RESTO DE SECCIONES (Paso 2 depósito, Retiros, Mis Planes) se mantienen igual en estructura gráfica */}
      {activeSection === 'deposit' && showWalletStep && (
        <div className="fade-in" style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={() => { safeHaptic('light'); setShowWalletStep(false); }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}><IconBack /></button>
            <h3 style={{ ...s.h3, margin: '0 auto', paddingRight: '20px' }}>{t.makePayment}</h3>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 4px 0' }}>{t.sending}</p>
            <h2 style={{ margin: 0, color: '#F1F5F9', fontSize: '32px' }}>${amountNum.toFixed(2)} <span style={{fontSize: '16px', color: currentPlan.color}}>USDT</span></h2>
            <span style={{ fontSize: '12px', color: currentPlan.color, fontWeight: 'bold' }}>Nivel: {currentPlan.name} {currentPlan.icon}</span>
          </div>
          <div style={{ backgroundColor: '#0B1220', border: `1px dashed ${currentPlan.color}`, borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F1F5F9', borderRadius: '12px', marginBottom: '16px' }}><IconQR /></div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#94A3B8', letterSpacing: '1px', textAlign: 'center' }}>{t.sendOnly} ({depositNetwork}) {t.toAddress}</p>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#111C2E', border: `1px solid ${currentPlan.color}`, borderRadius: '8px', padding: '12px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ flex: 1, fontSize: '13px', color: isGenerating ? '#94A3B8' : '#F1F5F9', fontFamily: 'monospace', wordBreak: 'break-all', paddingRight: '10px' }}>{isGenerating ? t.generating : depositWallet}</div>
              <button onClick={() => { if(navigator?.clipboard?.writeText) { navigator.clipboard.writeText(depositWallet); toast.success(t.msgCopied); } }} disabled={isGenerating} style={{ background: 'none', border: 'none', color: isGenerating ? '#243247' : currentPlan.color, cursor: isGenerating ? 'not-allowed' : 'pointer', padding: '4px' }}><IconCopy /></button>
            </div>
          </div>
          <button onClick={() => { safeHaptic('heavy'); toast.success(t.msgProcessing); }} disabled={isGenerating} style={{ ...s.btnMain, backgroundColor: currentPlan.color, opacity: isGenerating ? 0.5 : 1 }}>{t.alreadyPaid}</button>
        </div>
      )}

      {activeSection === 'plans' && (
        <div className="fade-in">
          {activePlans.length === 0 ? <div style={{ textAlign: 'center', padding: '30px 0' }}><p style={s.textMuted}>{t.noFunds}</p></div> : 
            activePlans.map((plan) => {
              const pendingYield = (plan.capital_usdt * 0.05).toFixed(2); // Ejemplo temporal
              return (
                <div key={plan.id} style={{ ...s.card, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#2DD4BF' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><span style={{ fontWeight: 'bold', color: '#F1F5F9' }}>Plan Activo</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div><p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px 0' }}>{t.capital}</p><p style={{ margin: 0, fontWeight: 'bold', color: '#F1F5F9', fontSize: '18px' }}>${plan.capital_usdt}</p></div>
                    <div style={{ textAlign: 'right' }}><p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px 0' }}>{t.toClaim}</p><p style={{ margin: 0, fontWeight: 'bold', color: '#22C55E', fontSize: '18px' }}>${pendingYield}</p></div>
                  </div>
                  <button onClick={() => handleClaim(plan.id, pendingYield)} style={s.btnMain}>{t.claimBtn}</button>
                </div>
              );
            })
          }
        </div>
      )}

      {activeSection === 'withdraw' && (
        <div className="fade-in" style={s.card}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}><h3 style={s.h3}>{t.withdrawTitle}</h3><p style={s.textMuted}>{t.withdrawDesc}</p></div>
          <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>{t.withdrawNetwork}</label>
          <div style={{ position: 'relative', marginBottom: '20px', marginTop: '6px' }}>
            <div onClick={() => setShowWithdrawNetworkDrop(!showWithdrawNetworkDrop)} style={{ backgroundColor: '#0B1220', border: '1px solid #243247', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#F1F5F9' }}>
              <span style={{ fontWeight: 'bold' }}>{withdrawNetwork === 'BSC' ? 'BNB Smart Chain (BEP-20)' : 'The Open Network (TON)'}</span>
              <div style={{ transform: showWithdrawNetworkDrop ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', color: '#94A3B8' }}><IconChevron /></div>
            </div>
            {showWithdrawNetworkDrop && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#111C2E', border: '1px solid #2DD4BF', borderRadius: '12px', marginTop: '8px', zIndex: 10, overflow: 'hidden' }}>
                <div onClick={() => { setWithdrawNetwork('BSC'); setShowWithdrawNetworkDrop(false); }} style={{ padding: '14px 16px', borderBottom: '1px solid #243247', cursor: 'pointer', color: '#F1F5F9' }}>BNB Smart Chain (BEP-20)</div>
                <div onClick={() => { setWithdrawNetwork('TON'); setShowWithdrawNetworkDrop(false); }} style={{ padding: '14px 16px', cursor: 'pointer', color: '#F1F5F9' }}>The Open Network (TON)</div>
              </div>
            )}
          </div>
          <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>{t.walletAddress}</label>
          <input type="text" style={s.input} placeholder={withdrawNetwork === 'BSC' ? 'Ej: 0x...' : 'Ej: EQ...'} value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
            <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>{t.amountUsdt}</label>
            <span style={{ fontSize: '11px', color: '#2DD4BF', cursor: 'pointer' }} onClick={() => setWithdrawAmount(userData?.balance || '0')}>{t.max} ${Number(userData?.balance || 0).toFixed(2)}</span>
          </div>
          <div style={{ position: 'relative', marginTop: '6px', marginBottom: '24px' }}>
            <span style={{ position: 'absolute', left: '16px', top: '14px', color: '#94A3B8', fontWeight: 'bold' }}>$</span>
            <input type="number" style={{ ...s.input, paddingLeft: '32px' }} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00" />
          </div>
          <button type="button" onClick={handleRequestWithdraw} disabled={isWithdrawing} style={{ ...s.btnMain, opacity: isWithdrawing ? 0.7 : 1 }}>{isWithdrawing ? t.processing : t.confirmWithdraw}</button>
        </div>
      )}
    </div>
  );
}
