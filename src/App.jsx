import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import toast, { Toaster } from 'react-hot-toast';
import { s } from './styles/appStyles';
import { botApi } from './api/botApi';

import { IconHome, IconPortfolio, IconProfile } from './components/Icons';
import HomeView from './views/HomeView';
import PortfolioView from './views/PortfolioView';
import ProfileView from './views/ProfileView';
import SupportView from './views/SupportView';

// Ícono nativo para el botón de Soporte
const IconSupport = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;

export default function App() {
  const [status, setStatus] = useState('loading'); 
  const [activeTab, setActiveTab] = useState('home'); 
  const [userData, setUserData] = useState(null);
  const [activePlans, setActivePlans] = useState([]);
  const [transactions, setTransactions] = useState([
    { type: 'DEPOSIT', title: 'Depósito USDT', date: 'Hoy, 10:00 AM', amount: '50.00' },
    { type: 'YIELD', title: 'Rendimiento Diario', date: 'Ayer, 09:15 AM', amount: '2.50' }
  ]);

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
    return <div style={s.center}><div style={s.loader}></div></div>;
  }

  return (
    <div style={s.container}>
      <Toaster position="top-center" toastOptions={{ style: { background: '#111C2E', color: '#F1F5F9', border: '1px solid #243247' } }} />

      <div style={s.main}>
        {activeTab === 'home' && <HomeView userData={userData} activePlans={activePlans} transactions={transactions} onNavigate={setActiveTab} />}

        {activeTab === 'portfolio' && (
          <PortfolioView 
            userData={userData} 
            activePlans={activePlans} 
            onUpdate={() => verifyUser(WebApp.initDataUnsafe?.user || { id: 8968109534, username: 'TestUser' })} 
          />
        )}
        
        {activeTab === 'support' && <SupportView userData={userData} />}

        {activeTab === 'profile' && <ProfileView userData={userData} />}
      </div>

      <div style={s.bottomNav}>
        <div onClick={() => setActiveTab('home')} style={activeTab === 'home' ? s.navItemActive : s.navItem}>
          <IconHome /> Inicio
        </div>
        <div onClick={() => setActiveTab('portfolio')} style={activeTab === 'portfolio' ? s.navItemActive : s.navItem}>
          <IconPortfolio /> Invertir
        </div>
        <div onClick={() => setActiveTab('support')} style={activeTab === 'support' ? s.navItemActive : s.navItem}>
          <IconSupport /> Soporte
        </div>
        <div onClick={() => setActiveTab('profile')} style={activeTab === 'profile' ? s.navItemActive : s.navItem}>
          <IconProfile /> Perfil
        </div>
      </div>
    </div>
  );
}
