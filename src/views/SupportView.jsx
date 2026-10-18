import React, { useState } from 'react';
import { s } from '../styles/appStyles';
import { botApi } from '../api/botApi';
import toast from 'react-hot-toast';
import WebApp from '@twa-dev/sdk';

// Idiomas automáticos
const translations = {
  es: {
    title: "Soporte Técnico",
    desc: "¿Tienes algún problema? Envíanos un ticket y te ayudaremos lo antes posible.",
    category: "CATEGORÍA DEL PROBLEMA",
    catDeposit: "Problema con Depósito",
    catWithdraw: "Problema con Retiro",
    catBug: "Error en la Aplicación",
    catOther: "Otra consulta",
    message: "TU MENSAJE",
    placeholder: "Describe tu problema o duda en detalle...",
    sendBtn: "ENVIAR TICKET",
    sending: "Enviando...",
    msgSuccess: "Ticket enviado con éxito. Te contactaremos pronto.",
    msgError: "Error al enviar el ticket",
    msgEmpty: "Por favor, escribe un mensaje explicando tu problema."
  },
  en: {
    title: "Technical Support",
    desc: "Having an issue? Send us a ticket and we will help you as soon as possible.",
    category: "ISSUE CATEGORY",
    catDeposit: "Deposit Issue",
    catWithdraw: "Withdrawal Issue",
    catBug: "App Bug",
    catOther: "Other inquiry",
    message: "YOUR MESSAGE",
    placeholder: "Describe your issue or question in detail...",
    sendBtn: "SEND TICKET",
    sending: "Sending...",
    msgSuccess: "Ticket sent successfully. We will contact you soon.",
    msgError: "Error sending ticket",
    msgEmpty: "Please write a message explaining your issue."
  }
};

const IconChevron = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

export default function SupportView({ userData }) {
  const userLang = WebApp.initDataUnsafe?.user?.language_code === 'en' ? 'en' : 'es';
  const t = translations[userLang];

  const [category, setCategory] = useState('Deposit');
  const [showDrop, setShowDrop] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getCategoryName = (cat) => {
    if(cat === 'Deposit') return t.catDeposit;
    if(cat === 'Withdraw') return t.catWithdraw;
    if(cat === 'Bug') return t.catBug;
    return t.catOther;
  };

  const handleSend = async () => {
    if (!message.trim()) {
      try { if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred('error'); } catch(e){}
      return toast.error(t.msgEmpty);
    }

    try { if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred('heavy'); } catch(e){}
    setIsSending(true);
    const toastId = toast.loading(t.sending);

    try {
      const username = WebApp.initDataUnsafe?.user?.username || '';
      const res = await botApi.sendSupportTicket(userData?.id, username, getCategoryName(category), message);

      if (res && res.success) {
        toast.success(t.msgSuccess, { id: toastId });
        setMessage(''); // Limpiar caja
      } else {
        toast.error(t.msgError, { id: toastId });
      }
    } catch (error) {
      toast.error(t.msgError, { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ ...s.h1, marginBottom: '8px' }}>{t.title}</h2>
      <p style={{ ...s.textMuted, marginBottom: '24px' }}>{t.desc}</p>

      <div style={s.card}>
        <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>{t.category}</label>
        
        <div style={{ position: 'relative', marginBottom: '20px', marginTop: '6px' }}>
          <div 
            onClick={() => setShowDrop(!showDrop)}
            style={{ backgroundColor: '#0B1220', border: '1px solid #243247', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#F1F5F9' }}
          >
            <span style={{ fontWeight: 'bold' }}>{getCategoryName(category)}</span>
            <div style={{ transform: showDrop ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', color: '#94A3B8' }}>
              <IconChevron />
            </div>
          </div>
          
          {showDrop && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#111C2E', border: '1px solid #2DD4BF', borderRadius: '12px', marginTop: '8px', zIndex: 10, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div onClick={() => { setCategory('Deposit'); setShowDrop(false); }} style={{ padding: '14px 16px', borderBottom: '1px solid #243247', cursor: 'pointer', color: '#F1F5F9' }}>{t.catDeposit}</div>
              <div onClick={() => { setCategory('Withdraw'); setShowDrop(false); }} style={{ padding: '14px 16px', borderBottom: '1px solid #243247', cursor: 'pointer', color: '#F1F5F9' }}>{t.catWithdraw}</div>
              <div onClick={() => { setCategory('Bug'); setShowDrop(false); }} style={{ padding: '14px 16px', borderBottom: '1px solid #243247', cursor: 'pointer', color: '#F1F5F9' }}>{t.catBug}</div>
              <div onClick={() => { setCategory('Other'); setShowDrop(false); }} style={{ padding: '14px 16px', cursor: 'pointer', color: '#F1F5F9' }}>{t.catOther}</div>
            </div>
          )}
        </div>

        <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 'bold' }}>{t.message}</label>
        <textarea 
          style={{ ...s.input, minHeight: '120px', resize: 'none', marginTop: '6px', marginBottom: '24px', paddingTop: '12px' }} 
          placeholder={t.placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button 
          onClick={handleSend}
          disabled={isSending}
          style={{ ...s.btnMain, opacity: isSending ? 0.7 : 1, boxShadow: '0 0 15px rgba(45, 212, 191, 0.3)' }}
        >
          {isSending ? t.sending : t.sendBtn}
        </button>
      </div>
    </div>
  );
}
