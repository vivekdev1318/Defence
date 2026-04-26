import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useBlockchain } from './hooks/useBlockchain';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { Dashboard } from './components/pages/Dashboard';
import { DeviceRegistry } from './components/pages/DeviceRegistry';
import { CommandCenter } from './components/pages/CommandCenter';
import { AuditLog } from './components/pages/AuditLog';
import { AnomalyDetector } from './components/pages/AnomalyDetector';
import { AttackSimulator } from './components/pages/AttackSimulator';
import { TrustAnalytics } from './components/pages/TrustAnalytics';
import './App.css';

function AppContent() {
  const { isDemo } = useBlockchain();
  const [toast, setToast] = useState(null);

  return (
    <div className="app">
      <Sidebar />

      <div className="app-main">
        {isDemo && (
          <div className="demo-banner">
            INDIAN ARMY
          </div>
        )}

        <Header title="Dashboard" />

        <div className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard setToast={setToast} />} />
            <Route path="/devices" element={<DeviceRegistry setToast={setToast} />} />
            <Route path="/commands" element={<CommandCenter setToast={setToast} />} />
            <Route path="/audit" element={<AuditLog setToast={setToast} />} />
            <Route path="/anomaly" element={<AnomalyDetector setToast={setToast} />} />
            <Route path="/attack" element={<AttackSimulator setToast={setToast} />} />
            <Route path="/analytics" element={<TrustAnalytics setToast={setToast} />} />
          </Routes>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;
