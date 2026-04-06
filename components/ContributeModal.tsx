import React, { useState } from 'react';
import TimePickerModal from './TimePickerModal';
import { supabaseService } from '../services/supabase';

import { compressImage } from '../utils/helpers';
import { Carrier, Route, ServiceType, TimedStop } from '../types';

interface ContributeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ContributeModal: React.FC<ContributeModalProps> = ({ onClose, onSuccess }) => {
  const [newCarrierName, setNewCarrierName] = useState('');
  const [newCarrierPhone, setNewCarrierPhone] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newOriginTime, setNewOriginTime] = useState('');
  const [newDest, setNewDest] = useState('');
  const [newDestTime, setNewDestTime] = useState('');
  const [newPrice, setNewPrice] = useState(''); 
  const [newIntermediateStops, setNewIntermediateStops] = useState<TimedStop[]>([]);
  const [currentStopName, setCurrentStopName] = useState('');
  const [currentStopTime, setCurrentStopTime] = useState('');
  const [carrierType, setCarrierType] = useState<'xe khách' | 'xe tải'>('xe khách');
  const [services, setServices] = useState<ServiceType[]>(['passenger']);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTimePicker, setActiveTimePicker] = useState<'origin' | 'dest' | 'stop' | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setImagePreview(compressed);
      } catch (err) { console.error("Image compression failed", err); }
    }
  };



  const handleAddStop = () => {
    if (currentStopName.trim()) {
      setNewIntermediateStops([...newIntermediateStops, { name: currentStopName.trim(), time: currentStopTime || '--:--' }]);
      setCurrentStopName('');
      setCurrentStopTime('');
    }
  };

  const toggleService = (service: ServiceType) => {
    if (services.includes(service)) {
      setServices(services.filter(s => s !== service));
    } else {
      setServices([...services, service]);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const carrierId = crypto.randomUUID();
        const newCarrier: Carrier = {
            id: carrierId,
            name: newCarrierName,
            phone: newCarrierPhone,
            type: 'fixed',
            services: services,
            status: 'pending',
            image_url: imagePreview || undefined
        };
        const timed_stops: TimedStop[] = [
            { name: newOrigin, time: newOriginTime || '--:--' },
            ...newIntermediateStops,
            { name: newDest, time: newDestTime || '--:--' }
        ];
        const newRoute: Route = {
            id: crypto.randomUUID(),
            carrier_id: carrierId,
            origin_district: newOrigin,
            destination_province: newDest,
            path_tags: timed_stops.map(s => s.name),
            timed_stops: timed_stops,
            departure_times: [newOriginTime].filter(t => t),
            description: `Loại hình: ${carrierType}.`,
            price: newPrice ? parseInt(newPrice) : undefined
        };
        await supabaseService.saveCarrier(newCarrier);
        await supabaseService.saveRoute(newRoute);
        onSuccess();
        onClose();
    } catch (e) {
        console.error(e);
        alert("Gửi đóng góp thất bại.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-6 py-4 rounded-2xl glass-input focus:outline-none font-bold text-slate-800 placeholder-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="glass-heavy w-full max-w-3xl rounded-[3rem] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col my-auto max-h-[90vh]">
        <div className="px-8 py-6 border-b border-white/40 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Đóng góp lộ trình</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="flex justify-center mb-4">
              <label className="flex flex-col items-center justify-center cursor-pointer group glass-input rounded-2xl w-28 h-28 hover:bg-white/60 transition-all overflow-hidden relative shadow-sm border border-slate-200">
                  {imagePreview ? (<img src={imagePreview} className="w-full h-full object-cover" />) : (<><svg className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span className="text-[10px] font-black text-slate-400 uppercase text-center px-2">Ảnh xe / Card</span></>)}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
          </div>

          <form onSubmit={handleContribute} className="space-y-8">
            <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">1. Thông tin nhà xe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required value={newCarrierName} onChange={e => setNewCarrierName(e.target.value)} type="text" placeholder="Tên nhà xe (VD: Tuấn Anh)" className={inputClass} />
                    <input required value={newCarrierPhone} onChange={e => setNewCarrierPhone(e.target.value)} type="tel" placeholder="Số điện thoại" className={inputClass} />
                </div>
            </div>
            <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">2. Lộ trình cơ bản</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex gap-3">
                         <div className="flex-1"><input required value={newOrigin} onChange={e => setNewOrigin(e.target.value)} placeholder="Điểm đầu (VD: Hải Hậu)" className={inputClass} /></div>
                        <button type="button" onClick={() => setActiveTimePicker('origin')} className="w-32 rounded-2xl glass-input font-bold text-slate-600 hover:bg-white hover:text-blue-600 transition-all text-sm">{newOriginTime || 'Giờ đi'}</button>
                    </div>
                    <div className="flex gap-3">
                         <div className="flex-1"><input required value={newDest} onChange={e => setNewDest(e.target.value)} placeholder="Điểm cuối (VD: Mỹ Đình)" className={inputClass} /></div>
                        <button type="button" onClick={() => setActiveTimePicker('dest')} className="w-32 rounded-2xl glass-input font-bold text-slate-600 hover:bg-white hover:text-blue-600 transition-all text-sm">{newDestTime || 'Giờ đến'}</button>
                    </div>
                    <div><input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Giá cước (VND) - Để trống nếu không rõ" className={inputClass} /></div>
                </div>
            </div>
            <div>
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">3. Loại xe & Dịch vụ</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <select value={carrierType} onChange={(e: any) => setCarrierType(e.target.value)} className={`${inputClass} appearance-none`}>
                            <option value="xe khách">Xe Khách</option>
                            <option value="xe tải">Xe Tải</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => toggleService('passenger')} className={`flex-1 py-3.5 rounded-2xl border-2 font-black transition-all text-[10px] tracking-wider uppercase ${services.includes('passenger') ? 'bg-green-100 border-green-500 text-green-700 shadow-sm' : 'bg-transparent border-slate-200 text-slate-400'}`}>Chở khách</button>
                        <button type="button" onClick={() => toggleService('goods')} className={`flex-1 py-3.5 rounded-2xl border-2 font-black transition-all text-[10px] tracking-wider uppercase ${services.includes('goods') ? 'bg-orange-100 border-orange-500 text-orange-700 shadow-sm' : 'bg-transparent border-slate-200 text-slate-400'}`}>Gửi hàng</button>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">4. Điểm dừng chi tiết</h3>
                <div className="flex gap-3 mb-6">
                    <input value={currentStopName} onChange={e => setCurrentStopName(e.target.value)} placeholder="Tên điểm trung gian (VD: Phủ Lý)..." className={inputClass} />
                    <button type="button" onClick={() => setActiveTimePicker('stop')} className="w-24 rounded-2xl glass-input font-bold text-xs text-slate-500 hover:text-blue-600 hover:bg-white transition-all">{currentStopTime || 'Giờ qua'}</button>
                    <button type="button" onClick={handleAddStop} className="px-6 bg-slate-800 hover:bg-black text-white rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">Thêm</button>
                </div>
                <div className="p-8 glass rounded-[2.5rem] relative">
                    <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-slate-300/50"></div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-5 relative z-10"><div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-100 shadow-sm"></div><div className="flex-1"><span className="text-xl font-black text-slate-800">{newOrigin || 'Đầu tuyến'}</span><span className="text-sm font-bold text-blue-600 mt-1 block">{newOriginTime || '--:--'}</span></div></div>
                        {newIntermediateStops.map((stop, i) => (
                            <div key={i} className="flex items-center gap-5 relative z-10 pl-1">
                                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                <div className="flex-1 glass-input px-5 py-3 rounded-2xl flex justify-between items-center shadow-sm">
                                    <span className="text-base font-bold text-slate-700">{stop.name}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-slate-400">{stop.time}</span>
                                        <button type="button" onClick={() => setNewIntermediateStops(newIntermediateStops.filter((_, idx) => idx !== i))} className="w-6 h-6 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">×</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center gap-5 relative z-10"><div className="w-4 h-4 rounded-full bg-pink-500 ring-4 ring-pink-100 shadow-sm"></div><div className="flex-1"><span className="text-xl font-black text-slate-800">{newDest || 'Cuối tuyến'}</span><span className="text-sm font-bold text-pink-500 mt-1 block">{newDestTime || '--:--'}</span></div></div>
                    </div>
                </div>
            </div>
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:scale-[1.01] text-white font-black py-5 rounded-3xl shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] mt-4 text-xl uppercase tracking-widest disabled:opacity-70"
            >
                {isSubmitting ? 'Đang gửi...' : 'Gửi đóng góp'}
            </button>
          </form>
        </div>
      </div>
      <TimePickerModal 
        isOpen={activeTimePicker !== null}
        onClose={() => setActiveTimePicker(null)}
        onConfirm={(range) => {
          if (activeTimePicker === 'origin') setNewOriginTime(range.start);
          if (activeTimePicker === 'dest') setNewDestTime(range.start);
          if (activeTimePicker === 'stop') setCurrentStopTime(range.start);
        }}
        initialRange={{ start: activeTimePicker === 'origin' ? newOriginTime : (activeTimePicker === 'dest' ? newDestTime : currentStopTime) || '00:00', end: '00:00' }}
        mode="single"
      />
    </div>
  );
};
export default ContributeModal;