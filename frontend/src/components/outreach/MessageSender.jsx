import { useState } from 'react';
import { API_URL } from '../../lib/api.js';

export const MessageSender = ({ lead, onSent }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  const handleSend = async () => {
    if (!lead?.email) {
      setStatus('❌ Lead has no email address');
      return;
    }
    if (!subject || !message) {
      setStatus('❌ Subject and message are required');
      return;
    }

    setSending(true);
    setStatus('');

    try {
      const response = await fetch(`${API_URL}/api/outreach/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: lead.email,
          subject: subject,
          html: message.replace(/\n/g, '<br>'),
          from: 'Alpha Agency <onboarding@resend.dev>'
        })
      });
      const data = await response.json();
      if (data.success) {
        setStatus('✅ Email sent successfully!');
        if (onSent) onSent(lead, subject, message);
      } else {
        setStatus('❌ Failed to send: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass p-6">
      <h3 className="text-xl font-bold text-white">📧 Send Outreach</h3>
      {lead ? (
        <>
          <p className="text-gray-400 text-sm mt-1">To: <span className="text-white">{lead.name || 'Unknown'} ({lead.email || 'No email'})</span></p>
          
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 mt-3 bg-white/10 text-white rounded-lg border border-white/10 focus:border-gold"
          />
          <textarea
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full p-3 mt-3 bg-white/10 text-white rounded-lg border border-white/10 focus:border-gold"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSend}
              disabled={sending || !lead.email}
              className="btn-primary px-6 py-2"
            >
              {sending ? 'Sending...' : '✉️ Send Email'}
            </button>
          </div>
          {status && <p className="mt-3 text-sm">{status}</p>}
        </>
      ) : (
        <p className="text-gray-400 text-sm mt-2">Select a lead from your saved list to send a message.</p>
      )}
    </div>
  );
};