import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/api';

export const ApiTokens = () => {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingToken, setCreatingToken] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [showNewTokenModal, setShowNewTokenModal] = useState(false);
  const [newToken, setNewToken] = useState(null);
  const [copied, setCopied] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user && user.email?.toLowerCase() !== 'alphatekxcompany@gmail.com') {
      setUnauthorized(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.email?.toLowerCase() === 'alphatekxcompany@gmail.com') {
      fetchTokens();
    }
  }, [user]);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/tokens`, {
        headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' }, credentials: 'include'
      });
      const data = await res.json();
      if (data.success) setTokens(data.tokens || []);
      else if (data.tokens) setTokens(data.tokens);
      else if (Array.isArray(data)) setTokens(data);
    } catch (e) { console.error('Failed to fetch tokens:', e); } finally { setLoading(false); }
  };

  const handleCreateToken = async () => {
    if (!tokenName.trim()) { alert('Please enter a token name'); return; }
    setCreatingToken(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/tokens`, {
        method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ name: tokenName })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setNewToken(data.token);
        setTokenName('');
        setShowNewTokenModal(true);
        // Refresh tokens list after a short delay
        setTimeout(() => fetchTokens(), 500);
      } else {
        alert(data.error || 'Failed to create token');
      }
    } catch (e) {
      console.error('Failed to create token:', e);
      alert('Failed to create token');
    } finally {
      setCreatingToken(false);
    }
  };

  const handleCopyToken = () => {
    if (newToken?.token_key) {
      navigator.clipboard.writeText(newToken.token_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteToken = async (tokenId) => {
    if (!confirm('Are you sure you want to delete this token? This action cannot be undone.')) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/tokens/${tokenId}`, {
        method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' }, credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        setTokens(tokens.filter(t => t.id !== tokenId));
      } else {
        alert(data.error || 'Failed to delete token');
      }
    } catch (e) {
      console.error('Failed to delete token:', e);
      alert('Failed to delete token');
    }
  };

  const handleRevokeToken = async (tokenId) => {
    if (!confirm('Are you sure you want to revoke this token?')) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/tokens/${tokenId}/revoke`, {
        method: 'PATCH', headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' }, credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        fetchTokens();
      } else {
        alert(data.error || 'Failed to revoke token');
      }
    } catch (e) {
      console.error('Failed to revoke token:', e);
      alert('Failed to revoke token');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('master_unlocked');
    localStorage.removeItem('demo_hasAccess');
    localStorage.removeItem('auth_token');
    navigate('/');
  };

  const displayName = user?.email?.split('@')[0] ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'Alex';

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-3 sm:py-4 font-['Inter',sans-serif] overflow-x-hidden w-full">
      <div className="max-w-[1120px] mx-auto w-full max-w-full">
        {/* UNAUTHORIZED MESSAGE */}
        {unauthorized && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-[#DC2626] text-center">
            <p className="font-medium text-sm sm:text-base">Access Denied</p>
            <p className="text-[13px] sm:text-[14px] mt-1">This page is only accessible to admin users. Redirecting to dashboard...</p>
          </div>
        )}

        {/* TOP NAV */}
        <div className="bg-white border border-[#EDEDED] rounded-2xl px-3 sm:px-5 md:px-6 py-3 sm:py-4 flex items-center justify-between shadow-[0_2px_16px_rgba(0,0,0,0.04)] gap-2 w-full max-w-full overflow-hidden">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-70 transition-opacity min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#5E17EB] rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white text-[22px] sm:text-[26px] font-medium leading-none -mt-1">α</span>
            </div>
            <span className="text-[20px] sm:text-[28px] md:text-[30px] font-bold tracking-tight text-[#0A0A0A] truncate">Alpha OS</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="hidden sm:inline text-[13px] md:text-[15px] text-[#0A0A0A] font-normal truncate max-w-[140px]">Welcome back, {displayName}</span>
            <span className="sm:hidden text-[12px] text-[#0A0A0A] truncate max-w-[80px]">Hi, {displayName}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#6B7280] hover:text-[#0A0A0A] border border-[#EDEDED] px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAFAFA] transition-colors shrink-0"
            >
              <span className="hidden sm:inline">Logout</span><span className="sm:hidden">Out</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="hidden sm:block"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
        </div>

        {/* HEADER */}
        <div className="mt-5 sm:mt-7 md:mt-8 mb-4 sm:mb-6 px-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[13px] sm:text-[14px] text-[#6B7280] hover:text-[#0A0A0A] mb-2 flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-[24px] sm:text-[28px] md:text-[36px] font-bold tracking-tight text-[#0A0A0A] leading-none break-words">API Tokens</h1>
          <p className="text-[13px] sm:text-[14px] md:text-[15px] text-[#6B7280] mt-1.5 leading-snug break-words">Create and manage API tokens for team members to access the platform programmatically</p>
        </div>

        {/* CREATE TOKEN SECTION */}
        <div className="bg-white border border-[#EDEDED] rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Token name (e.g., 'John's API Key')"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-[#EDEDED] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/20"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateToken()}
            />
            <button
              onClick={handleCreateToken}
              disabled={creatingToken || !tokenName.trim()}
              className="px-6 py-2.5 bg-[#5E17EB] text-white rounded-lg hover:bg-[#4D0FD4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {creatingToken ? 'Creating...' : 'Create Token'}
            </button>
          </div>
        </div>

        {/* TOKENS LIST */}
        {loading ? (
          <div className="text-center text-[#6B7280] py-8">Loading tokens...</div>
        ) : tokens.length === 0 ? (
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-8 text-center">
            <p className="text-[#6B7280] mb-2">No API tokens created yet</p>
            <p className="text-[14px] text-[#9CA3AF]">Create your first token above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div key={token.id} className="bg-white border border-[#EDEDED] rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-[#0A0A0A] mb-1">{token.name}</p>
                  <p className="text-[13px] text-[#6B7280] mb-2">Key: <span className="font-mono">{token.token_key}</span></p>
                  <p className="text-[12px] text-[#9CA3AF]">
                    Created: {new Date(token.created_at).toLocaleDateString()}
                    {token.last_used && ` • Last used: ${new Date(token.last_used).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRevokeToken(token.id)}
                    disabled={!token.is_active}
                    className="px-4 py-2 text-[13px] text-[#EF4444] border border-[#FCA5A5] rounded-lg hover:bg-[#FEF2F2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {token.is_active ? 'Revoke' : 'Revoked'}
                  </button>
                  <button
                    onClick={() => handleDeleteToken(token.id)}
                    className="px-4 py-2 text-[13px] text-[#DC2626] border border-[#FECACA] rounded-lg hover:bg-[#FEE2E2] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NEW TOKEN MODAL */}
        {showNewTokenModal && newToken && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-[24px] font-bold text-[#0A0A0A] mb-4">Your API Token</h2>
              <p className="text-[14px] text-[#6B7280] mb-4">
                Save this token somewhere safe. You won't be able to see it again.
              </p>
              <div className="bg-[#F9FAFB] border border-[#EDEDED] rounded-lg p-4 mb-4">
                <p className="text-[12px] text-[#6B7280] mb-2">Token Key:</p>
                <p className="font-mono text-[14px] text-[#0A0A0A] break-all">{newToken.token_key}</p>
              </div>
              <button
                onClick={handleCopyToken}
                className="w-full px-4 py-2.5 bg-[#5E17EB] text-white rounded-lg hover:bg-[#4D0FD4] transition-colors font-medium mb-3"
              >
                {copied ? 'Copied!' : 'Copy Token'}
              </button>
              <button
                onClick={() => {
                  setShowNewTokenModal(false);
                  setNewToken(null);
                }}
                className="w-full px-4 py-2.5 border border-[#EDEDED] text-[#0A0A0A] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

