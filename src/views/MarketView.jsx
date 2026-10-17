import React from 'react';
import { s } from '../styles/appStyles';

export default function MarketView({ marketData }) {
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', data: marketData.BTC },
    { symbol: 'ETH', name: 'Ethereum', data: marketData.ETH },
    { symbol: 'SOL', name: 'Solana', data: marketData.SOL },
    { symbol: 'GRAM', name: 'The Open Network', data: marketData.GRAM },
    { symbol: 'BNB', name: 'BNB Smart Chain', data: marketData.BNB }
  ];

  return (
    <div className="fade-in">
      <h2 style={{ ...s.h1, marginBottom: '16px' }}>Mercado</h2>
      
      {/* Buscador minimalista */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <span style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input type="text" placeholder="Buscar criptomoneda..." style={{ ...s.input, paddingLeft: '40px', marginBottom: '0' }} />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ padding: '6px 14px', backgroundColor: '#2DD4BF', color: '#0B1220', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Todos</span>
        <span style={{ padding: '6px 14px', backgroundColor: '#111C2E', color: '#94A3B8', borderRadius: '20px', fontSize: '12px', border: '1px solid #243247', whiteSpace: 'nowrap' }}>Ganadores 🚀</span>
      </div>

      {/* Lista del Mercado */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Activo</span>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Precio / 24h</span>
        </div>

        {assets.map((coin, index) => (
          <div key={coin.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: index !== assets.length - 1 ? '1px solid rgba(36, 50, 71, 0.5)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#243247', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1F5F9', fontSize: '10px', fontWeight: 'bold' }}>
                {coin.symbol}
              </div>
              <div>
                <span style={{ color: '#F1F5F9', fontWeight: 'bold', display: 'block' }}>{coin.symbol}</span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{coin.name}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#F1F5F9', display: 'block', fontWeight: '500' }}>${coin.data.price}</span>
              <span style={coin.data.isPositive ? s.textGain : s.textLoss}>
                {coin.data.isPositive ? '+' : '-'}{coin.data.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
