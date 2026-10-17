import React from 'react';
import { s } from '../styles/appStyles';

export default function HomeView({ userData, activePlans, marketData }) {
  return (
    <div className="fade-in">
      {/* 1. Resumen del portafolio */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>Valor Total</h3>
          <span style={s.textPremium}>PRO</span>
        </div>
        <h1 style={s.h1}>${Number(userData?.balance || 0).toFixed(2)} <span style={{fontSize:'18px', color:'#94A3B8'}}>USDT</span></h1>
        <p style={s.textGain}>+5.00% (Hoy)</p>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid #243247', paddingTop: '16px' }}>
          <span style={{...s.textMuted, color: '#2DD4BF', fontWeight: 'bold'}}>1D</span>
          <span style={s.textMuted}>1S</span>
          <span style={s.textMuted}>1M</span>
          <span style={s.textMuted}>1A</span>
        </div>
      </div>

      {/* 2. Activos */}
      <div style={s.card}>
        <h3 style={s.h3}>Mis Activos</h3>
        {activePlans.length === 0 ? (
          <p style={s.textMuted}>No tienes activos en este momento.</p>
        ) : (
          activePlans.map(plan => (
            <div key={plan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #243247' }}>
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

      {/* 3. Lista de Seguimiento (TIEMPO REAL) */}
      <div style={s.card}>
        <h3 style={s.h3}>Lista de Seguimiento</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(36, 50, 71, 0.5)' }}>
          <div>
            <span style={{ color: '#F1F5F9', fontWeight: 'bold' }}>GRAM / USDT</span>
            <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>The Open Network</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#F1F5F9', display: 'block', fontWeight: '500' }}>${marketData.GRAM.price}</span>
            <span style={marketData.GRAM.isPositive ? s.textGain : s.textLoss}>
              {marketData.GRAM.isPositive ? '+' : '-'}{marketData.GRAM.change}%
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <div>
            <span style={{ color: '#F1F5F9', fontWeight: 'bold' }}>BNB / USDT</span>
            <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>BNB Smart Chain</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#F1F5F9', display: 'block', fontWeight: '500' }}>${marketData.BNB.price}</span>
            <span style={marketData.BNB.isPositive ? s.textGain : s.textLoss}>
              {marketData.BNB.isPositive ? '+' : '-'}{marketData.BNB.change}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
