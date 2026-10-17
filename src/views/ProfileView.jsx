import React from 'react';
import { s } from '../styles/appStyles';

export default function ProfileView({ userData }) {
  return (
    <div className="fade-in" style={s.center}>
      <img src={userData?.photo_url} style={{ width: '80px', borderRadius: '50%', border: '2px solid #2DD4BF', marginBottom: '16px' }} alt="Avatar" />
      <h3 style={s.h3}>{userData?.username}</h3>
      <p style={s.textMuted}>ID: {userData?.id}</p>
    </div>
  );
}
