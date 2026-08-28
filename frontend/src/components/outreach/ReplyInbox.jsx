import { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api.js';

export const ReplyInbox = ({ leadId }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReplies();
  }, [leadId]);

  const fetchReplies = async () => {
    setLoading(true);
    try {
      const params = leadId ? `?leadId=${encodeURIComponent(leadId)}` : '';
      // Try primary /api/replies
      let response = await fetch(`${API_URL}/api/replies${params}`);
      let data = await response.json().catch(() => null);
      // Handle both { success:true, replies } and plain array
      if (Array.isArray(data)) {
        setReplies(data);
      } else if (data && Array.isArray(data.replies)) {
        setReplies(data.replies);
      } else if (data && data.success && Array.isArray(data.replies)) {
        setReplies(data.replies);
      } else {
        // fallback to /api/outreach/replies
        response = await fetch(`${API_URL}/api/outreach/replies${params}`);
        data = await response.json().catch(() => null);
        if (Array.isArray(data)) setReplies(data);
        else if (data && Array.isArray(data.replies)) setReplies(data.replies);
        else setReplies([]);
      }
    } catch (error) {
      console.error('Failed to fetch replies:', error);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="glass p-6 text-center text-white/40">Loading replies...</div>;
  }

  if (replies.length === 0) {
    return (
      <div className="glass p-6 text-center">
        <p className="text-white/40">📭 No replies yet. Send outreach to start getting responses.</p>
      </div>
    );
  }

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">📬 Inbox ({replies.length})</h3>
        <button onClick={fetchReplies} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Refresh</button>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {replies.map((reply) => (
          <div key={reply.id} className="glass p-4 border border-white/5 hover:border-gold/30 transition">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-gold font-bold truncate">From: {reply.from || reply.email || 'Unknown'}</p>
                <p className="text-gray-300 text-sm mt-1 whitespace-pre-wrap break-words">{reply.content || reply.snippet || reply.message || ''}</p>
                <p className="text-gray-500 text-xs mt-2">{reply.received_at ? new Date(reply.received_at).toLocaleString() : reply.created_at ? new Date(reply.created_at).toLocaleString() : reply.time || ''}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 shrink-0">New</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReplyInbox;
