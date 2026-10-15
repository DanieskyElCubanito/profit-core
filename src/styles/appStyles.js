export const s = {
  // Contenedor principal de la app (ocupa toda la altura y ancho móvil)
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#0f1015',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    paddingBottom: '70px', // Espacio para que la barra de navegación no tape contenido
    boxSizing: 'border-box'
  },

  // Área central donde cambia el contenido de las pestañas
  main: {
    flex: 1,
    overflowY: 'auto',
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },

  // Centrado para pantallas de carga o error
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#0f1015',
    color: '#ffffff',
    padding: '20px',
    textAlign: 'center'
  },

  // Spinner de carga animado o estático
  loader: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTop: '4px solid #4CAF50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Cabecera del perfil de usuario
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#181920',
    padding: '14px',
    borderRadius: '12px',
    marginBottom: '15px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },

  profileAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #4CAF50'
  },

  profileName: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 2px 0',
    color: '#ffffff'
  },

  profileId: {
    fontSize: '12px',
    color: '#888888',
    margin: 0
  },

  // Tarjeta principal de saldo
  cardBalance: {
    backgroundColor: '#181920',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  },

  // Inputs y formularios
  input: {
    width: '100%',
    backgroundColor: '#121318',
    border: '1px solid #2a2b36',
    borderRadius: '10px',
    padding: '12px 15px',
    color: '#ffffff',
    fontSize: '15px',
    marginTop: '6px',
    marginBottom: '12px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s'
  },

  // Botones principales y de acción
  btnGreen: {
    backgroundColor: '#4CAF50',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
    transition: 'opacity 0.2s'
  },

  btnWhite: {
    backgroundColor: '#ffffff',
    color: '#0f1015',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center'
  },

  btnOutline: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid #3a3b46',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center'
  },

  // Barra de navegación inferior fija estilo Telegram Mini App
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#14151a',
    borderTop: '1px solid #22232c',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    maxWidth: '480px',
    margin: '0 auto'
  },

  navItem: {
    flex: 1,
    textAlign: 'center',
    fontSize: '12px',
    color: '#777884',
    cursor: 'pointer',
    padding: '8px 0',
    fontWeight: '500'
  },

  navItemActive: {
    flex: 1,
    textAlign: 'center',
    fontSize: '12px',
    color: '#4CAF50',
    cursor: 'pointer',
    padding: '8px 0',
    fontWeight: 'bold'
  },

  errorText: {
    color: '#ff4444',
    fontSize: '14px',
    lineHeight: '1.4'
  }
};
