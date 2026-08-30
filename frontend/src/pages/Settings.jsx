import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/api';

export const Settings = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [groqModel, setGroqModel] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [envStatus, setEnvStatus] = useState({ hasTelegram: false, hasGroq: false });

  useEffect(() => {
    // Load saved values
    const savedToken = localStorage.getItem('telegram_bot_token') || '';
    const savedChatId = localStorage.getItem('telegram_chat_id') || '';
    const savedModel = localStorage.getItem('groq_model') || '';
    if (savedToken) setTelegramBotToken(savedToken);
    if (savedChatId) setTelegramChatId(savedChatId);
    if (savedModel) setGroqModel(savedModel);
    // Check backend env status
    fetch(`${API_URL}/api/debug/env`).then(r=>r.json()).then(data=>{
      setEnvStatus({ hasTelegram: !!(data.envKeys||[]).includes('TELEGRAM_BOT_TOKEN'), hasGroq: !!(data.envKeys||[]).includes('GROQ_API_KEY') });
      // Try to get pricing to show groq model info
      fetch(`${API_URL}/api/community`).then(r=>r.json()).then(c=>{
        if (c.pricing) setGroqModel(prev => prev || 'llama-3.1-70b-versatile');
      }).catch(()=>{});
    }).catch(()=>{});
    // Load pricing for groq model display
    fetch(`${API_URL}/api/pricing`).then(r=>r.json()).then(d=>{
      if (d.price) console.log('Pricing loaded');
    }).catch(()=>{});
  }, []);

  const handleSaveTelegram = () => {
    localStorage.setItem('telegram_bot_token', telegramBotToken);
    localStorage.setItem('telegram_chat_id', telegramChatId);
    setTestResult('✅ Saved locally. Set in Cloudflare: npx wrangler secret put TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
  };

  const handleTestTelegram = async () => {
    setTestLoading(true); setTestResult('');
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/telegram/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        credentials: 'include',
        body: JSON.stringify({ message: testMessage || '🔥 Test HOT LEAD: Test Company (owner@test.com) replied: Interested in pricing - Check Inbox!' })
      });
      const data = await res.json();
      if (data.success) setTestResult('✅ Telegram sent! Check your chat.');
      else setTestResult('❌ ' + (data.error || 'Failed'));
    } catch (e) { setTestResult('❌ ' + e.message); }
    setTestLoading(false);
  };

  const handleSaveGroq = () => {
    localStorage.setItem('groq_model', groqModel);
    setTestResult(`✅ GROQ_MODEL saved locally as ${groqModel}. Set in Cloudflare: npx wrangler secret put GROQ_MODEL`);
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-4 sm:py-6 font-['Inter',sans-serif] overflow-x-hidden w-full">
      <div className="max-w-[760px] mx-auto w-full max-w-full">
        <div className="bg-white border border-[#EDEDED] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 flex items-center justify-between shadow-sm mb-4 sm:mb-6 gap-2">
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#F3F3F3] hover:bg-[#EBEBEB] text-[#0A0A0A] border border-[#E5E7EB] rounded-full px-3 sm:px-4 py-1.5 text-[12px] sm:text-[14px] font-medium shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="text-center flex-1 min-w-0">
            <h1 className="text-[18px] sm:text-[22px] font-black tracking-tight truncate">Settings</h1>
            <p className="text-[11px] sm:text-[12px] text-[#6B7280]">Telegram & Groq 120B</p>
          </div>
          <div className="w-12 sm:w-16 shrink-0" />
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Telegram */}
          <div className="bg-white border border-[#EDEDED] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#229ED9] rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
              </div>
              <div>
                <h2 className="text-[16px] sm:text-[18px] font-black">Telegram Hot Lead Alerts</h2>
                <p className="text-[11px] sm:text-[12px] text-[#6B7280]">Get 🔥 HOT LEAD instantly when prospect replies with interested/call/pricing/meeting</p>
              </div>
              <span className={`ml-auto text-[10px] font-black px-2 py-1 rounded-full ${envStatus.hasTelegram ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{envStatus.hasTelegram ? 'Connected' : 'Not set'}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-bold text-[#0A0A0A]">Bot Token (from @BotFather)</label>
                <input value={telegramBotToken} onChange={e=>setTelegramBotToken(e.target.value)} placeholder="123456:ABC-DEF..." className="mt-1 w-full border border-[#EDEDED] rounded-lg px-3 py-2.5 text-[13px] font-mono focus:border-[#229ED9] focus:outline-none" />
                <p className="text-[11px] text-[#9CA3AF] mt-1">Create bot via @BotFather → /newbot → copy token → <code>npx wrangler secret put TELEGRAM_BOT_TOKEN</code></p>
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#0A0A0A]">Chat ID</label>
                <input value={telegramChatId} onChange={e=>setTelegramChatId(e.target.value)} placeholder="-100123456 or 123456789" className="mt-1 w-full border border-[#EDEDED] rounded-lg px-3 py-2.5 text-[13px] font-mono focus:border-[#229ED9] focus:outline-none" />
                <p className="text-[11px] text-[#9CA3AF] mt-1">Get ID: message bot → https://api.telegram.org/bot&lt;token&gt;/getUpdates → chat.id → <code>npx wrangler secret put TELEGRAM_CHAT_ID</code></p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveTelegram} className="flex-1 sm:flex-none bg-[#229ED9] hover:bg-[#1a8ac0] text-white rounded-lg px-4 py-2.5 text-[13px] font-black">Save Telegram</button>
                <button onClick={handleTestTelegram} disabled={testLoading} className="flex-1 sm:flex-none bg-[#0A0A0A] hover:bg-black text-white rounded-lg px-4 py-2.5 text-[13px] font-black disabled:opacity-50">{testLoading ? 'Sending...' : 'Test 🔥 HOT LEAD'}</button>
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#0A0A0A]">Test message</label>
                <input value={testMessage} onChange={e=>setTestMessage(e.target.value)} placeholder="🔥 HOT LEAD: Acme (owner@acme.com) replied: Interested in pricing - Check Inbox!" className="mt-1 w-full border border-[#EDEDED] rounded-lg px-3 py-2.5 text-[13px] focus:border-[#229ED9] focus:outline-none" />
              </div>
              {testResult && <p className={`text-[12px] font-bold p-2 rounded-lg ${testResult.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{testResult}</p>}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-[11px] font-black text-amber-800">How it works:</p>
                <p className="text-[11px] text-amber-700 leading-snug mt-1">When <code>GET /api/replies</code> detects hot keywords <code>interested, call, pricing, meeting</code> → Sends Telegram: <code>🔥 HOT LEAD: {'{companyName}'} ({'{ownerEmail}'}) replied: {'{snippet}'} - Check Inbox!</code></p>
              </div>
            </div>
          </div>

          {/* Groq 120B */}
          <div className="bg-white border border-[#EDEDED] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#5E17EB] rounded-lg flex items-center justify-center text-white font-black text-[14px]">G</div>
              <div>
                <h2 className="text-[16px] sm:text-[18px] font-black">Groq 120B Own Model</h2>
                <p className="text-[11px] sm:text-[12px] text-[#6B7280]">Fix: Stop mock fallback, use your 120B via env GROQ_MODEL</p>
              </div>
              <span className={`ml-auto text-[10px] font-black px-2 py-1 rounded-full ${envStatus.hasGroq ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{envStatus.hasGroq ? 'GROQ_API_KEY set' : 'Not set'}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-bold text-[#0A0A0A]">GROQ_MODEL (your 120B id)</label>
                <input value={groqModel} onChange={e=>setGroqModel(e.target.value)} placeholder="llama-3.1-70b-versatile or your 120b id" className="mt-1 w-full border border-[#EDEDED] rounded-lg px-3 py-2.5 text-[13px] font-mono focus:border-[#5E17EB] focus:outline-none" />
                <p className="text-[11px] text-[#9CA3AF] mt-1">Set in Cloudflare: <code>npx wrangler secret put GROQ_MODEL</code> → e.g., <code>llama-3.3-70b-versatile</code> or your custom 120b id. Fallback <code>llama-3.1-70b-versatile</code> if not set. Guaranteed fallback <code>llama3-70b-8192</code>.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveGroq} className="flex-1 sm:flex-none bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-lg px-4 py-2.5 text-[13px] font-black">Save GROQ_MODEL</button>
                <button onClick={async ()=>{
                  const token = getToken();
                  const res = await fetch(`${API_URL}/api/content/generate`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: token ? `Bearer ${token}`:'' }, body: JSON.stringify({ topic: 'test', format: 'post', company: 'TestCo' }) });
                  const data = await res.json();
                  setTestResult(data.mocked ? `❌ Still mocked: ${data.text.slice(0,100)}` : `✅ Real Groq: model=${data.model} mocked=${data.mocked}`);
                }} className="flex-1 sm:flex-none bg-[#0A0A0A] hover:bg-black text-white rounded-lg px-4 py-2.5 text-[13px] font-black">Test Groq</button>
              </div>
              {testResult && <p className={`text-[12px] font-bold p-2 rounded-lg break-all ${testResult.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : testResult.startsWith('❌') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50'}`}>{testResult}</p>}
              <div className="bg-[#F0EFFF] border border-[#DDD6FE] rounded-lg p-3">
                <p className="text-[11px] font-black text-[#5E17EB]">Current logic:</p>
                <p className="text-[11px] text-[#4B5563] leading-snug mt-1">Tries <code>env.GROQ_MODEL || llama-3.1-70b-versatile</code> (your 120B) first. If 404/fails → fallback <code>llama3-70b-8192</code> (guaranteed). Logs <code>Content generate using model: ...</code> and returns <code>mocked:false</code> + real content. No more fake mock fallback.</p>
              </div>
              <div className="bg-gray-900 text-white rounded-lg p-3 font-mono text-[11px] leading-snug">
                <div>Backend .env:</div>
                <div>GROQ_API_KEY="gsk_..."</div>
                <div>GROQ_MODEL="your-120b-id"</div>
                <div className="mt-2 text-white/60"># Cloudflare:</div>
                <div>npx wrangler secret put GROQ_API_KEY</div>
                <div>npx wrangler secret put GROQ_MODEL</div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFCF8] border border-[#EDEDED] rounded-xl p-4 text-center">
            <p className="text-[12px] text-[#6B7280]">Keep Apollo global search (USA/UK/Dubai/Global, not Lagos) and $250 Founding pricing.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
