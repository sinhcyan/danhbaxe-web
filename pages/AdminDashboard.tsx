import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabase';
import { analyzeRouteWithAI } from '../services/geminiService';
import { Route, Carrier } from '../types';

const AdminDashboard: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manage' | 'add' | 'account' | 'users'>('manage');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const [manualCarrierName, setManualCarrierName] = useState('');
  const [manualCarrierPhone, setManualCarrierPhone] = useState('');
  const [manualOrigin, setManualOrigin] = useState('');
  const [manualDest, setManualDest] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [manualPrice, setManualPrice] = useState(''); 
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (isAdmin !== 'true') navigate('/login');
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    const data = await supabaseService.getRoutes();
    setRoutes(data);
    setLoading(false);
  };

  const handleSeedData = async () => {
    if (!confirm('Bạn có chắc muốn nạp dữ liệu mẫu? (Chỉ hoạt động khi DB rỗng)')) return;
    setSeeding(true);
    const res = await supabaseService.seedData();
    alert(res.message);
    setSeeding(false);
    fetchData();
  };

  const handleApprove = async (routeId: string) => {
    await supabaseService.updateRouteStatus(routeId, 'published');
    fetchData();
  };

  const handleAddTag = () => {
    if (currentTag.trim()) {
        setManualTags([...manualTags, currentTag.trim()]);
        setCurrentTag('');
    }
  };

  const handleAnalyzeAI = async () => {
    if (!aiInput.trim()) return;
    setAiAnalyzing(true);
    try {
        const result = await analyzeRouteWithAI(aiInput);
        if (result) {
            setManualCarrierName(result.carrierName || '');
            setManualOrigin(result.origin || '');
            setManualTime(result.departureTime || '');
            setManualDest(result.destination || '');
            setManualTags(result.intermediateStops || []);
            if (result.price) setManualPrice(result.price.toString());
        } else {
            alert('Không tìm thấy thông tin hợp lệ từ đoạn văn bản.');
        }
    } catch (error) {
        console.error("AI Error:", error);
        alert('Lỗi khi phân tích AI.');
    } finally {
        setAiAnalyzing(false);
    }
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const carrierId = crypto.randomUUID();
        const newCarrier: Carrier = {
            id: carrierId,
            name: manualCarrierName,
            phone: manualCarrierPhone || '0xxxxxxxxx',
            type: 'fixed',
            services: ['passenger'],
            status: 'published'
        };
        const newRoute: Route = {
            id: crypto.randomUUID(),
            carrier_id: carrierId,
            origin_district: manualOrigin,
            destination_province: manualDest,
            path_tags: [manualOrigin, ...manualTags, manualDest],
            timed_stops: [
                { name: manualOrigin, time: manualTime },
                ...manualTags.map(tag => ({ name: tag, time: '--:--' })),
                { name: manualDest, time: '--:--' }
            ],
            departure_times: [manualTime],
            description: 'Tạo bởi Admin',
            price: manualPrice ? parseInt(manualPrice) : undefined
        };

        await supabaseService.saveCarrier(newCarrier);
        await supabaseService.saveRoute(newRoute);
        
        alert('Đã lưu lộ trình mới!');
        setActiveTab('manage');
        fetchData();
        // Reset form
        setManualCarrierName('');
        setManualOrigin('');
        setManualDest('');
        setManualTime('');
        setManualTags([]);
        setAiInput('');
    } catch (error) {
        console.error("Save Error:", error);
        alert('Có lỗi xảy ra khi lưu.');
    }
  };

  const inputClass = "w-full px-6 py-4 rounded-2xl glass-input focus:outline-none font-bold text-slate-800 placeholder-slate-400";

  return (
    <div className="min-h-screen flex p-4 md:p-6 gap-6">
        <div className="w-80 glass-heavy rounded-[2.5rem] flex flex-col hidden md:flex sticky top-6 h-[calc(100vh-3rem)]">
            <div className="p-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg">A</div>
                <h1 className="text-2xl font-black tracking-tight uppercase">Admin</h1>
            </div>
            
            <div className="px-6 py-2 flex-1 overflow-y-auto no-scrollbar">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-4">Menu</p>
                <nav className="space-y-2">
                    <button 
                        onClick={() => setActiveTab('manage')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'manage' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        Lộ trình xe
                    </button>
                    <button 
                        onClick={() => setActiveTab('add')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'add' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Thêm mới
                    </button>
                </nav>
            </div>

            <div className="p-8 space-y-3">
                <button 
                    onClick={handleSeedData}
                    disabled={seeding}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold transition-all text-xs uppercase tracking-widest border border-blue-200"
                >
                    {seeding ? 'Đang nạp...' : 'Khôi phục dữ liệu'}
                </button>
                <button 
                    onClick={() => { sessionStorage.clear(); navigate('/'); }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] bg-slate-200/50 hover:bg-red-500 hover:text-white text-slate-600 font-bold transition-all text-xs uppercase tracking-widest"
                >
                    Đăng xuất
                </button>
            </div>
        </div>

        <div className="flex-1 glass-heavy rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl">
            <header className="px-10 py-8 border-b border-white/30 flex justify-between items-center sticky top-0 z-20 bg-white/10 backdrop-blur-md">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    {activeTab === 'manage' && 'Lộ trình từ thành viên'}
                    {activeTab === 'add' && 'Tạo lộ trình hệ thống'}
                </h2>
                <div className="flex items-center gap-4 bg-white/40 rounded-full px-2 py-2 pr-6 border border-white/50 shadow-sm">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold">A</div>
                    <div>
                        <p className="text-xs font-black text-slate-800 uppercase">Admin</p>
                    </div>
                </div>
            </header>

            <main className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                {activeTab === 'manage' && (
                    <div className="rounded-[2rem] overflow-hidden border border-white/40 bg-white/20">
                        <table className="w-full text-left">
                            <thead className="bg-white/30 border-b border-white/30">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Thông tin</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tuyến</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Trạng thái</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/30">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                                        {routes.length === 0 ? 'Chưa có dữ liệu hoặc đang tải...' : 'Đang tải dữ liệu...'}
                                    </td></tr>
                                ) : routes.length === 0 ? (
                                     <tr><td colSpan={4} className="p-20 text-center text-slate-500">
                                        <p className="font-bold mb-2">Database đang trống.</p>
                                        <p className="text-sm">Hãy ấn nút "Khôi phục dữ liệu" ở menu bên trái để nạp dữ liệu mẫu.</p>
                                    </td></tr>
                                ) : routes.map(route => (
                                    <tr key={route.id} className="hover:bg-white/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm bg-white/50 shrink-0">
                                                    <img src={route.carrier?.image_url || `https://picsum.photos/seed/${route.id}/100/100`} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-base">{route.carrier?.name}</p>
                                                    <p className="text-xs font-bold text-slate-500 mt-1">{route.carrier?.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-700">{route.origin_district}</span>
                                                <span className="text-slate-400">→</span>
                                                <span className="font-bold text-slate-700">{route.destination_province}</span>
                                            </div>
                                            <div className="mt-1 text-xs font-bold text-orange-600">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(route.price || 0)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {route.carrier?.status === 'published' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-green-100/50 text-green-700 border border-green-200/50">
                                                    Công khai
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-100/50 text-amber-700 border border-amber-200/50">
                                                    Chờ duyệt
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2 justify-end">
                                                {route.carrier?.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleApprove(route.id)}
                                                        className="h-10 w-10 flex items-center justify-center text-white bg-green-500 hover:bg-green-600 rounded-xl transition-all shadow-md active:scale-95"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    </button>
                                                )}
                                                <button className="h-10 w-10 flex items-center justify-center bg-white/50 hover:bg-white text-slate-500 rounded-xl transition-all border border-white/50">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'add' && (
                    <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="glass rounded-[2.5rem] p-10 relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-white/40 rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-md">
                                        <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800">AI Import</h3>
                                </div>
                                <textarea 
                                    value={aiInput}
                                    onChange={e => setAiInput(e.target.value)}
                                    placeholder="Dán văn bản cần xử lý (ví dụ: Nhà xe Tuấn Anh, Hà Nội - Nam Định, giá 100k, đi 8h sáng)..."
                                    className="w-full h-56 glass-input rounded-3xl p-6 focus:outline-none focus:bg-white/80 text-slate-800 font-medium resize-none mb-8 transition-all"
                                />
                                <button 
                                    onClick={handleAnalyzeAI}
                                    disabled={aiAnalyzing}
                                    className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                                >
                                    {aiAnalyzing ? 'Đang xử lý...' : 'Phân tích AI'}
                                </button>
                            </div>
                        </div>

                        <div className="glass rounded-[2.5rem] p-10 border border-white/60">
                            <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">Xác nhận thông tin</h3>
                            <form onSubmit={handleManualSave} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-2">Tên nhà xe</label>
                                    <input required value={manualCarrierName} onChange={e => setManualCarrierName(e.target.value)} className={inputClass} />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Khởi hành</label>
                                        <input required value={manualOrigin} onChange={e => setManualOrigin(e.target.value)} placeholder="Địa điểm" className={inputClass} />
                                        <input required type="time" value={manualTime} onChange={e => setManualTime(e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Đến điểm</label>
                                        <input required value={manualDest} onChange={e => setManualDest(e.target.value)} placeholder="Địa điểm" className={inputClass} />
                                        <input 
                                            type="number"
                                            value={manualPrice} 
                                            onChange={e => setManualPrice(e.target.value)} 
                                            placeholder="Giá (VND)" 
                                            className={inputClass} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-2">Lộ trình (Tags)</label>
                                    <div className="flex gap-2 mb-4">
                                        <input 
                                            value={currentTag}
                                            onChange={e => setCurrentTag(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            placeholder="Thêm điểm..."
                                            className={`${inputClass} flex-1`}
                                        />
                                        <button type="button" onClick={handleAddTag} className="w-16 glass-input rounded-2xl font-black text-slate-600 hover:bg-white transition-all text-xl">+</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {manualTags.map((tag, i) => (
                                            <span key={i} className="text-[11px] font-black bg-white/50 text-slate-600 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/60 shadow-sm">
                                                {tag}
                                                <button type="button" onClick={() => setManualTags(manualTags.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl shadow-xl transition-all active:scale-[0.98] mt-4 uppercase tracking-widest">Lưu</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
};

export default AdminDashboard;