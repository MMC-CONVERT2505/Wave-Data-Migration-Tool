// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";

// function ProtectedRoute({ children }) {
//   const [auth, setAuth] = useState(null);

//   useEffect(() => {
//     fetch(`${API_URL}/auth/status`, { credentials: "include" })
//       .then((r) => r.json())
//       .then((d) => setAuth(d.authenticated))
//       .catch(() => setAuth(false));
//   }, []);

//   if (auth === null) {
//     return (
//       <div className="min-h-screen bg-slate-950 flex items-center justify-center">
//         <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return auth ? children : <Navigate to="/" replace />;
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }


import { API_URL } from './config';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import BusinessList from './pages/export/BusinessList';
import ExportFilterPage from './pages/export/ExportFilterPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/auth/status`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setAuth(d.authenticated))
      .catch(() => setAuth(false));
  }, []);
  if (auth === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 font-body">Loading...</p>
        </div>
      </div>
    );
  }
  return auth ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  const [selectedBusiness, setSelectedBusiness] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('selectedBusiness')); } catch { return null; }
  });

  const handleBusinessSelect = (biz) => {
    setSelectedBusiness(biz);
    sessionStorage.setItem('selectedBusiness', JSON.stringify(biz));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onBusinessSelect={handleBusinessSelect} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payment selectedBusiness={selectedBusiness} />
            </ProtectedRoute>
          }
        />
        <Route path="/export" element={<BusinessList />} />
        <Route path="/export/filter" element={<ExportFilterPage />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </BrowserRouter>
  );
}