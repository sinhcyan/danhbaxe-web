import React, { useState } from 'react';
import TimePickerModal from './TimePickerModal';

interface SearchHeroProps {
  onSearch: (origin: string, dest: string, startTime: string, endTime: string) => void;
}

const SearchHero: React.FC<SearchHeroProps> = ({ onSearch }) => {
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [timeRange, setTimeRange] = useState<{start: string, end: string} | null>(null);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() && !dest.trim()) {
      alert("Vui lòng chọn địa điểm");
      return;
    }
    onSearch(origin, dest, timeRange?.start || '', timeRange?.end || '');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-12 md:pt-20 pb-8 flex flex-col items-center">
      <div className="mb-12 text-center animate-in fade-in zoom-in duration-700">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-4 drop-shadow-sm">
          Danhbaxe.vn
        </h1>
        <p className="text-slate-600 text-xl font-medium text-center max-w-lg mx-auto leading-relaxed">
          Hệ sinh thái tìm kiếm vận tải <span className="text-blue-600 font-bold">thế hệ mới</span>
        </p>
      </div>

      <form 
        onSubmit={handleSubmit}
        className="w-full flex flex-col md:flex-row items-stretch justify-center gap-4 transition-all"
      >
        <div className="flex-1 glass-input rounded-3xl p-1 group">
          <div className="relative h-full flex items-center">
            <div className="absolute left-4 text-blue-500 group-focus-within:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Điểm đi (vd: Nam Định...)"
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-transparent focus:outline-none text-slate-800 font-bold placeholder-slate-400 text-lg"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 glass-input rounded-3xl p-1 group">
          <div className="relative h-full flex items-center">
            <div className="absolute left-4 text-pink-500 group-focus-within:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Điểm đến (vd: Hà Nội...)"
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-transparent focus:outline-none text-slate-800 font-bold placeholder-slate-400 text-lg"
              value={dest}
              onChange={(e) => setDest(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full md:w-64 glass-input rounded-3xl p-1 group relative cursor-pointer hover:bg-white/40">
          <button
            type="button"
            onClick={() => setIsTimePickerOpen(true)}
            className="w-full h-full flex items-center text-left"
          >
            <div className="absolute left-4 text-indigo-500 group-focus-within:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="pl-14 pr-6 py-4 text-slate-800 font-bold whitespace-nowrap overflow-hidden text-ellipsis text-lg">
              {timeRange ? `${timeRange.start} - ${timeRange.end}` : <span className="text-slate-400 font-medium">Giờ đi</span>}
            </div>
          </button>
        </div>

        <button 
          type="submit"
          className="bg-slate-900/90 hover:bg-black backdrop-blur-md text-white px-10 py-4 rounded-3xl font-black transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap text-lg"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Tìm xe
        </button>
      </form>

      <TimePickerModal 
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        onConfirm={setTimeRange}
        initialRange={timeRange || undefined}
        mode="range"
      />
    </div>
  );
};

export default SearchHero;