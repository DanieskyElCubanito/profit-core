import React from 'react';
import { s } from '../styles/appStyles';
import toast from 'react-hot-toast';
import WebApp from '@twa-dev/sdk';

// --- DICCIONARIO DE IDIOMAS AUTOMÁTICO ---
const translations = {
  es: {
    title: "Mi Perfil",
    balance: "BALANCE TOTAL",
    userId: "ID de Usuario",
    username: "Nombre de Usuario",
    language: "Idioma Detectado",
    refTitle: "Programa de Referidos",
    refDesc: "Invita a tus amigos y gana comisiones por sus inversiones.",
    refLink: "TU ENLACE DE INVITACIÓN",
    copyBtn: "COPIAR ENLACE",
    msgCopied: "Enlace copiado al portapapeles",
    support: "Contactar Soporte"
  },
  en: {
    title: "My Profile",
    balance: "TOTAL BALANCE",
    userId: "User ID",
    username: "Username",
    language: "Detected Language",
    refTitle: "Referral Program",
    refDesc: "Invite your friends and earn commissions on their investments.",
    refLink: "YOUR INVITATION LINK",
    copyBtn: "COPY LINK",
    msgCopied: "Link copied to clipboard",
    support: "Contact Support"
  }
};

const IconCopy = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconUser = () => <svg width="48" height="48" fill="none" stroke="#2DD4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/><path d="M32 35v-3a8 8 0 0 0-8-8h-8a8 8 0 0 0-8 8v3"/></svg>;

export default function ProfileView({ userData, setView }) {
  // Detectar idioma de Telegram
  const userLang = WebApp.initDataUnsafe?.user?.language_code === 'en' ? 'en' : 'es';
  const t = translations[userLang];

  // Extraer datos directamente de Telegram de forma segura
  const tgUser = WebApp.initDataUnsafe?.user || {};
  const firstName = tgUser.first_name || userData?.first_name || 'Inversor';
  const lastName = tgUser.last_name || '';
  const username = tgUser.username ? `@${tgUser.username}` : 'No definido';
  const userId = userData?.id || tgUser.id || '000000000';
  
  // ⚠️ PON AQUÍ EL USUARIO DE TU BOT (Sin el @)
  const BOT_USERNAME = "NombreDeTuBot"; 
  const refLink = `https://t.me/${BOT_USERNAME}?start=${userId}`;

  const safeHaptic = (style = 'medium') => {
    try { if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred(style); } catch (e) {}
  };

  const handleCopyRef = () => {
    safeHaptic('light');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(refLink);
      toast.success(t.msgCopied, { style: { background: '#2DD4BF', color: '#0B1220' }});
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = refLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success(t.msgCopied, { style: { background: '#2DD4BF', color: '#0B1220' }});
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ ...s.h1, marginBottom: '16px' }}>{t.title}</h2>

      {/* TARJETA PRINCIPAL DEL USUARIO */}
      <div style={{ ...s.card, background: 'linear-gradient(135deg, #111C2E 0%, #0B1220 100%)', border: '1px solid #243247', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#111C2E', padding: '12px', borderRadius: '50%', border: '1px solid #2DD4BF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <IconUser />
        </div>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#F1F5F9', fontSize: '20px' }}>{firstName} {lastName}</h3>
          <p style={{ margin: 0, color: '#2DD4BF', fontSize: '14px', fontWeight: 'bold' }}>{username}</p>
        </div>
      </div>

      {/* INFORMACIÓN DE LA CUENTA */}
      <div style={{ ...s.card, marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #243247', paddingBottom: '12px', marginBottom: '12px' }}>
          <span style={{ color: '#94A3B8', fontSize: '13px' }}>{t.balance}</span>
          <span style={{ color: '#F1F5F9', fontWeight: 'bold', fontSize: '14px' }}>${Number(userData?.balance || 0).toFixed(4)} USDT</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #243247', paddingBottom: '12px', marginBottom: '12px' }}>
          <span style={{ color: '#94A3B8', fontSize: '13px' }}>{t.userId}</span>
          <span style={{ color: '#F1F5F9', fontFamily: 'monospace', fontSize: '14px' }}>{userId}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94A3B8', fontSize: '13px' }}>{t.language}</span>
          <span style={{ color: '#F1F5F9', fontSize: '14px', textTransform: 'uppercase' }}>{userLang === 'es' ? '🇪🇸 Español' : '🇬🇧 English'}</span>
        </div>
      </div>

      {/* SECCIÓN DE REFERIDOS */}
      <div style={{ ...s.card, marginBottom: '24px', border: '1px dashed #2DD4BF' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#2DD4BF', fontSize: '16px' }}>{t.refTitle}</h3>
        <p style={{ margin: '0 0 16px 0', color: '#94A3B8', fontSize: '13px', lineHeight: '1.4' }}>{t.refDesc}</p>
        
        <label style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold', letterSpacing: '1px' }}>{t.refLink}</label>
        
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0B1220', border: '1px solid #243247', borderRadius: '8px', padding: '12px', marginTop: '6px', marginBottom: '16px' }}>
          <div style={{ flex: 1, fontSize: '13px', color: '#F1F5F9', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' }}>
            {refLink}
          </div>
        </div>

        <button onClick={handleCopyRef} style={{ ...s.btnMain, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <IconCopy /> {t.copyBtn}
        </button>
      </div>
    </div>
  );
}
