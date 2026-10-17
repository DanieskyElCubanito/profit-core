export const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#0B1220', // Fondo: azul casi negro
    color: '#F1F5F9', // Texto principal: blanco suave
    fontFamily: '"Inter", Roboto, -apple-system, sans-serif',
    paddingBottom: '80px', 
    boxSizing: 'border-box'
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    boxSizing: 'border-box',
    padding: '16px'
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#0B1220',
    color: '#F1F5F9',
    padding: '20px',
    textAlign: 'center'
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '4px solid #243247',
    borderTop: '4px solid #2DD4BF', // Color principal: verde turquesa
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  // --- TARJETAS ---
  card: {
    backgroundColor: '#111C2E', // Tarjetas: azul oscuro
    border: '1px solid #243247', // Bordes
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  cardTitle: {
    fontSize: '14px',
    color: '#94A3B8', // Texto secundario: gris azulado
    fontWeight: '500',
    margin: 0
  },
  // --- TIPOGRAFÍA ---
  h1: { fontSize: '32px', margin: '8px 0', color: '#F1F5F9', fontWeight: 'bold' },
  h3: { fontSize: '16px', margin: '0 0 10px 0', color: '#F1F5F9', fontWeight: '600' },
  textMuted: { fontSize: '13px', color: '#94A3B8', margin: '4px 0' },
  textGain: { color: '#22C55E', fontWeight: '600', fontSize: '14px' }, // Ganancias
  textLoss: { color: '#F87171', fontWeight: '600', fontSize: '14px' }, // Pérdidas
  textPremium: { color: '#D6B56D', fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.5px' }, // Acento Premium
  
  // --- FORMULARIOS ---
  input: {
    width: '100%',
    backgroundColor: '#0B1220',
    border: '1px solid #243247',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#F1F5F9',
    fontSize: '15px',
    marginTop: '6px',
    marginBottom: '16px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  // --- BOTONES ---
  btnMain: {
    backgroundColor: '#2DD4BF', // Turquesa
    color: '#0B1220', // Texto oscuro para contrastar con el turquesa
    border: 'none',
    borderRadius: '12px',
    padding: '14px 20px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
    transition: 'opacity 0.2s'
  },
  btnOutline: {
    backgroundColor: 'transparent',
    color: '#2DD4BF',
    border: '1px solid #2DD4BF',
    borderRadius: '12px',
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center'
  },
  // --- BARRA INFERIOR ---
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65px',
    backgroundColor: '#111C2E',
    borderTop: '1px solid #243247',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    maxWidth: '480px',
    margin: '0 auto',
    paddingBottom: 'env(safe-area-inset-bottom)'
  },
  navItem: {
    flex: 1,
    textAlign: 'center',
    fontSize: '11px',
    color: '#94A3B8',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500'
  },
  navItemActive: {
    flex: 1,
    textAlign: 'center',
    fontSize: '11px',
    color: '#2DD4BF',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontWeight: 'bold'
  }
};
