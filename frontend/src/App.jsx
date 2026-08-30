import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { AccessCode } from './pages/AccessCode';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FindCompanies } from './pages/FindCompanies';
import { SendMessages } from './pages/SendMessages';
import { TrackReplies } from './pages/TrackReplies';
import { Campaigns } from './pages/Campaigns';
import { SavedCompanies } from './pages/SavedCompanies';
import { Inbox } from './pages/Inbox';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/access" element={<AccessCode />} />
        <Route path="/dashboard" element={<ProtectedRoute requirePayment={true}><Dashboard /></ProtectedRoute>} />
        <Route path="/find-companies" element={<ProtectedRoute requirePayment={true}><FindCompanies /></ProtectedRoute>} />
        <Route path="/send-messages" element={<ProtectedRoute requirePayment={true}><SendMessages /></ProtectedRoute>} />
        <Route path="/track-replies" element={<ProtectedRoute requirePayment={true}><TrackReplies /></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute requirePayment={true}><Campaigns /></ProtectedRoute>} />
        <Route path="/saved-companies" element={<ProtectedRoute requirePayment={true}><SavedCompanies /></ProtectedRoute>} />
        <Route path="/inbox" element={<ProtectedRoute requirePayment={true}><Inbox /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute requirePayment={true}><Settings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
