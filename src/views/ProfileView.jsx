import React from 'react';
import { s } from '../styles/appStyles';

export default function PortfolioView() {
  return (
    <div className="fade-in" style={s.center}>
      <h3 style={s.h3}>Gestión de Portafolio</h3>
      <p style={s.textMuted}>Aquí irán las reinversiones y retiros.</p>
    </div>
  );
}
