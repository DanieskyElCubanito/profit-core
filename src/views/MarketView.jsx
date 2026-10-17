import React, { useState, useMemo } from 'react';
import { s } from '../styles/appStyles';

// Componente para simular un minigráfico de tendencia (Sparkline)
const Sparkline = ({ isPositive }) => (
  <svg width="50" height="20" viewBox="0 0 50 20" fill="none" stroke={isPositive ? '#22C55E' : '#F87171'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {isPositive 
      ? <path d="M5,15 Q15,15 20,10 T35,5 T45,2" /> 
      : <path d="M5,5 Q15,5 20,10 T35,15 T45,18" />
    }
  </svg>
);

export default function MarketView({ marketData }) {
  // Estados para el buscador y los filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'gainers', 'layer1'

  // Lista base de activos
  const baseAssets = [
    { symbol: 'BTC', name: 'Bitcoin', data: marketData.BTC, category: 'layer1' },
    { symbol: 'ETH', name: 'Ethereum', data: marketData.ETH, category: 'layer1' },
    { symbol: 'SOL', name: 'Solana', data: marketData.SOL, category: 'layer1' },
    { symbol: 'GRAM', name: 'The Open Network', data: marketData.GRAM, category: 'layer1' },
    { symbol: 'BNB', name: 'BNB Smart Chain', data: marketData.BNB, category: 'layer1' }
  ];

  // Lógica de filtrado y búsqueda en tiempo real (useMemo evita que se recalcule sin necesidad)
  const filteredAssets = useMemo(() => {
    let result = [...baseAssets];

    // 1. Filtro por barra de búsqueda
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(coin => 
        coin.symbol.toLowerCase().includes(query) || 
        coin.name.toLowerCase().includes(query)
      );
    }

    // 2. Filtro por botones (Pills)
    if (activeFilter === 'gainers') {
      result = result
        .filter(coin => coin.data.isPositive) // Solo los que están en verde
        .sort((a, b) => parseFloat(b.data.change) - parseFloat(a.data.change)); // Mayor a menor
    } else if (activeFilter === 'layer1') {
      result = result.filter(coin => coin.category === 'layer1');
    }

    return result;
  }, [searchQuery, activeFilter, marketData]); // Se actualiza si cambia la búsqueda, el filtro o los precios

  return (
    <div className="fade-in">
      <h2 style={{ ...s.h1, marginBottom: '16px' }}>Mercado</h2>
      
      {/* Buscador minimalista interactivo */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <span style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </span>
        <input 
          type="text" 
          placeholder="Buscar activo (ej. BTC)..." 
          style={{ ...s.input, paddingLeft: '40px', marginBottom: '0' }} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* Botón para limpiar búsqueda rápidamente */}
        {searchQuery && (
          <span 
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '14px', top: '14px', color: '#94A3B8', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
          >
            ✕
          </span>
        )}
      </div>

      {/* Filtros tipo "Pills" Dinámicos */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        <button 
          onClick={() => setActiveFilter('all')}
          style={{ padding: '8px 16px', backgroundColor: activeFilter === 'all' ? '#2DD4BF' : '#111C2E', color: activeFilter === 'all' ? '#0B1220' : '#94A3B8', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: activeFilter === 'all' ? 'none' : '1px solid #243247', whiteSpace: 'nowrap', transition: '0.2s', cursor: 'pointer' }}
        >
          Todos
        </button>
        <button 
          onClick={() => setActiveFilter('gainers')}
          style={{ padding: '8px 16px', backgroundColor: activeFilter === 'gainers' ? '#2DD4BF' : '#111C2E', color: activeFilter === 'gainers' ? '#0B1220' : '#94A3B8', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: activeFilter === 'gainers' ? 'none' : '1px solid #243247', whiteSpace: 'nowrap', transition: '0.2s', cursor: 'pointer' }}
        >
          Ganadores 🚀
        </button>
        <button 
          onClick={() => setActiveFilter('layer1')}
          style={{ padding: '8px 16px', backgroundColor: activeFilter === 'layer1' ? '#2DD4BF' : '#111C2E', color: activeFilter === 'layer1' ? '#0B1220' : '#94A3B8', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: activeFilter === 'layer1' ? 'none' : '1px solid #243247', whiteSpace: 'nowrap', transition: '0.2s', cursor: 'pointer' }}
        >
          Layer 1
        </button>
      </div>

      {/* Lista del Mercado Filtrada */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Activo</span>
          <span style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'right' }}>Precio / 24h</span>
        </div>

        {filteredAssets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <span style={{ fontSize: '30px', display: 'block', marginBottom: '10px' }}>🔍</span>
            <p style={s.textMuted}>No se encontraron activos.</p>
          </div>
        ) : (
          filteredAssets.map((coin, index) => (
            <div key={coin.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: index !== filteredAssets.length - 1 ? '1px solid rgba(36, 50, 71, 0.5)' : 'none' }}>
              
              {/* Avatar y Nombre */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#243247', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1F5F9', fontSize: '11px', fontWeight: 'bold' }}>
                  {coin.symbol}
                </div>
                <div>
                  <span style={{ color: '#F1F5F9', fontWeight: 'bold', display: 'block' }}>{coin.symbol}</span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{coin.name}</span>
                </div>
              </div>

              {/* Minigráfico de Tendencia (Centro) */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Sparkline isPositive={coin.data.isPositive} />
              </div>

              {/* Precio y Porcentaje (Derecha) */}
              <div style={{ textAlign: 'right', flex: 1 }}>
                <span style={{ color: '#F1F5F9', display: 'block', fontWeight: 'bold' }}>${coin.data.price}</span>
                <span style={{ ... (coin.data.isPositive ? s.textGain : s.textLoss), fontSize: '12px' }}>
                  {coin.data.isPositive ? '+' : '-'}{coin.data.change}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
