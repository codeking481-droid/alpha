import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../lib/api';

const defaultPosts = [
  { id: '01', platform: 'LinkedIn', type: 'Announcment', typeColor: 'bg-[#EDE9FF] text-[#5E17EB]', content: 'Launch announcement: Acme Innovations introduces new AI workflow automation to save teams 10hrs/week →' },
  { id: '02', platform: 'WhatsApp', type: 'Teaser', typeColor: 'bg-[#DCFCE7] text-[#166534]', content: 'Teaser: Something big is coming this week. Want early access? Reply "YES" to join the waitlist →' },
  { id: '03', platform: 'Telegram', type: 'Intro', typeColor: 'bg-[#DBEAFE] text-[#1E40AF]', content: 'Intro: Meet the team behind the product. Why we built this for agencies like yours →' },
  { id: '04', platform: 'LinkedIn', type: 'Educational', typeColor: 'bg-[#EDE9FF] text-[#5E17EB]', content: 'Educational: How the 10-post system drives 3x engagement without extra ad spend →' },
  { id: '05', platform: 'WhatsApp', type: 'Testimonial', typeColor: 'bg-[#DCFCE7] text-[#166534]', content: 'Testimonial: "We got 5 new leads in 48h after the campaign." — Client feedback →' },
  { id: '06', platform: 'Telegram', type: 'Poll', typeColor: 'bg-[#DBEAFE] text-[#1E40AF]', content: 'Poll: What\'s your biggest marketing challenge? A) Content • B) Leads • C) Retention →' },
  { id: '07', platform: 'LinkedIn', type: 'Case Study', typeColor: 'bg-[#EDE9FF] text-[#5E17EB]', content: 'Case Study: How we helped a SaaS company cut onboarding time by 60% using automated posts →' },
  { id: '08', platform: 'WhatsApp', type: 'Tip', typeColor: 'bg-[#DCFCE7] text-[#166534]', content: 'Tip: 3 quick ways to keep clients engaged on WhatsApp without spamming →' },
  { id: '09', platform: 'Telegram', type: 'Promo', typeColor: 'bg-[#DBEAFE] text-[#1E40AF]', content: 'Promo: Limited spots available — 20% off setup if you join this week. Ends Friday →' },
  { id: '10', platform: 'LinkedIn', type: 'Recap', typeColor: 'bg-[#EDE9FF] text-[#5E17EB]', content: 'Recap: Week 1 results + what\'s next. Full performance summary drops tomorrow →' },
];

const platformIcon = (platform) => {
  if (platform === 'LinkedIn') return <div className="w-6 h-6 bg-[#0A66C2] rounded-full flex items-center justify-center shrink-0"><span className="text-white text-[11px] font-bold">in</span></div>;
  if (platform === 'WhatsApp') return <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.55 2 2.07 6.47 2.07 11.95c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.82 9.82 0 0 0 4.78 1.22h.01c5.48 0 9.95-4.47 9.95-9.95 0-2.66-1.03-5.15-2.94-7.04zm-7.02 14.5h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24z"/></svg></div>;
  return <div className="w-6 h-6 bg-[#229ED9] rounded-full flex items-center justify-center shrink-0"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg></div>;
};

export const Campaigns = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('Acme Innovations');
  const [industry, setIndustry] = useState('SaaS / Technology');
  const [clientCount, setClientCount] = useState('24');
  const [posts, setPosts] = useState(defaultPosts);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePosts = async () => {
    if (!companyName || !industry) {
      setError('Please enter company name and industry');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/campaigns/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          companyName: companyName,
          industry: industry,
          clientCount: parseInt(clientCount) || 10,
          tone: 'professional'
        })
      });

      const data = await res.json();

      if (data.success && data.posts) {
        setPosts(data.posts.map((post, idx) => ({
          id: String(idx + 1).padStart(2, '0'),
          ...post
        })));
      } else {
        setError(data.error || 'Failed to generate posts');
      }
    } catch (e) {
      setError(e.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setEditContent(post.content);
  };

  const saveEdit = () => {
    setPosts(posts.map(p => p.id === editingId ? { ...p, content: editContent } : p));
    setEditingId(null);
  };

  const exportCSV = () => {
    const csv = `#,Platform,Post Type,Content\n` + posts.map(p => `${p.id},${p.platform},${p.type},"${p.content.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${companyName.replace(/\s+/g,'-')}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#FFF7F0] md:bg-[#FFFCF8] font-['Inter',sans-serif] pb-20">
      {/* Top nav */}
      <div className="bg-[#FFFDF9] md:bg-white border-b border-[#EDEDED] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[1120px] mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 border border-[#0A0A0A] rounded-lg px-3 py-1.5 text-[13px] font-medium text-[#0A0A0A] bg-white hover:bg-[#FAFAFA]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5E17EB] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z"/></svg>
            </div>
            <span className="text-[18px] font-bold tracking-tight text-[#0A0A0A]">Alpha Agency</span>
            <span className="hidden sm:inline bg-[#EDE9FF] text-[#5E17EB] text-[12px] font-medium px-3 py-1 rounded-full">the money maker</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[#0A0A0A]"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 8A6 6 0 0 0 6 8c0 7-6 9-6 9h16s-6-2-6-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
            <div className="w-8 h-8 bg-[#EDE9FF] rounded-full flex items-center justify-center text-[#5E17EB] text-[12px] font-bold">AA</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4">
        {/* Title */}
        <div className="text-center md:text-left mt-6">
          <h1 className="text-[28px] md:text-[40px] font-bold tracking-tight text-[#0A0A0A] leading-tight">Campaigns - 10 Posts System</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 bg-[#EDE9FF] text-[#0A0A0A] text-[13px] font-medium px-3 py-1.5 rounded-full"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> 10 posts</span>
            <span className="inline-flex items-center gap-1.5 bg-[#EDE9FF] text-[#0A0A0A] text-[13px] font-medium px-3 py-1.5 rounded-full"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="8.6" x2="15.4" y2="15.4"/><line x1="8.6" y1="15.4" x2="15.4" y2="8.6"/></svg> 3 platforms</span>
            <span className="inline-flex items-center gap-1.5 bg-[#EDE9FF] text-[#0A0A0A] text-[13px] font-medium px-3 py-1.5 rounded-full"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h8"/></svg> 1 week</span>
            <span className="inline-flex items-center gap-1.5 bg-[#5E17EB] text-white text-[13px] font-semibold px-3 py-1.5 rounded-full">$ &nbsp;1 week • $500</span>
          </div>
        </div>

        {/* Campaign Inputs */}
        <div className="mt-6 bg-white border border-[#EDEDED] rounded-xl p-5 md:p-6 shadow-sm">
          <h2 className="text-[18px] font-bold text-[#0A0A0A] flex items-center gap-2"><span className="text-[#5E17EB]">✨</span> Campaign Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                       {error && <div className="col-span-full bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-lg">{error}</div>}
            <div>
              <label className="text-[13px] font-semibold text-[#0A0A0A]">Company Name</label>
              <div className="mt-1.5 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="8" width="18" height="12" rx="1"/><path d="M7 8V6a5 5 0 0 1 10 0v2"/><path d="M7 12h10M7 16h10"/></svg></span>
                <input value={companyName} onChange={(e)=>setCompanyName(e.target.value)} placeholder="e.g., Dangote Cement" className="w-full border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-2.5 text-[14px] text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:border-[#5E17EB] focus:outline-none bg-white" />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[#0A0A0A]">Industry</label>
              <div className="mt-1.5 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="2" y1="12" x2="22" y2="12"/></svg></span>
                <input value={industry} onChange={(e)=>setIndustry(e.target.value)} placeholder="e.g., Construction" className="w-full border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-2.5 text-[14px] text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:border-[#5E17EB] focus:outline-none bg-white" />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[#0A0A0A]">Clients Count</label>
              <div className="mt-1.5 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
                <input value={clientCount} onChange={(e)=>setClientCount(e.target.value)} placeholder="e.g., 500" className="w-full border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-2.5 text-[14px] text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:border-[#5E17EB] focus:outline-none bg-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 10-Post Engine */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] md:text-[24px] font-bold tracking-tight text-[#0A0A0A]">10-Post Engine</h2>
            <span className="bg-[#EDE9FF] text-[#5E17EB] text-[12px] font-semibold px-3 py-1 rounded-full">Draft • Ready to generate</span>
          </div>
          <p className="text-[13px] text-[#6B7280] mt-1">Review and manage the 10 posts generated for this campaign</p>

          {/* Table */}
          <div className="mt-3 bg-white border border-[#EDEDED] rounded-xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#EDEDED] text-[12px] font-semibold text-[#6B7280]">
                  <th className="text-center py-2.5 px-3 w-10">#</th>
                  <th className="text-left py-2.5 px-2">Platform</th>
                  <th className="text-left py-2.5 px-2">Post Type</th>
                  <th className="text-left py-2.5 px-2">Content</th>
                  <th className="text-left py-2.5 px-3 w-[130px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEDED]">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#FAFAFA] text-[13px]">
                    <td className="text-center py-2.5 px-3 text-[#6B7280] font-medium">{post.id}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-1.5">
                        {platformIcon(post.platform)}
                        <span className="font-medium text-[#0A0A0A] text-[13px]">{post.platform}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${post.typeColor}`}>{post.type}</span>
                    </td>
                    <td className="py-2.5 px-2 max-w-[420px]">
                      {editingId === post.id ? (
                        <div className="flex gap-2">
                          <input value={editContent} onChange={(e)=>setEditContent(e.target.value)} className="flex-1 border border-[#5E17EB] rounded-lg px-2 py-1 text-[12px] focus:outline-none" />
                          <button onClick={saveEdit} className="bg-[#5E17EB] text-white text-[11px] px-2 py-1 rounded">Save</button>
                          <button onClick={()=>setEditingId(null)} className="bg-gray-200 text-[11px] px-2 py-1 rounded">Cancel</button>
                        </div>
                      ) : (
                        <span className="text-[#0A0A0A] leading-tight line-clamp-2">{post.content}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1.5">
                        <button onClick={()=>copyToClipboard(post.content)} className="inline-flex items-center gap-1 border border-[#E5E7EB] bg-white rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[#0A0A0A] hover:bg-[#F9FAFB]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3"/></svg>
                          Copy
                        </button>
                        <button onClick={()=>startEdit(post)} className="inline-flex items-center gap-1 bg-[#5E17EB] hover:bg-[#4F0FE0] text-white rounded-lg px-2.5 py-1.5 text-[11px] font-medium">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom bar */}
          <div className="mt-4 bg-[#FFFCF8] border-t border-[#EDEDED] -mx-4 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-[13px] text-[#0A0A0A] font-medium">10 of 10 posts ready • Estimated reach: 12.5k across platforms <span className="inline-flex items-center justify-center w-4 h-4 border border-[#6B7280] rounded-full text-[10px]">i</span></span>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="inline-flex items-center gap-1.5 bg-white border border-[#0A0A0A] text-[#0A0A0A] rounded-lg px-4 py-2 text-[13px] font-medium hover:bg-[#FAFAFA]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
              <button onClick={generatePosts} disabled={loading} className={`inline-flex items-center gap-1.5 ${loading ? 'bg-[#A899D6] cursor-not-allowed' : 'bg-[#5E17EB] hover:bg-[#4F0FE0]'} text-white rounded-lg px-4 py-2 text-[13px] font-semibold`}>
                {loading && <svg width="14" height="14" className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/></svg>}
                {!loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z"/></svg>}
                {loading ? 'Generating...' : 'Generate All Posts'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};