import React, { useState, useEffect } from 'react';
import { s } from '../styles/appStyles';
import WebApp from '@twa-dev/sdk';
import toast from 'react-hot-toast';

const translations = {
  es: {
    totalValue: "Valor Total",
    dailyYield: "Rendimiento Diario",
    deposit: "Depositar",
    withdraw: "Retirar",
    dailyRewardTitle: "🎁 Recompensa Diaria",
    dailyRewardDesc: "Reclama tus USDT gratis de hoy por usar la app.",
    claim: "Reclamar Ahora",
    claimed: "Reclamado hoy",
    rankTitle: "Nivel de Inversor",
    bronze: "Bronce",
    silver: "Plata",
    gold: "Oro",
    diamond: "Diamante",
    myAssets: "Mis Activos",
    noAssets: "No tienes activos en este momento.",
    activePlan: "Plan Activo",
    invested: "invertidos",
    recentAct: "Actividad Reciente",
    noAct: "No hay transacciones recientes.",
    msgClaimSuccess: "¡Has reclamado tu recompensa diaria!"
  },
  en: {
    totalValue: "Total Value",
    dailyYield: "Daily Yield",
    deposit: "Deposit",
    withdraw: "Withdraw",
    dailyRewardTitle: "🎁 Daily Reward",
    dailyRewardDesc: "Claim your free USDT today for using the app.",
    claim: "Claim Now",
    claimed: "Claimed today",
    rankTitle: "Investor Rank",
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
    diamond: "Diamond",
    myAssets: "My Assets",
    noAssets: "You have no assets right now.",
    activePlan: "Active Plan",
    invested: "invested",
    recentAct: "Recent Activity",
    noAct: "No recent transactions.",
    msgClaimSuccess: "You have claimed your daily reward!"
  }
};

export default function HomeView({ userData, activePlans, transactions = [], onNavigate }) {
  const userLang = WebApp.initDataUnsafe?.user?.language_code === 'en' ? 'en' : 'es';
  const t = translations[userLang];

  const [hasClaimed, setHasClaimed] = useState(false);

  // Lógica de Recompensa Diaria Temporal (En el futuro se verificará en Supabase)
  useEffect(() => {
    const lastClaim = localStorage.getItem(`daily_claim_${userData?.id}`);
    if (lastClaim && new Date().toDateString() === new Date(parseInt(lastClaim)).toDateString()) {
      setHasClaimed(true);
    }
  }, [userData?.id]);

  const handleClaimDaily = () => {
    if (hasClaimed) return;
    try { if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred('heavy'); } catch (e) {}
    
    toast.success(t.msgClaimSuccess, { style: { background: '#22C55E', color: '#0B1220', fontWeight: 'bold' }});
    setHasClaimed(true);
    localStorage.setItem(`daily_claim_${userData?.id}`, Date.now().toString());
  };

  // Lógica de Niveles Gamificados
  const balance = Number(userData?.balance || 0);
  let rank, nextRank, progress, rankColor;

  if (balance >= 200) {
    rank = t.gold; nextRank = t.diamond; rankColor = '#EAB308'; // Gold
    progress = Math.min(((balance - 200) / 800) * 100, 100); 
  } else if (balance >= 50) {
    rank = t.silver; nextRank = t.gold; rankColor = '#C0C0C0'; // Silver
    progress = ((balance - 50) / 150) * 100;
  } else {
    rank = t.bronze; nextRank = t.silver; rankColor = '#CD7F32'; // Bronze
    progress = (balance / 50) * 100;
  }

  const PortfolioChart = () => (
    <div style={{ margin: '20px 0', position: 'relative', height: '80px', width: '100%' }}>
      <svg viewBox="0 0 300 80" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(45, 212, 191, 0.4)" />
            <stop offset="100%" stopColor="rgba(45, 212, 191, 0)" />
          </linearGradient>
        </defs>
        <path d="M0,60 Q30,40 60,50 T120,30 T180,40 T240,15 T300,5 L300,80 L0,80 Z" fill="url(#glow)" />
        <path d="M0,60 Q30,40 60,50 T120,30 T180,40 T240,15 T300,5" fill="none" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" />
        <circle cx="300" cy="5" r="4" fill="#2DD4BF"><animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" /></circle>
      </svg>
    </div>
  );

  return (
    <div className="fade-in">
      
      {/* 1. SECCIÓN PRINCIPAL: BALANCE Y GRÁFICO */}
      <div style={{ ...s.card, position: 'relative', overflow: 'hidden', paddingBottom: '24px' }}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>{t.totalValue}</h3>
          <span style={{ backgroundColor: `${rankColor}20`, color: rankColor, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: `1px solid ${rankColor}50` }}>
            Nivel {rank}
          </span>
        </div>
        <h1 style={{ ...s.h1, position: 'relative', zIndex: 2 }}>
          ${balance.toFixed(2)} <span style={{fontSize:'18px', color:'#94A3B8'}}>USDT</span>
        </h1>
        <p style={{ ...s.textGain, position: 'relative', zIndex: 2 }}>+{(balance > 0 ? (balance * 0.05).toFixed(2) : '0.00')} {t.dailyYield}</p>

        <PortfolioChart />

        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', position: 'relative', zIndex: 2 }}>
          <button onClick={() => onNavigate('portfolio')} style={{ flex: 1, backgroundColor: '#2DD4BF', color: '#0B1220', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(45, 212, 191, 0.3)' }}>
            {t.deposit}
          </button>
          <button onClick={() => onNavigate('portfolio')} style={{ flex: 1, backgroundColor: '#243247', color: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
            {t.withdraw}
          </button>
        </div>
      </div>

      {/* 2. GAMIFICACIÓN: RECOMPENSA DIARIA */}
      <div style={{ ...s.card, border: hasClaimed ? '1px solid #243247' : '1px dashed #2DD4BF', backgroundColor: hasClaimed ? '#0B1220' : '#111C2E', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.3s' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', color: hasClaimed ? '#94A3B8' : '#F1F5F9' }}>{t.dailyRewardTitle}</h3>
          <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', lineHeight: '1.4' }}>{t.dailyRewardDesc}</p>
        </div>
        <button 
          onClick={handleClaimDaily}
          disabled={hasClaimed}
          style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: hasClaimed ? 'not-allowed' : 'pointer', backgroundColor: hasClaimed ? '#1E293B' : '#2DD4BF', color: hasClaimed ? '#64748B' : '#0B1220', transition: '0.3s' }}
        >
          {hasClaimed ? t.claimed : t.claim}
        </button>
      </div>

      {/* 3. GAMIFICACIÓN: BARRA DE PROGRESO DE RANGO */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#F1F5F9' }}>{t.rankTitle}</h3>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: rankColor }}>{rank}</span>
        </div>
        
        <div style={{ width: '100%', height: '8px', backgroundColor: '#1E293B', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: rankColor, transition: 'width 1s ease-in-out' }}></div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8' }}>
          <span>{rank}</span>
          <span>{nextRank}</span>
        </div>
      </div>

      {/* 4. MIS ACTIVOS */}
      <div style={s.card}>
        <h3 style={s.h3}>{t.myAssets}</h3>
        {activePlans.length === 0 ? (
          <p style={s.textMuted}>{t.noAssets}</p>
        ) : (
          activePlans.map(plan => (
            <div key={plan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(36, 50, 71, 0.5)' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#F1F5F9' }}>{t.activePlan}</p>
                <p style={s.textMuted}>{plan.capital_usdt} USDT {t.invested}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={s.textGain}>+{plan.daily_return_usdt} USDT</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. ACTIVIDAD RECIENTE */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <h3 style={s.h3}>{t.recentAct}</h3>
        </div>

        {transactions.length === 0 ? (
          <p style={s.textMuted}>{t.noAct}</p>
        ) : (
          transactions.map((tx, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx !== transactions.length - 1 ? '1px solid rgba(36, 50, 71, 0.5)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: tx.type === 'DEPOSIT' || tx.type === 'YIELD' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(248, 113, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'DEPOSIT' || tx.type === 'YIELD' ? '#22C55E' : '#F87171' }}>
                  {tx.type === 'DEPOSIT' || tx.type === 'YIELD' ? '↓' : '↑'}
                </div>
                <div>
                  <span style={{ color: '#F1F5F9', fontWeight: 'bold', display: 'block', fontSize: '14px' }}>{tx.title}</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{tx.date}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={tx.type === 'DEPOSIT' || tx.type === 'YIELD' ? s.textGain : s.textLoss}>
                  {tx.type === 'DEPOSIT' || tx.type === 'YIELD' ? '+' : '-'}${tx.amount}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
