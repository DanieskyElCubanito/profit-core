import React, { useState, useEffect, useRef } from 'react';
import { s } from '../styles/appStyles';
import { botApi } from '../api/botApi';
import { supabase } from '../api/supabase'; // Conexión a la BD
import WebApp from '@twa-dev/sdk';
import toast from 'react-hot-toast';

const IconSend = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconSupportAvatar = () => <svg width="24" height="24" fill="none" stroke="#0B1220" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;

export default function SupportView({ userData }) {
  const userLang = WebApp.initDataUnsafe?.user?.language_code === 'en' ? 'en' : 'es';
  const isEs = userLang === 'es';
  
  // Asegurarnos de que el ID del usuario sea texto para la BD
  const userId = userData?.id?.toString() || '000000000'; 

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // 1. CARGAR HISTORIAL Y ESCUCHAR EN TIEMPO REAL
  useEffect(() => {
    if (userId === '000000000') return;

    // Función para traer mensajes viejos
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        // Mensaje de bienvenida si el chat está vacío
        setMessages([{ id: 'welcome', sender: 'bot', text: isEs ? '¡Hola! 👋 ¿En qué podemos ayudarte hoy?' : 'Hello! 👋 How can we help you today?' }]);
      }
    };

    fetchMessages();

    // Suscripción en Tiempo Real: Si tú respondes en la BD, aparece mágicamente aquí
    const subscription = supabase
      .channel('chat-usuario')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${userId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [userId, isEs]);

  // Hacer scroll abajo cada vez que cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const safeHaptic = (style = 'light') => {
    try { if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred(style); } catch (e) {}
  };

  // 2. ENVIAR MENSAJE A SUPABASE
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;
    
    safeHaptic('medium');
    const textMsg = inputValue.trim();
    setInputValue(''); // Limpiar visualmente rápido
    setIsSending(true);

    try {
      // Guardar en la Base de Datos
      const { error } = await supabase
        .from('support_messages')
        .insert([{ user_id: userId, sender: 'user', text: textMsg }]);

      if (error) throw error;

      // Avisarte a Telegram en secreto para que te enteres
      const username = WebApp.initDataUnsafe?.user?.username || 'Usuario';
      await botApi.sendSupportTicket(userId, username, 'Chat en Vivo', textMsg);

    } catch (error) {
      toast.error(isEs ? "Error al enviar" : "Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (isoString) => {
    if(!isoString) return new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#111C2E', borderRadius: '16px 16px 0 0', borderBottom: '1px solid #243247' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#2DD4BF', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <IconSupportAvatar />
        </div>
        <div>
          <h3 style={{ margin: 0, color: '#F1F5F9', fontSize: '16px' }}>{isEs ? 'Soporte Técnico' : 'Support Team'}</h3>
          <p style={{ margin: 0, color: '#22C55E', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#22C55E', borderRadius: '50%', display: 'inline-block' }}></span>
            {isEs ? 'Conectado' : 'Online'}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#0B1220', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              maxWidth: '80%', 
              padding: '12px 16px', 
              borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
              backgroundColor: msg.sender === 'user' ? '#2DD4BF' : '#1E293B',
              color: msg.sender === 'user' ? '#0B1220' : '#F1F5F9',
              fontSize: '14px',
              lineHeight: '1.4',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {msg.text}
            </div>
            <span style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>{formatTime(msg.created_at)}</span>
          </div>
        ))}
        {isSending && (
          <div style={{ alignSelf: 'flex-end', fontSize: '12px', color: '#2DD4BF', fontStyle: 'italic', marginTop: '-8px' }}>
            {isEs ? 'Enviando...' : 'Sending...'}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '12px 16px', backgroundColor: '#111C2E', borderRadius: '0 0 16px 16px', borderTop: '1px solid #243247', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder={isEs ? "Escribe un mensaje..." : "Type a message..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          style={{ flex: 1, backgroundColor: '#0B1220', border: '1px solid #243247', borderRadius: '24px', padding: '12px 16px', color: '#F1F5F9', fontSize: '14px', outline: 'none' }}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isSending}
          style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: inputValue.trim() ? '#2DD4BF' : '#243247', color: '#0B1220', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: inputValue.trim() ? 'pointer' : 'not-allowed', transition: '0.2s' }}
        >
          <IconSend />
        </button>
      </div>

    </div>
  );
}
