import React, { useState, useEffect } from 'react';
import { Route, Carrier } from '../../types';
import { analyzeRouteWithAI } from '../../services/geminiService';

interface AdminRouteFormProps {
    currentUserRole?: string | null;
    editingRoute: Route | null;
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
}

const AdminRouteForm: React.FC<AdminRouteFormProps> = ({ currentUserRole, editingRoute, onSave, onCancel }) => {
    const [manualCarrierName, setManualCarrierName] = useState('');
    const [manualCarrierPhone, setManualCarrierPhone] = useState('');
    const [manualOrigin, setManualOrigin] = useState('');
    const [manualDest, setManualDest] = useState('');
    const [manualTime, setManualTime] = useState('');
    const [manualPrice, setManualPrice] = useState('');
    const [manualTags, setManualTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [manualStatus, setManualStatus] = useState<string>('pending');
    const [aiInput, setAiInput] = useState('');
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [saving, setSaving] = useState(false);

    const inputClass = "w-full px-6 py-4 rounded-2xl glass-input focus:outline-none font-bold text-slate-800 placeholder-slate-400";

    useEffect(() => {
        if (editingRoute) {
            setManualCarrierName(editingRoute.carrier?.name || '');
            setManualCarrierPhone(editingRoute.carrier?.phone || '');
            setManualOrigin(editingRoute.origin_district);
            setManualDest(editingRoute.destination_province);
            setManualTime(editingRoute.departure_times[0] || '');
            setManualPrice(editingRoute.price?.toString() || '');
            setManualStatus(editingRoute.carrier?.status || 'pending');
            const stops = editingRoute.timed_stops
                .map(s => s.name)
                .filter(n => n !== editingRoute.origin_district && n !== editingRoute.destination_province);
            setManualTags(stops);
        }
    }, [editingRoute]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({
                carrierName: manualCarrierName,
                carrierPhone: manualCarrierPhone,
                origin: manualOrigin,
                destination: manualDest,
                time: manualTime,
                price: manualPrice,
                tags: manualTags,
                status: manualStatus
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10">
            {!editingRoute && (
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
            )}

            <div className={`glass rounded-[2.5rem] p-10 border border-white/60 ${editingRoute ? 'col-span-2 max-w-2xl mx-auto' : ''}`}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                        {editingRoute ? 'Chỉnh sửa thông tin' : 'Xác nhận thông tin'}
                    </h3>
                    {editingRoute && (
                        <button onClick={onCancel} className="text-sm font-bold text-red-500 hover:underline">Hủy bỏ</button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-2">Tên nhà xe</label>
                        <input required value={manualCarrierName} onChange={e => setManualCarrierName(e.target.value)} className={inputClass} />
                    </div>
                    {currentUserRole === 'admin' && (
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-2">Trạng thái (Chỉ Admin)</label>
                            <select
                                value={manualStatus}
                                onChange={e => setManualStatus(e.target.value)}
                                className={`${inputClass} appearance-none cursor-pointer`}
                            >
                                <option value="pending">Ẩn, chờ duyệt</option>
                                <option value="published">Công Khai</option>
                            </select>
                        </div>
                    )}
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
                    <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl shadow-xl transition-all active:scale-[0.98] mt-4 uppercase tracking-widest disabled:opacity-50">
                        {saving ? 'Đang lưu...' : (editingRoute ? 'Cập nhật' : 'Lưu mới')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminRouteForm;