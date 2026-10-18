import React, { useState } from 'react';
import { s } from '../styles/appStyles';
import { botApi } from '../api/botApi';
import { supabase } from '../api/supabase'; // Importamos tu base de datos
import toast from 'react-hot-toast';
import WebApp from '@twa-dev/sdk';

export default function AdminView() {
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleReply = async () => {
    if (!userId || !message) {
      try { if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred('error'); } catch(e){}
      return toast.error("Completa el ID y el mensaje");
    }

    try { if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred('heavy'); } catch(e){}
    setIsSending(true);
    const toastId = toast.loading("Enviando respuesta...");

    try {
      // 1. Guardar la respuesta en Supabase para que aparezca en la Mini App del usuario
      const { error } = await supabase
        .from('support_messages')
        .insert([{ user_id: userId.trim(), sender: 'bot', text: message }]);

      if (error) throw error;

      // 2. Enviarle también una notificación por Telegram por si cerró la app
      await botApi.replyToUser(userId.trim(), message);

      toast.success("Respuesta enviada al chat del usuario", { id: toastId });
      setUserId(''); // Limpiamos el ID
      setMessage(''); // Limpiamos el mensaje
      
    } catch (error) {
      toast.error("Error al enviar respuesta: " + error.message, { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ ...s.h1, marginBottom: '8px', color: '#F59E0B' }}>Panel de Control (Admin)</h2>
      <p style={{ ...s.textMuted, marginBottom: '24px' }}>Responde tickets. El usuario verá tu respuesta directamente en su chat de la Mini App.</p>

      <div style={{ ...s.card, border: '1px solid #F59E0B' }}>
        <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>ID DEL USUARIO</label>
        <input 
          type="text" 
          style={{ ...s.input, marginTop: '6px', marginBottom: '20px' }} 
          placeholder="Ej: 8968109534" 
          value={userId} 
          onChange={e => setUserId(e.target.value)} 
        />
        
        <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>TU RESPUESTA</label>
        <textarea 
          style={{ ...s.input, minHeight: '120px', resize: 'none', marginTop: '6px', marginBottom: '24px', paddingTop: '12px' }} 
          placeholder="Escribe la solución al problema..." 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
        />

        <button 
          onClick={handleReply} 
          disabled={isSending} 
          style={{ ...s.btnMain, backgroundColor: '#F59E0B', color: '#0B1220', opacity: isSending ? 0.7 : 1, boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)' }}
        >
          {isSending ? 'ENVIANDO...' : 'ENVIAR RESPUESTA'}
        </button>
      </div>
    </div>
  );
}
