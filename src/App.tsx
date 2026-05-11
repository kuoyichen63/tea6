import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Store, ShieldCheck } from 'lucide-react';
import Frontend from './pages/Frontend';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-amber-800">
              <Store className="w-6 h-6" />
              <span>茶飲點單系統</span>
            </Link>
            <Link to="/admin" className="text-gray-500 hover:text-amber-800 flex items-center gap-1 text-sm font-medium transition-colors">
              <ShieldCheck className="w-5 h-5" />
              <span>後台管理</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Frontend />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
