import React from 'react';
import { s } from '../styles/appStyles';
import WebApp from '@twa-dev/sdk';
import toast from 'react-hot-toast';

const IconSupport = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconClose = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconUsers = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconCopy = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;

export default function ProfileView({ userData }) {

  const safeHaptic = (style = 'medium') => {
    try { if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred(style); } catch (e) {}
  };

  const referralLink = `https://t.me/ProfitCore_Bot?start=${userData?.id || '123456'}`;
  
  const handleCopyRef = async () => {
    safeHaptic('light');
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Enlace copiado', { style: { background: '#2DD4BF', color: '#0B1220' }});
    }
  };

  const handleShareRef = () => {
    safeHaptic();
    try { WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`); } catch (e) {}
  };

  const handleTicket = () => {
    safeHaptic();
    // Simula la apertura de un modal o envío de ticket interno
    toast.success('Solicitud enviada. Un agente responderá pronto.');
  };

  const handleCloseApp = () => {
    try { WebApp.close(); } catch (e) {}
  };

  return (
    <div className="fade-in">
      <h2 style={{ ...s.h1, marginBottom: '16px' }}>Mi Perfil</h2>

      <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #2DD4BF' }}>
        <img src={userData?.photo_url || 'https://via.placeholder.com/100'} style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #2DD4BF', objectFit: 'cover' }} alt="Avatar" />
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#F1F5F9', fontSize: '18px' }}>{userData?.username || 'Usuario'}</h3>
          <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#94A3B8' }}>ID: {userData?.id}</p>
          <span style={{ backgroundColor: 'rgba(214, 181, 109, 0.1)', color: '#D6B56D', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #D6B56D' }}>VERIFICADO PRO</span>
        </div>
      </div>

      <div style={{ ...s.card, border: '1px solid rgba(214, 181, 109, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ color: '#D6B56D' }}><IconUsers /></span>
          <h3 style={{ ...s.h3, margin: 0, color: '#D6B56D' }}>Invita y Gana 5%</h3>
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>Gana el 5% de cada depósito que realicen tus amigos.</p>

        {/* Caja de Copiado Arreglada (Evita el desbordamiento visual) */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0B1220', border: '1px dashed #243247', borderRadius: '8px', padding: '10px', marginBottom: '12px', boxSizing: 'border-box' }}>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px', color: '#F1F5F9' }}>
            {referralLink}
          </div>
          <button onClick={handleCopyRef} style={{ background: 'none', border: 'none', color: '#2DD4BF', cursor: 'pointer', padding: '0 4px' }}>
            <IconCopy />
          </button>
        </div>

        <button onClick={handleShareRef} style={{ width: '100%', backgroundColor: '#2DD4BF', color: '#0B1220', border: 'none', borderRadius: '20px', padding: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
          Compartir ↗
        </button>
      </div>

      {/* Soporte Tickets */}
      <div style={s.card}>
        <div onClick={handleTicket} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(36, 50, 71, 0.5)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F1F5F9' }}>
            <span style={{ color: '#D6B56D' }}><IconSupport /></span>
            <span>Crear Ticket de Soporte</span>
          </div>
          <span style={{ color: '#94A3B8' }}>+</span>
        </div>

        <div onClick={handleCloseApp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F87171' }}>
            <span><IconClose /></span>
            <span style={{ fontWeight: 'bold' }}>Cerrar Aplicación</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
