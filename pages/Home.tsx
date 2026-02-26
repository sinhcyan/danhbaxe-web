import React, { useState } from 'react';
import SearchHero from '../components/SearchHero';
import RouteCard from '../components/RouteCard';
import ContributeModal from '../components/ContributeModal';
import { supabaseService } from '../services/supabase';
import { Route } from '../types';
import MainLayout from '../components/layouts/MainLayout';
import EmptyState from '../components/home/EmptyState';

const Home: React.FC = () => {
  const [results, setResults] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  React.useEffect(() => {
    // Preload dataset to populate cache immediately on visit
    supabaseService.getRoutes().catch(console.error);
  }, []);

  const handleSearch = async (origin: string, dest: string, startTime: string, endTime: string) => {
    setLoading(true);
    setSearched(true);
    try {
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
    <MainLayout>
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
              <EmptyState onContribute={() => setShowContributeModal(true)} />
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
    </MainLayout>
  );
};

export default Home;