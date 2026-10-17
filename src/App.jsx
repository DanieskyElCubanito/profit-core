import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import { s } from './styles/appStyles';
import { botApi } from './api/botApi';
import toast, { Toaster } from 'react-hot-toast';

// --- ÍCONOS VECTORIALES PREMIUM (Estilo 2026) ---
const IconHome = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconMarket = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const IconPortfolio = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
  </svg>
);

const IconProfile = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
// -------------------------------------------------

function App() {
  const [status, setStatus] = useState('loading'); 
  const [activeTab, setActiveTab] = useState('home'); 
  const [userData, setUserData] = useState(null);
  const [activePlans, setActivePlans] = useState([]);
  
  const verifyUser = useCallback(async (user) => {
    try {
      const data = await botApi.verifyUser(user);
      if (data && data.success) {
        setUserData({
          ...data.user,
          photo_url: WebApp.initDataUnsafe?.user?.photo_url || 'https://via.placeholder.com/100'
        });
        setActivePlans(data.plans || []);
        setStatus('member');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
      const user = WebApp.initDataUnsafe?.user || { id: 8968109534, username: 'TestUser' };
      verifyUser(user);
    } catch (e) {
      setStatus('error');
    }
  }, [verifyUser]);

  if (status === 'loading') {
    return (
      <div style={s.center}>
        <div style={s.loader}></div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <Toaster position="top-center" toastOptions={{ style: { background: '#111C2E', color: '#F1F5F9', border: '1px solid #243247' } }} />

      <div style={s.main}>
        {/* --- PESTAÑA: INICIO --- */}
        {activeTab === 'home' && (
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

            {/* 3. Lista de Seguimiento */}
            <div style={s.card}>
              <h3 style={s.h3}>Lista de Seguimiento</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: '#F1F5F9' }}>TON / USDT</span>
                <span style={s.textGain}>+2.4%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: '#F1F5F9' }}>BNB / USDT</span>
                <span style={s.textLoss}>-0.8%</span>
              </div>
            </div>

            {/* 4. Actividad Reciente */}
            <div style={s.card}>
              <h3 style={s.h3}>Actividad Reciente</h3>
              <p style={s.textMuted}>No hay transacciones recientes.</p>
            </div>

            {/* 5. Contenido Educativo */}
            <div style={{ ...s.card, borderColor: '#D6B56D' }}>
              <div style={s.cardHeader}>
                <h3 style={{...s.h3, margin: 0}}>Academia</h3>
                <span style={s.textPremium}>NUEVO</span>
              </div>
              <p style={s.textMuted}>Aprende a gestionar tu riesgo y maximizar tus rendimientos con nuestras guías.</p>
            </div>

          </div>
        )}

        {/* --- OTRAS PESTAÑAS --- */}
        {activeTab === 'market' && (
          <div style={s.center}><h3 style={s.h3}>Mercado en vivo</h3><p style={s.textMuted}>Próximamente...</p></div>
        )}
        {activeTab === 'portfolio' && (
          <div style={s.center}><h3 style={s.h3}>Gestión de Portafolio</h3><p style={s.textMuted}>Aquí irán las reinversiones y retiros.</p></div>
        )}
        {activeTab === 'profile' && (
          <div style={s.center}>
            <img src={userData?.photo_url} style={{ width: '80px', borderRadius: '50%', border: '2px solid #2DD4BF', marginBottom: '16px' }} alt="Avatar" />
            <h3 style={s.h3}>{userData?.username}</h3>
            <p style={s.textMuted}>ID: {userData?.id}</p>
          </div>
        )}
      </div>

      {/* --- NAVEGACIÓN INFERIOR (Con SVGs) --- */}
      <div style={s.bottomNav}>
        <div onClick={() => setActiveTab('home')} style={activeTab === 'home' ? s.navItemActive : s.navItem}>
          <IconHome />
          Inicio
        </div>
        <div onClick={() => setActiveTab('market')} style={activeTab === 'market' ? s.navItemActive : s.navItem}>
          <IconMarket />
          Mercado
        </div>
        <div onClick={() => setActiveTab('portfolio')} style={activeTab === 'portfolio' ? s.navItemActive : s.navItem}>
          <IconPortfolio />
          Portafolio
        </div>
        <div onClick={() => setActiveTab('profile')} style={activeTab === 'profile' ? s.navItemActive : s.navItem}>
          <IconProfile />
          Perfil
        </div>
      </div>
    </div>
  );
}

export default App;
