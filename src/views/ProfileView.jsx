import React from 'react';
import { s } from '../styles/appStyles';
import WebApp from '@twa-dev/sdk';

// Íconos SVG para el menú del perfil
const IconWallet = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const IconSecurity = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconLanguage = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>;
const IconSupport = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconClose = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

export default function ProfileView({ userData }) {
  
  // Función nativa de Telegram para cerrar la Mini App
  const handleCloseApp = () => {
    WebApp.close();
  };

  // Función para redirigir al bot de soporte
  const handleSupport = () => {
    WebApp.openTelegramLink('https://t.me/DannyElCallejero'); // Puedes cambiarlo por el usuario de soporte real
  };

  return (
    <div className="fade-in">
      <h2 style={{ ...s.h1, marginBottom: '16px' }}>Mi Perfil</h2>

      {/* Tarjeta de Identidad */}
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

      {/* Menú de Configuración */}
      <div style={s.card}>
        <h3 style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0', fontWeight: 'bold', textTransform: 'uppercase' }}>Configuración</h3>
        
        {/* Opción Billeteras */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(36, 50, 71, 0.5)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F1F5F9' }}>
            <span style={{ color: '#2DD4BF' }}><IconWallet /></span>
            <span>Billeteras de Retiro</span>
          </div>
          <span style={{ color: '#94A3B8' }}>{'>'}</span>
        </div>

        {/* Opción Seguridad */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(36, 50, 71, 0.5)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F1F5F9' }}>
            <span style={{ color: '#2DD4BF' }}><IconSecurity /></span>
            <span>Seguridad y PIN</span>
          </div>
          <span style={{ color: '#94A3B8' }}>{'>'}</span>
        </div>

        {/* Opción Idioma */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F1F5F9' }}>
            <span style={{ color: '#2DD4BF' }}><IconLanguage /></span>
            <span>Idioma</span>
          </div>
          <span style={{ color: '#94A3B8', fontSize: '13px' }}>Español {'>'}</span>
        </div>
      </div>

      {/* Soporte y Salida */}
      <div style={s.card}>
        <h3 style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0', fontWeight: 'bold', textTransform: 'uppercase' }}>Ayuda</h3>
        
        {/* Opción Soporte */}
        <div onClick={handleSupport} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(36, 50, 71, 0.5)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F1F5F9' }}>
            <span style={{ color: '#D6B56D' }}><IconSupport /></span>
            <span>Soporte Técnico</span>
          </div>
          <span style={{ color: '#94A3B8' }}>{'>'}</span>
        </div>

        {/* Opción Cerrar App */}
        <div onClick={handleCloseApp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F87171' }}>
            <span><IconClose /></span>
            <span style={{ fontWeight: 'bold' }}>Cerrar Aplicación</span>
          </div>
        </div>
      </div>
      
      {/* Versión de la app */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontSize: '11px', color: '#243247', margin: 0 }}>Profit App Core v1.0.0</p>
        <p style={{ fontSize: '11px', color: '#243247', margin: 0 }}>© 2026 Todos los derechos reservados</p>
      </div>

    </div>
  );
}
