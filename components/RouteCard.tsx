import React, { useState } from 'react';
import { Route } from '../types';
import { formatPhone } from '../utils/helpers';

interface RouteCardProps {
  route: Route;
}

const RouteCard: React.FC<RouteCardProps> = ({ route }) => {
  const [showPhone, setShowPhone] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const carrier = route.carrier;

  const formatPrice = (price?: number) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/60 hover:shadow-lg group mb-4 relative">
      <div className="hidden md:block">
        <div className="absolute top-5 right-5 z-20">
           {showPhone ? (
               <a 
                  href={`tel:${carrier?.phone}`}
                  className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
               >
                   <span className="text-sm font-black tracking-widest">{formatPhone(carrier?.phone || '', false)}</span>
               </a>
          ) : (
              <button 
                  onClick={() => setShowPhone(true)}
                  className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-purple-700 active:scale-95 transition-all"
              >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span className="text-[11px] font-black uppercase tracking-wider">Liên hệ nhà xe</span>
              </button>
          )}
        </div>

        <div className="p-5 flex flex-row gap-6">
          <div className="w-40 h-40 shrink-0 relative rounded-xl overflow-hidden bg-white/50 shadow-sm border border-white/40">
            <img 
              src={carrier?.image_url || `https://picsum.photos/seed/${route.id}/400/300`} 
              alt={carrier?.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 pt-0.5 flex flex-col">
              <div className="pr-36 mb-2">
                  <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-2">
                      {carrier?.name} 
                      <span className="font-medium text-slate-500 text-lg ml-2">
                          ({route.origin_district} &gt; {route.destination_province})
                      </span>
                  </h3>
                  
                  <div className="text-lg font-bold group-hover:scale-105 transition-transform origin-left">
                      <span className="text-slate-900">Giá cước: </span>
                      <span className="text-orange-600">{formatPrice(route.price)}</span>
                  </div>
              </div>

              <div className="mt-2 flex-1">
                  {!expanded && (
                       <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-row items-center gap-8 animate-in fade-in duration-300">
                          <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                              <div className="text-sm font-bold text-slate-700">
                                  Điểm đi: <span className="text-slate-900 text-base">{route.origin_district}</span>
                              </div>
                              {route.departure_times[0] && (
                                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                                      {route.departure_times[0]}
                                  </span>
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                              <div className="text-sm font-bold text-slate-700">
                                  Điểm đến: <span className="text-slate-900 text-base">{route.destination_province}</span>
                              </div>
                               <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-pink-200">
                                  Giờ về: LH
                              </span>
                          </div>
                       </div>
                  )}

                  {expanded && (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                              <div className="flex items-center gap-2 mb-1.5">
                                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                  <div className="text-sm font-bold text-slate-800">
                                      Điểm đi: <span className="text-blue-700 text-base ml-1">{route.origin_district}</span>
                                  </div>
                                  {route.departure_times[0] && (
                                      <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded ml-1 shadow-sm shadow-blue-200">
                                          {route.departure_times[0]} xuất bến
                                      </span>
                                  )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-slate-600 pl-4">
                                  {route.timed_stops?.map((s, i) => (
                                      <React.Fragment key={i}>
                                          {i > 0 && <span className="text-slate-300 font-bold text-xs">&gt;</span>}
                                          <span className="font-medium whitespace-nowrap group-hover/stop:text-blue-600 transition-colors">
                                              {s.name}
                                              {s.time !== '--:--' && <span className="text-blue-500 text-[10px] ml-1 font-bold">({s.time})</span>}
                                          </span>
                                      </React.Fragment>
                                  ))}
                              </div>
                          </div>

                          <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100/50">
                              <div className="flex items-center gap-2 mb-1.5">
                                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                  <div className="text-sm font-bold text-slate-800">
                                      Điểm đến: <span className="text-pink-700 text-base ml-1">{route.destination_province}</span>
                                  </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-slate-600 pl-4">
                                  {[...(route.timed_stops || [])].reverse().map((s, i) => (
                                      <React.Fragment key={i}>
                                          {i > 0 && <span className="text-slate-300 font-bold text-xs">&gt;</span>}
                                          <span className="font-medium whitespace-nowrap">
                                              {s.name}
                                          </span>
                                      </React.Fragment>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}
              </div>

              <div className="mt-3">
                  <button 
                      onClick={() => setExpanded(!expanded)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group/btn"
                  >
                      {expanded ? 'thu gọn' : 'chi tiết lộ trình'}
                      <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : 'group-hover/btn:translate-y-0.5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                  </button>
              </div>
          </div>
        </div>
      </div>
      <div className="md:hidden p-3">
          <div className="flex gap-3 items-start">
             <div className="w-28 h-28 shrink-0 relative rounded-xl overflow-hidden bg-white/50 shadow-sm border border-white/40">
                  <img 
                      src={carrier?.image_url || `https://picsum.photos/seed/${route.id}/400/300`} 
                      alt={carrier?.name}
                      className="w-full h-full object-cover"
                  />
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <h3 className="text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none pt-1 truncate">
                      {carrier?.name}
                  </h3>
                  <div className="text-sm font-bold mt-0.5">
                       <span className="text-slate-900">Giá cước: </span>
                       <span className="text-orange-600">{formatPrice(route.price)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-700 mt-0.5 leading-tight">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-0.5"></div>
                      <span className="font-bold whitespace-nowrap">Đi: {route.origin_district}</span>
                      {route.departure_times.map((time, idx) => (
                        <span key={idx} className="text-blue-600 font-extrabold text-[11px] whitespace-nowrap">
                            ({time})
                        </span>
                      ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-700 leading-tight">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0"></div>
                      <span className="font-bold truncate">Đến: {route.destination_province}</span>
                  </div>
              </div>
          </div>
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
              <button 
                  onClick={() => setExpanded(!expanded)}
                  className="text-[10px] font-bold text-blue-600 flex items-center gap-1 py-1"
              >
                  {expanded ? 'thu gọn' : 'chi tiết lộ trình'}
                  <svg className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
              </button>
              {showPhone ? (
                   <a 
                      href={`tel:${carrier?.phone}`}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all text-[11px]"
                   >
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                       {formatPhone(carrier?.phone || '', false)}
                   </a>
              ) : (
                  <button 
                      onClick={() => setShowPhone(true)}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all text-[9px] uppercase tracking-wider"
                  >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      Liên hệ nhà xe
                  </button>
              )}
          </div>
          {expanded && (
              <div className="mt-3 pt-2 space-y-3 animate-in fade-in slide-in-from-top-2 border-t border-slate-100">
                   <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                            <span className="text-xs font-bold text-slate-800">Lộ trình chiều đi</span>
                        </div>
                        <div className="text-[11px] text-slate-600 leading-relaxed pl-3.5">
                            {route.timed_stops?.map((s, i) => (
                                <span key={i}>
                                    {i > 0 && <span className="text-slate-300 mx-1">&gt;</span>}
                                    <span className={s.time !== '--:--' ? 'font-bold text-blue-700' : ''}>{s.name}</span>
                                </span>
                            ))}
                        </div>
                   </div>
                   <div className="bg-pink-50/50 p-2.5 rounded-lg border border-pink-100">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                            <span className="text-xs font-bold text-slate-800">Lộ trình chiều về</span>
                        </div>
                        <div className="text-[11px] text-slate-600 leading-relaxed pl-3.5">
                            {[...(route.timed_stops || [])].reverse().map((s, i) => (
                                <span key={i}>
                                    {i > 0 && <span className="text-slate-300 mx-1">&gt;</span>}
                                    <span>{s.name}</span>
                                </span>
                            ))}
                        </div>
                   </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default RouteCard;