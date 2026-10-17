import React, { useState, useEffect } from 'react';
import { s } from '../styles/appStyles';
import WebApp from '@twa-dev/sdk';
import toast from 'react-hot-toast';

// Íconos SVG
const IconWallet = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const IconLanguage = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>;
const IconSupport = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconClose = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconFingerprint = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.5 22c-1.5-1.5-1.5-4-1.5-4v-6a5 5 0 0 1 5-5c1 0 2 .5 3 1"/><path d="M11 22v-3.5c0-1.5.5-2.5 1.5-3.5a4 4 0 0 1 3-1.5"/></svg>;
const IconUsers = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconCopy = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;

export default function ProfileView({ userData }) {
  // Estados para la biometría
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);

  // Inicializar BiometricManager de Telegram
  useEffect(() => {
    if (WebApp.BiometricManager) {
      WebApp.BiometricManager.init(() => {
        setBioAvailable(WebApp.BiometricManager.isBiometricAvailable);
        setBioEnabled(WebApp.BiometricManager.isAccessGranted);
      });
    }
  }, []);

  // Función para activar/desactivar Biometría
  const toggleBiometrics = () => {
    WebApp.HapticFeedback.impactOccurred('medium');
    
    if (!bioAvailable) {
      return toast.error('Tu dispositivo no soporta biometría', { style: { background: '#111C2E', color: '#F1F5F9' }});
    }

    if (!bioEnabled) {
      // Pide permiso nativo al teléfono (Face ID / Huella)
      WebApp.BiometricManager.requestAccess({ reason: 'Usa tu biometría para autorizar retiros de fondos' }, (granted) => {
        if (granted) {
          setBioEnabled(true);
          toast.success('Seguridad Biométrica Activada');
          WebApp.HapticFeedback.notificationOccurred('success');
        } else {
          toast.error('Acceso denegado');
        }
      });
    } else {
      setBioEnabled(false);
      toast.success('Seguridad Biométrica Desactivada');
    }
  };

  // Lógica de Referidos
  const referralLink = `https://t.me/ProfitCore_Bot?start=${userData?.id}`;
  
  const handleCopyRef = () => {
    navigator.clipboard.writeText(referralLink);
    WebApp.HapticFeedback.notificationOccurred('success');
    toast.success('Enlace copiado al portapapeles');
  };

  const handleShareRef = () => {
    WebApp.HapticFeedback.impactOccurred('light');
    const text = `🚀 Únete a Profit Core y genera 5% de rendimiento diario en USDT.\n\nEmpieza aquí: ${referralLink}`;
    // Abre el selector de chats de Telegram nativo
    WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🚀 Únete a Profit Core y genera 5% de rendimiento diario.')}`);
  };

  const handleCloseApp = () => {
    WebApp.close();
  };

  return (
    <div className="fade-in">
      <h2 style={{ ...s.h1, marginBottom: '16px' }}>Mi Perfil</h2>

      {/* 1. Tarjeta de Identidad */}
      <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #2DD4BF' }}>
        <img 
          src={userData?.photo_url || 'https://via.placeholder.com/100'} 
          style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #2DD4BF', objectFit: 'cover' }} 
          alt="Avatar" 
        />
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#F1F5F9', fontSize: '18px' }}>
            {userData?.username || 'Usuario'}
          </h3>
          <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#94A3B8' }}>
            ID: {userData?.id}
          </p>
          <span style={{ backgroundColor: 'rgba(214, 181, 109, 0.1)', color: '#D6B56D', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #D6B56D' }}>
            VERIFICADO PRO
          </span>
        </div>
      </div>

      {/* 2. Programa de Afiliados (Referidos) */}
      <div style={{ ...s.card, border: '1px solid rgba(214, 181, 109, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ color: '#D6B56D' }}><IconUsers /></span>
          <h3 style={{ ...s.h3, margin: 0, color: '#D6B56D' }}>Invita y Gana 5%</h3>
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>
          Gana el 5% de cada depósito que realicen tus amigos directamente a tu saldo principal.
        </p>

        {/* Caja del Enlace */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0B1220', border: '1px dashed #243247', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
          <span style={{ flex: 1, fontSize: '12px', color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {referralLink}
          </span>
          <button onClick={handleCopyRef} style={{ background: 'none', border: 'none', color: '#2DD4BF', cursor: 'pointer', padding: '0 4px' }}>
            <IconCopy />
          </button>
        </div>

        {/* Estadísticas rápidas y Botón Compartir */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '10px', color: '#94A3B8' }}>INVITADOS</p>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#F1F5F9' }}>0</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '10px', color: '#94A3B8' }}>GANANCIAS</p>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#22C55E' }}>$0.00</p>
            </div>
          </div>
          <button onClick={handleShareRef} style={{ backgroundColor: '#2DD4BF', color: '#0B1220', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            Compartir ↗
          </button>
        </div>
      </div>

      {/* 3. Configuración y Seguridad */}
      <div style={s.card}>
        <h3 style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0', fontWeight: 'bold', textTransform: 'uppercase' }}>Seguridad</h3>
        
        {/* Toggle de Biometría */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(36, 50, 71, 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F1F5F9' }}>
            <span style={{ color: '#2DD4BF' }}><IconFingerprint /></span>
            <div>
              <span style={{ display: 'block' }}>Face ID / Touch ID</span>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>Requerir para retirar fondos</span>
            </div>
          </div>
          
          {/* Switch UI nativo */}
          <div onClick={toggleBiometrics} style={{ width: '40px', height: '24px', backgroundColor: bioEnabled ? '#2DD4BF' : '#243247', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
            <div style={{ width: '18px', height: '18px', backgroundColor: '#F1F5F9', borderRadius: '50%', position: 'absolute', top: '3px', left: bioEnabled ? '19px' : '3px', transition: '0.3s' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(36, 50, 71, 0.5)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F1F5F9' }}>
            <span style={{ color: '#2DD4BF' }}><IconWallet /></span>
            <span>Billeteras Guardadas</span>
          </div>
          <span style={{ color: '#94A3B8' }}>{'>'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F1F5F9' }}>
            <span style={{ color: '#2DD4BF' }}><IconLanguage /></span>
            <span>Idioma</span>
          </div>
          <span style={{ color: '#94A3B8', fontSize: '13px' }}>Español {'>'}</span>
        </div>
      </div>

      {/* 4. Soporte y Salida */}
      <div style={s.card}>
        <div onClick={() => WebApp.openTelegramLink('https://t.me/DannyElCallejero')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(36, 50, 71, 0.5)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F1F5F9' }}>
            <span style={{ color: '#D6B56D' }}><IconSupport /></span>
            <span>Soporte Técnico</span>
          </div>
          <span style={{ color: '#94A3B8' }}>{'>'}</span>
        </div>

        <div onClick={handleCloseApp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F87171' }}>
            <span><IconClose /></span>
            <span style={{ fontWeight: 'bold' }}>Cerrar Aplicación</span>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontSize: '11px', color: '#243247', margin: 0 }}>Profit App Core v1.0.0</p>
      </div>

    </div>
  );
}
