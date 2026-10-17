import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import toast, { Toaster } from 'react-hot-toast';
import { s } from './styles/appStyles';
import { botApi } from './api/botApi';

// Importamos los componentes modulares
import { IconHome, IconMarket, IconPortfolio, IconProfile } from './components/Icons';
import HomeView from './views/HomeView';
import MarketView from './views/MarketView';
import PortfolioView from './views/PortfolioView';
import ProfileView from './views/ProfileView';

export default function App() {
  const [status, setStatus] = useState('loading'); 
  const [activeTab, setActiveTab] = useState('home'); 
  const [userData, setUserData] = useState(null);
  const [activePlans, setActivePlans] = useState([]);
  
  const [marketData, setMarketData] = useState({
    GRAM: { price: '...', change: '0.00', isPositive: true },
    BNB: { price: '...', change: '0.00', isPositive: true },
    BTC: { price: '...', change: '0.00', isPositive: true },
    ETH: { price: '...', change: '0.00', isPositive: true },
    SOL: { price: '...', change: '0.00', isPositive: true }
  });
  
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

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network,binancecoin,bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();

        if (data) {
          const formatData = (coinData) => ({
            price: parseFloat(coinData?.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: Math.abs(parseFloat(coinData?.usd_24h_change || 0)).toFixed(2),
            isPositive: parseFloat(coinData?.usd_24h_change || 0) >= 0
          });

          setMarketData({
            GRAM: formatData(data['the-open-network']),
            BNB: formatData(data['binancecoin']),
            BTC: formatData(data['bitcoin']),
            ETH: formatData(data['ethereum']),
            SOL: formatData(data['solana'])
          });
        }
      } catch (err) {
        console.error("Error obteniendo precios de CoinGecko:", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 20000); 
    return () => clearInterval(interval);
  }, []);

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
        {/* Renderizamos las vistas pasándoles los datos necesarios (Props) */}
        {activeTab === 'home' && <HomeView userData={userData} activePlans={activePlans} marketData={marketData} />}
        {activeTab === 'market' && <MarketView marketData={marketData} />}
        {activeTab === 'portfolio' && <PortfolioView />}
        {activeTab === 'profile' && <ProfileView userData={userData} />}
      </div>

      <div style={s.bottomNav}>
        <div onClick={() => setActiveTab('home')} style={activeTab === 'home' ? s.navItemActive : s.navItem}>
          <IconHome /> Inicio
        </div>
        <div onClick={() => setActiveTab('market')} style={activeTab === 'market' ? s.navItemActive : s.navItem}>
          <IconMarket /> Mercado
        </div>
        <div onClick={() => setActiveTab('portfolio')} style={activeTab === 'portfolio' ? s.navItemActive : s.navItem}>
          <IconPortfolio /> Portafolio
        </div>
        <div onClick={() => setActiveTab('profile')} style={activeTab === 'profile' ? s.navItemActive : s.navItem}>
          <IconProfile /> Perfil
        </div>
      </div>
    </div>
  );
}
