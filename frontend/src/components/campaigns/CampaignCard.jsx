const statusStyle = {
  draft: 'bg-white/10 text-white/50 border-white/10',
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  paused: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  completed: 'bg-white text-[#0B0215] border-white',
};

export const CampaignCard = ({ campaign, onAction }) => {
  const s = (campaign.status || 'draft').toLowerCase();
  return (
    <div className="mature-card rounded-[16px] p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black tracking-tight text-white leading-none">{campaign.name}</h3>
          <p className="text-xs text-white/35 mt-1">
            {(campaign.niche || '—')} • {(campaign.target_city || campaign.targetCity || '—')} {campaign.budget ? `• $${Number(campaign.budget).toLocaleString()}` : ''}
          </p>
          {campaign.client_id && <p className="text-[11px] text-white/20">Client: {campaign.client_id}</p>}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-widest uppercase border ${statusStyle[s] || statusStyle.draft}`}>{s}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4">
        {[
          ['Leads', campaign.leads_found ?? campaign.leadsFound ?? 0],
          ['Sent', campaign.messages_sent ?? campaign.messagesSent ?? 0],
          ['Replies', campaign.replies_received ?? campaign.repliesReceived ?? 0],
          ['Rev', `$${Number(campaign.revenue_generated ?? campaign.revenueGenerated ?? 0).toLocaleString()}`],
        ].map(([k,v])=>(
          <div key={k} className="bg-[#0B0215] border border-white/5 rounded-xl p-2.5 text-center">
            <div className="eyebrow text-white/25">{k}</div>
            <div className="font-black text-white text-sm mt-1">{v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {s==='draft' && <button onClick={()=> onAction?.('start', campaign)} className="flex-1 bg-white text-[#0B0215] py-2 rounded-full font-black text-xs tracking-widest uppercase">Start</button>}
        {s==='active' && <button onClick={()=> onAction?.('pause', campaign)} className="flex-1 bg-amber-400 text-[#0B0215] py-2 rounded-full font-black text-xs tracking-widest uppercase">Pause</button>}
        {(s==='active' || s==='paused') && <button onClick={()=> onAction?.('complete', campaign)} className="flex-1 bg-emerald-500 text-white py-2 rounded-full font-black text-xs tracking-widest uppercase">Complete</button>}
        <button onClick={()=> onAction?.('delete', campaign)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs">Delete</button>
        <button onClick={()=> onAction?.('automation', campaign)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">Automate</button>
      </div>

      <div className="text-[11px] text-white/20 mt-3">Created {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : ''} {campaign.created_by ? `• ${String(campaign.created_by).slice(0,8)}` : ''}</div>
    </div>
  );
};

export default CampaignCard;
