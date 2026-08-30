import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/api';

const defaultPosts = [
  { id: '01', platform: 'LinkedIn', type: 'Announcement', typeColor: 'bg-[#EDE9FF] text-[#5E17EB]', content: 'Launch announcement: Acme Innovations introduces new AI workflow automation to save teams 10hrs/week →' },
  { id: '02', platform: 'WhatsApp', type: 'Teaser', typeColor: 'bg-[#DCFCE7] text-[#166534]', content: 'Teaser: Something big is coming this week. Want early access? Reply "YES" to join the waitlist →' },
  { id: '03', platform: 'Telegram', type: 'Intro', typeColor: 'bg-[#DBEAFE] text-[#1E40AF]', content: 'Intro: Meet the team behind the product. Why we built this for agencies like yours →' },
  { id: '04', platform: 'LinkedIn', type: 'Educational', typeColor: 'bg-[#EDE9FF] text-[#5E17EB]', content: 'Educational: How the 10-post system drives 3x engagement without extra ad spend →' },
  { id: '05', platform: 'WhatsApp', type: 'Testimonial', typeColor: 'bg-[#DCFCE7] text-[#166534]', content: 'Testimonial: "We got 5 new leads in 48h after the campaign." — Client feedback →' },
  { id: '06', platform: 'Telegram', type: 'Poll', typeColor: 'bg-[#DBEAFE] text-[#1E40AF]', content: 'Poll: What\'s your biggest marketing challenge? A) Content • B) Leads • C) Retention →' },
  { id: '07', platform: 'LinkedIn', type: 'Case Study', typeColor: 'bg-[#EDE9FF] text-[#5E17EB]', content: 'Case Study: How we helped a SaaS company cut onboarding time by 60% using automated posts →' },
  { id: '08', platform: 'WhatsApp', type: 'Tip', typeColor: 'bg-[#DCFCE7] text-[#166534]', content: 'Tip: 3 quick ways to keep clients engaged on WhatsApp without spamming →' },
  { id: '09', platform: 'Telegram', type: 'Promo', typeColor: 'bg-[#DBEAFE] text-[#1E40AF]', content: 'Promo: Limited spots — 20% off setup if you join this week. Ends Friday →' },
  { id: '10', platform: 'LinkedIn', type: 'Recap', typeColor: 'bg-[#EDE9FF] text-[#5E17EB]', content: 'Recap: Week 1 results + what\'s next. Full performance summary drops tomorrow →' },
];

const platformIcon = (platform) => {
  if (platform === 'LinkedIn') return <div className="w-6 h-6 bg-[#0A66C2] rounded-full flex items-center justify-center shrink-0"><span className="text-white text-[11px] font-bold">in</span></div>;
  if (platform === 'WhatsApp') return <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.55 2 2.07 6.47 2.07 11.95c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.82 9.82 0 0 0 4.78 1.22h.01c5.48 0 9.95-4.47 9.95-9.95 0-2.66-1.03-5.15-2.94-7.04zm-7.02 14.5h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24z"/></svg></div>;
  return <div className="w-6 h-6 bg-[#229ED9] rounded-full flex items-center justify-center shrink-0"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg></div>;
};

export const Campaigns = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [companyName, setCompanyName] = useState('Acme Innovations');
  const [industry, setIndustry] = useState('SaaS / Technology');
  const [clientCount, setClientCount] = useState('24');
  const [posts, setPosts] = useState(defaultPosts);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePosts = async () => {
    if (!companyName.trim() || !industry.trim()) { setError('Company name and industry required'); return; }
    setLoading(true); setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/campaigns/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, credentials: 'include',
        body: JSON.stringify({ companyName: companyName.trim(), industry: industry.trim(), clientCount: parseInt(clientCount)||10, tone: 'professional' })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.posts) && data.posts.length>0) {
        setPosts(data.posts.map((post, idx) => ({ id: String(idx+1).padStart(2,'0'), platform: post.platform || ['LinkedIn','WhatsApp','Telegram'][idx%3], type: post.type || 'Post', typeColor: post.typeColor || 'bg-[#EDE9FF] text-[#5E17EB]', content: post.content || post.text || '' })));
      } else if (data.posts) {
        setPosts(data.posts.map((p,i)=>({ id:String(i+1).padStart(2,'0'), platform:p.platform||'LinkedIn', type:p.type||'Post', typeColor:'bg-[#EDE9FF] text-[#5E17EB]', content:p.content||p.text||'' })));
      } else { setError(data.error || 'Failed to generate. Check GROQ_API_KEY.'); }
    } catch (e) { setError(e.message || 'Generation failed'); } finally { setLoading(false); }
  };

  const copyToClipboard = (content) => { navigator.clipboard.writeText(content); };
  const startEdit = (post) => { setEditingId(post.id); setEditContent(post.content); };
  const saveEdit = () => { setPosts(posts.map(p => p.id===editingId ? { ...p, content: editContent } : p)); setEditingId(null); };
  const exportCSV = () => {
    const csv = `#,Platform,Post Type,Content\n` + posts.map(p => `${p.id},${p.platform},${p.type},"${p.content.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`campaign-${companyName.replace(/\s+/g,'-')}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] font-['Inter',sans-serif] pb-8">
      <div className="bg-white border-b border-[#EDEDED] sticky top-0 z-10">
        <div className="max-w-[1120px] mx-auto px-3 sm:px-4 h-[56px] flex items-center justify-between gap-2">
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 border border-[#E5E7EB] rounded-full px-3 py-1.5 text-[13px] font-medium bg-white hover:bg-[#F9FAFB]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg> Back</button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#5E17EB] rounded-lg flex items-center justify-center text-white text-[12px]">✦</div>
            <span className="text-[15px] font-black">Campaigns</span>
            <span className="hidden sm:inline text-[11px] font-bold bg-[#F0EFFF] text-[#5E17EB] border border-[#DDD6FE] px-2 py-1 rounded-full">MONEY MAKER</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-3 sm:px-4">
        <div className="mt-6 text-center md:text-left">
          <h1 className="text-[26px] md:text-[34px] font-black tracking-[-0.02em]">10 Posts System <span className="text-[#5E17EB]">— 1 Week</span></h1>
          <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="bg-white border border-[#EDEDED] rounded-full px-3 py-1.5 text-[12px] font-semibold">10 posts</span>
            <span className="bg-white border border-[#EDEDED] rounded-full px-3 py-1.5 text-[12px] font-semibold">3 platforms</span>
            <span className="bg-[#5E17EB] text-white rounded-full px-3 py-1.5 text-[12px] font-bold">$250 Founding <span className="line-through opacity-60 ml-1">$500</span></span>
          </div>
        </div>

        <div className="mt-6 bg-white border border-[#EDEDED] rounded-2xl p-4 md:p-6">
          <h2 className="text-[14px] font-black flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-[#F0EFFF] text-[#5E17EB] flex items-center justify-center text-[12px]">✦</span> Campaign Inputs</h2>
          {error && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-[13px]">{error}</div>}
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            <div><label className="text-[12px] font-bold">Company Name</label><input value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="e.g., Acme Innovations" className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-[13px] focus:border-[#5E17EB] focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/10" /></div>
            <div><label className="text-[12px] font-bold">Industry</label><input value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="e.g., SaaS" className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-[13px] focus:border-[#5E17EB] focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/10" /></div>
            <div><label className="text-[12px] font-bold">Clients Count</label><input value={clientCount} onChange={e=>setClientCount(e.target.value)} placeholder="24" className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-[13px] focus:border-[#5E17EB] focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/10" /></div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={generatePosts} disabled={loading} className="bg-[#5E17EB] hover:bg-[#4E0FD1] text-white rounded-xl px-5 py-2.5 text-[13px] font-bold disabled:opacity-50 flex items-center gap-2">
              {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              {loading ? 'Generating via Groq 120B...' : '✨ Generate with Groq 120B'}
            </button>
            <button onClick={exportCSV} className="border bg-white rounded-xl px-4 py-2.5 text-[13px] font-semibold hover:bg-[#F9FAFB]">Export CSV</button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-black">10-Post Engine</h2>
            <span className="text-[11px] font-bold bg-[#F0EFFF] text-[#5E17EB] border border-[#DDD6FE] px-2 py-1 rounded-full">{posts.length} posts</span>
            <span className="ml-auto text-[11px] text-[#6B7280] hidden sm:inline">Estimated reach: 12.5k</span>
          </div>

          <div className="hidden md:block mt-3 bg-white border border-[#EDEDED] rounded-2xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead className="bg-[#F9FAFB] border-b text-[11px] font-bold text-[#6B7280] uppercase tracking-wide"><tr><th className="px-3 py-2.5 text-center w-10">#</th><th className="px-3 py-2.5 text-left">Platform</th><th className="px-3 py-2.5 text-left">Type</th><th className="px-3 py-2.5 text-left">Content</th><th className="px-3 py-2.5 text-left w-[140px]">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {posts.map(post=>(
                  <tr key={post.id} className="hover:bg-[#FFFCF8]">
                    <td className="px-3 py-3 text-center text-[#9CA3AF] font-medium">{post.id}</td>
                    <td className="px-3 py-3"><div className="flex items-center gap-2">{platformIcon(post.platform)}<span className="font-semibold text-[12px]">{post.platform}</span></div></td>
                    <td className="px-3 py-3"><span className={`text-[11px] font-bold px-2 py-1 rounded-full ${post.typeColor}`}>{post.type}</span></td>
                    <td className="px-3 py-3 max-w-[420px]">
                      {editingId===post.id ? (
                        <div className="flex gap-2"><input value={editContent} onChange={e=>setEditContent(e.target.value)} className="flex-1 border border-[#5E17EB] rounded-lg px-2 py-1.5 text-[12px] focus:outline-none" /><button onClick={saveEdit} className="bg-[#5E17EB] text-white px-3 py-1 rounded-lg text-[11px] font-bold">Save</button><button onClick={()=>setEditingId(null)} className="border px-3 py-1 rounded-lg text-[11px]">Cancel</button></div>
                      ) : <span className="leading-snug line-clamp-2">{post.content}</span>}
                    </td>
                    <td className="px-3 py-3"><div className="flex gap-1.5"><button onClick={()=>copyToClipboard(post.content)} className="border rounded-lg px-2.5 py-1.5 text-[11px] font-semibold bg-white hover:bg-[#F9FAFB]">Copy</button><button onClick={()=>{setEditingId(post.id); setEditContent(post.content);}} className="bg-[#0A0A0A] text-white rounded-lg px-2.5 py-1.5 text-[11px] font-bold">Edit</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden mt-3 space-y-3">
            {posts.map(post=>(
              <div key={post.id} className="bg-white border border-[#EDEDED] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2">{platformIcon(post.platform)}<span className="text-[12px] font-bold">{post.platform}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${post.typeColor}`}>{post.type}</span></div><span className="text-[11px] text-[#9CA3AF]">#{post.id}</span></div>
                {editingId===post.id ? (
                  <div className="space-y-2"><textarea value={editContent} onChange={e=>setEditContent(e.target.value)} rows={3} className="w-full border border-[#5E17EB] rounded-xl p-3 text-[13px]"/><div className="flex gap-2"><button onClick={saveEdit} className="flex-1 bg-[#5E17EB] text-white rounded-xl py-2 text-[12px] font-bold">Save</button><button onClick={()=>setEditingId(null)} className="flex-1 border rounded-xl py-2 text-[12px] font-bold">Cancel</button></div></div>
                ) : (
                  <>
                    <p className="text-[13px] leading-[1.6] break-words">{post.content}</p>
                    <div className="mt-3 flex gap-2"><button onClick={()=>copyToClipboard(post.content)} className="flex-1 border rounded-xl py-2 text-[12px] font-bold">Copy</button><button onClick={()=>{setEditingId(post.id); setEditContent(post.content);}} className="flex-1 bg-[#0A0A0A] text-white rounded-xl py-2 text-[12px] font-bold">Edit</button></div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

