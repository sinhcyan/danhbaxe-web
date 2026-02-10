import React, { useState } from 'react';
import SearchHero from '../components/SearchHero';
import RouteCard from '../components/RouteCard';
import ContributeModal from '../components/ContributeModal';
import { supabaseService } from '../services/supabase';
import { Route } from '../types';

const Home: React.FC = () => {
  const [results, setResults] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleSearch = async (origin: string, dest: string, startTime: string, endTime: string) => {
    setLoading(true);
    setSearched(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      const filtered = await supabaseService.searchRoutes(origin, dest, startTime, endTime);
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleContributeSuccess = () => {
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 3000);
  };

  return (
    <div className="relative">
      <main className="pb-24">
        <SearchHero onSearch={handleSearch} />
        <div className="max-w-4xl mx-auto px-2 md:px-4">
          {searched && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 mb-8">
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {loading ? 'Đang lọc tìm xe...' : `Kết quả tìm kiếm (${results.length})`}
                </h2>
              </div>

              {loading ? (
                <div className="flex flex-col gap-6">
                  {[1, 2].map(i => (
                    <div key={i} className="h-48 glass rounded-3xl animate-pulse"></div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="flex flex-col gap-4 md:gap-6">
                  {results.map(route => (
                    <RouteCard key={route.id} route={route} />
                  ))}
                </div>
              ) : (
                <div className="glass-heavy rounded-[3rem] p-16 text-center">
                  <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-400 shadow-inner">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Chưa có dữ liệu tuyến này</h3>
                  <p className="text-slate-600 mb-10 max-w-sm mx-auto font-medium">Bạn có biết nhà xe nào chạy tuyến này? Hãy đóng góp ngay để cộng đồng cùng biết nhé!</p>
                  <button 
                    onClick={() => setShowContributeModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-3xl font-bold transition-all shadow-lg hover:shadow-blue-500/30"
                  >
                    Đóng góp ngay
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="text-center py-12 animate-in fade-in duration-1000">
            <p className="text-slate-500 font-bold text-sm mb-6 uppercase tracking-widest opacity-60">
              Dự án vì cộng đồng
            </p>
            <button 
              onClick={() => setShowContributeModal(true)}
              className="glass hover:bg-white text-slate-800 px-8 py-4 rounded-full font-black text-sm shadow-sm transition-all active:scale-95 flex items-center gap-3 mx-auto uppercase tracking-widest border border-white/60"
            >
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg leading-none pb-0.5">+</span>
              Thêm lộ trình mới
            </button>
          </div>
        </div>
      </main>

      {showContributeModal && (
        <ContributeModal 
            onClose={() => setShowContributeModal(false)} 
            onSuccess={handleContributeSuccess}
        />
      )}

      {showSuccessPopup && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 glass-heavy text-slate-800 px-8 py-4 rounded-3xl shadow-2xl z-[100] animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-4 border border-green-200">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="font-bold text-lg">Cảm ơn bạn đã đóng góp!</span>
        </div>
      )}

      <footer className="w-full glass-heavy mt-auto border-t border-white/20">
          <div className="max-w-6xl mx-auto p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-sm">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center font-black text-white">D</div>
               <p className="font-bold tracking-tight">© 2026 Danhbaxe.vn</p>
            </div>
            <div className="flex items-center gap-8 font-bold">
              <a href="#" className="hover:text-slate-900 transition-colors">Giới thiệu</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Điều khoản</a>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">v2.0 Liquid</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;