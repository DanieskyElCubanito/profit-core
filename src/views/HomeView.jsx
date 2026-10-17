import React from 'react';
import { s } from '../styles/appStyles';

export default function HomeView({ userData, activePlans, marketData, transactions = [] }) {
  
  // Gráfico SVG ligero simulando el crecimiento del portafolio (Estilo Robinhood)
  const PortfolioChart = () => (
    <div style={{ margin: '20px 0', position: 'relative', height: '80px', width: '100%' }}>
      <svg viewBox="0 0 300 80" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(45, 212, 191, 0.4)" />
            <stop offset="100%" stopColor="rgba(45, 212, 191, 0)" />
          </linearGradient>
        </defs>
        {/* Sombra/Gradiente debajo de la línea */}
        <path d="M0,60 Q30,40 60,50 T120,30 T180,40 T240,15 T300,5 L300,80 L0,80 Z" fill="url(#glow)" />
        {/* Línea principal turquesa */}
        <path d="M0,60 Q30,40 60,50 T120,30 T180,40 T240,15 T300,5" fill="none" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" />
        {/* Punto final parpadeante */}
        <circle cx="300" cy="5" r="4" fill="#2DD4BF">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );

  return (
    <div className="fade-in">
      {/* 1. Resumen del portafolio con Gráfico y Botones Rápidos */}
      <div style={{ ...s.card, position: 'relative', overflow: 'hidden' }}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>Valor Total</h3>
          <span style={s.textPremium}>PRO</span>
        </div>
        <h1 style={{ ...s.h1, position: 'relative', zIndex: 2 }}>
          ${Number(userData?.balance || 0).toFixed(2)} <span style={{fontSize:'18px', color:'#94A3B8'}}>USDT</span>
        </h1>
        <p style={{ ...s.textGain, position: 'relative', zIndex: 2 }}>+5.00% (Hoy)</p>
        
        {/* Gráfico Vectorial */}
        <PortfolioChart />

        {/* Botones de Acción Rápida */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', position: 'relative', zIndex: 2 }}>
          <button style={{ flex: 1, backgroundColor: '#2DD4BF', color: '#0B1220', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            Depositar
          </button>
          <button style={{ flex: 1, backgroundColor: '#243247', color: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            Retirar
          </button>
        </div>
      </div>

      {/* 2. Activos */}
      <div style={s.card}>
        <h3 style={s.h3}>Mis Activos</h3>
        {activePlans.length === 0 ? (
          <p style={s.textMuted}>No tienes activos en este momento.</p>
        ) : (
          activePlans.map(plan => (
            <div key={plan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(36, 50, 71, 0.5)' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#F1F5F9' }}>Plan Rendimiento</p>
                <p style={s.textMuted}>{plan.capital_usdt} USDT invertidos</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={s.textGain}>+{plan.daily_return_usdt} USDT</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Actividad Reciente (¡NUEVO!) */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <h3 style={s.h3}>Actividad Reciente</h3>
          <span style={{ fontSize: '12px', color: '#2DD4BF', cursor: 'pointer' }}>Ver todo</span>
        </div>
        
        {transactions.length === 0 ? (
          <p style={s.textMuted}>No hay transacciones recientes.</p>
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
