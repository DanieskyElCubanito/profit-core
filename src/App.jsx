import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import { s } from './styles/appStyles'; // Asegúrate de tener tus estilos base
import { botApi } from './api/botApi';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  /* --- [ ESTADOS GENERALES ] --- */
  const [status, setStatus] = useState('loading'); // 'loading', 'member', 'error'
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'plans', 'withdraw'
  const [userData, setUserData] = useState(null);
  const [activePlans, setActivePlans] = useState([]);
  const [errorInfo, setErrorInfo] = useState('');

  /* --- [ ESTADOS PARA NUEVO PLAN / INVERSIÓN ] --- */
  const [investAmount, setInvestAmount] = useState(1);
  const [isInvesting, setIsInvesting] = useState(false);

  /* --- [ ESTADOS PARA RETIROS ] --- */
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDT');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState(1);
  const [isSendingWithdraw, setIsSendingWithdraw] = useState(false);

  /* --- [ VERIFICACIÓN DE USUARIO AL INICIO ] --- */
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
        setErrorInfo(data?.message || 'Acceso no autorizado.');
      }
    } catch (err) {
      console.error("Error verifying user:", err);
      setStatus('error');
      setErrorInfo('No se pudo conectar con el servidor central.');
    }
  }, []);

  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
      const user = WebApp.initDataUnsafe?.user;

      if (!user) {
        // Modo prueba local si no se abre desde Telegram
        const mockUser = { id: 8968109534, username: 'TestDeveloper', first_name: 'Dev' };
        verifyUser(mockUser);
        return;
      }
      verifyUser(user);
    } catch (e) {
      setStatus('error');
      setErrorInfo('Error al inicializar Telegram SDK.');
    }
  }, [verifyUser]);

  /* --- [ MANEJADOR: CREAR PLAN DE RENDIMIENTO ] --- */
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount < 1) {
      return toast.error("El monto mínimo es 1 USDT");
    }

    if (amount > (userData?.balance || 0)) {
      return toast.error("Saldo insuficiente en tu cuenta");
    }

    setIsInvesting(true);
    const toastId = toast.loading("Creando plan de rendimiento...");
    try {
      const res = await botApi.createPlan(userData.id, amount);
      if (res && res.success) {
        setUserData(prev => ({ ...prev, balance: prev.balance - amount }));
        setActivePlans(prev => [res.plan, ...prev]);
        toast.success(res.message || "¡Plan creado con éxito!", { id: toastId });
        WebApp.HapticFeedback.notificationOccurred('success');
        setInvestAmount(1);
        setActiveTab('plans');
      } else {
        toast.error(res?.error || "Error al crear el plan", { id: toastId });
      }
    } catch (err) {
      toast.error("Error de conexión", { id: toastId });
    } finally {
      setIsInvesting(false);
    }
  };

  /* --- [ MANEJADOR: SOLICITAR RETIRO ] --- */
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (!withdrawAddress.trim()) {
      return toast.error("Ingresa una dirección de destino válida");
    }
    if (isNaN(amount) || amount < 1) {
      return toast.error("El retiro mínimo es de 1 unidad");
    }
    if (amount > (userData?.balance || 0)) {
      return toast.error("Saldo insuficiente");
    }

    setIsSendingWithdraw(true);
    const toastId = toast.loading("Procesando solicitud de retiro...");
    try {
      const res = await botApi.requestWithdraw(userData.id, withdrawCurrency, withdrawAddress, amount);
      if (res && res.success) {
        setUserData(prev => ({ ...prev, balance: prev.balance - amount }));
        toast.success(`Retiro solicitado. Neto a recibir: ${res.details.net} ${withdrawCurrency}`, { id: toastId });
        WebApp.HapticFeedback.notificationOccurred('success');
        setWithdrawAddress('');
        setWithdrawAmount(1);
      } else {
        toast.error(res?.error || "Error en el retiro", { id: toastId });
      }
    } catch (err) {
      toast.error("Error de red", { id: toastId });
    } finally {
      setIsSendingWithdraw(false);
    }
  };

  /* --- [ RENDER DE ESTADOS DE CARGA / ERROR ] --- */
  if (status === 'loading') {
    return (
      <div style={s.center}>
        <div style={s.loader}></div>
        <p style={{ color: '#aaa', marginTop: '15px' }}>Cargando Profit Mini App...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={s.center}>
        <h2 style={{ color: '#ff4444', fontSize: '22px', marginBottom: '10px' }}>ACCESO RESTRINGIDO</h2>
        <p style={{ ...s.errorText, marginBottom: '20px', textAlign: 'center', padding: '0 20px' }}>{errorInfo}</p>
        <button style={s.btnWhite} onClick={() => window.location.reload()}>REINTENTAR</button>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <Toaster position="top-center" />

      {/* CONTENIDO PRINCIPAL SEGÚN LA PESTAÑA ACTIVA */}
      <div style={s.main}>
        
        {/* --- PESTAÑA 1: INICIO / PANEL --- */}
        {activeTab === 'home' && (
          <div className="fade-in" style={{ padding: '15px' }}>
            <div style={s.profileHeader}>
              <img src={userData?.photo_url} alt="Avatar" style={s.profileAvatar} />
              <div>
                <h2 style={s.profileName}>{userData?.username || 'Usuario'}</h2>
                <p style={s.profileId}>ID: {userData?.id}</p>
              </div>
            </div>

            {/* TARJETA DE SALDO */}
            <div style={s.cardBalance}>
              <p style={{ fontSize: '12px', color: '#888', letterSpacing: '1px' }}>SALDO DISPONIBLE EN USDT</p>
              <h1 style={{ fontSize: '32px', margin: '10px 0', color: '#fff' }}>
                {Number(userData?.balance || 0).toFixed(4)} <span style={{ fontSize: '16px', color: '#4CAF50' }}>USDT</span>
              </h1>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button style={s.btnGreen} onClick={() => setActiveTab('withdraw')}>RETIRAR</button>
                <button style={s.btnOutline} onClick={() => setActiveTab('plans')}>MIS PLANES</button>
              </div>
            </div>

            {/* FORMULARIO RÁPIDO PARA CREAR PLAN (5% diario / 40 días) */}
            <div style={{ background: '#1e1e1e', padding: '15px', borderRadius: '12px', marginTop: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '10px' }}>🚀 Iniciar Nuevo Plan</h3>
              <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '15px' }}>
                Obtén un <strong>5% diario durante 40 días</strong>. El capital inicial no se devuelve al finalizar.
              </p>
              <form onSubmit={handleCreatePlan}>
                <input 
                  type="number" 
                  step="0.01" 
                  min="1" 
                  style={s.input} 
                  value={investAmount} 
                  onChange={e => setInvestAmount(e.target.value)} 
                  placeholder="Monto en USDT (Mín. 1)"
                />
                <button type="submit" style={{ ...s.btnGreen, width: '100%', marginTop: '10px' }} disabled={isInvesting}>
                  {isInvesting ? 'Procesando...' : 'ACTIVAR PLAN (5% DIARIO)'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- PESTAÑA 2: PLANES ACTIVOS --- */}
        {activeTab === 'plans' && (
          <div className="fade-in" style={{ padding: '15px' }}>
            <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '15px' }}>📊 Mis Planes Activos</h3>
            
            {activePlans.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
                <p>No tienes planes activos en este momento.</p>
                <button style={{ ...s.btnWhite, marginTop: '15px' }} onClick={() => setActiveTab('home')}>Crear Plan</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activePlans.map((plan) => (
                  <div key={plan.id} style={{ background: '#222', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #4CAF50' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: '#fff' }}>Capital: {plan.capital_usdt} USDT</span>
                      <span style={{ color: '#4CAF50', fontSize: '12px' }}>{plan.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#ccc', margin: '4px 0' }}>
                      Rendimiento diario: <strong>{plan.daily_return_usdt} USDT</strong> (5%)
                    </p>
                    <p style={{ fontSize: '12px', color: '#888', margin: '4px 0' }}>
                      Progreso: Día {plan.days_elapsed} de 40 | Reinversiones: {plan.reinvestment_count}/3
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- PESTAÑA 3: RETIRAR FONDOS --- */}
        {activeTab === 'withdraw' && (
          <div className="fade-in" style={{ padding: '15px' }}>
            <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '15px' }}>💸 Retirar Fondos</h3>
            <p style={{ color: '#aaa', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>
              Comisiones de red reales sin recargo de plataforma.
            </p>

            <form onSubmit={handleWithdraw}>
              <label style={{ fontSize: '12px', color: '#888' }}>Seleccionar Red / Moneda:</label>
              <select 
                style={s.input} 
                value={withdrawCurrency} 
                onChange={e => setWithdrawCurrency(e.target.value)}
              >
                <option value="USDT">USDT (BNB Smart Chain / BEP-20)</option>
                <option value="GRAM">GRAM (Red TON)</option>
              </select>

              <label style={{ fontSize: '12px', color: '#888', marginTop: '10px', display: 'block' }}>Dirección de Billetera:</label>
              <input 
                type="text" 
                style={s.input} 
                placeholder={withdrawCurrency === 'USDT' ? '0x... (BEP-20)' : 'EQ... o UQ... (TON)'}
                value={withdrawAddress} 
                onChange={e => setWithdrawAddress(e.target.value)} 
              />

              <label style={{ fontSize: '12px', color: '#888', marginTop: '10px', display: 'block' }}>Monto a Retirar (USDT):</label>
              <input 
                type="number" 
                step="0.01" 
                min="1" 
                style={s.input} 
                value={withdrawAmount} 
                onChange={e => setWithdrawAmount(e.target.value)} 
              />

              <button type="submit" style={{ ...s.btnGreen, width: '100%', marginTop: '15px' }} disabled={isSendingWithdraw}>
                {isSendingWithdraw ? 'Procesando Retiro...' : 'CONFIRMAR RETIRO'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* BARRA DE NAVEGACIÓN INFERIOR */}
      <div style={s.bottomNav}>
        <div onClick={() => setActiveTab('home')} style={activeTab === 'home' ? s.navItemActive : s.navItem}>🏠 Inicio</div>
        <div onClick={() => setActiveTab('plans')} style={activeTab === 'plans' ? s.navItemActive : s.navItem}>📊 Planes</div>
        <div onClick={() => setActiveTab('withdraw')} style={activeTab === 'withdraw' ? s.navItemActive : s.navItem}>💸 Retirar</div>
      </div>
    </div>
  );
}

export default App;
