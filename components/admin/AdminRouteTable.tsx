import React from 'react';
import { Route } from '../../types';

interface AdminRouteTableProps {
    routes: Route[];
    loading: boolean;
    currentUserRole: string | null;
    onApprove: (id: string) => void;
    onEdit: (route: Route) => void;
    onDelete?: (id: string) => void;
}

const AdminRouteTable: React.FC<AdminRouteTableProps> = ({ routes, loading, currentUserRole, onApprove, onEdit, onDelete }) => {
    return (
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
                            Đang tải dữ liệu...
                        </td></tr>
                    ) : routes.length === 0 ? (
                        <tr><td colSpan={4} className="p-20 text-center text-slate-500">
                            <p className="font-bold mb-2">Không tìm thấy dữ liệu.</p>
                            <p className="text-sm">Bạn chưa tạo tuyến nào hoặc chưa có dữ liệu.</p>
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
                                    {currentUserRole === 'admin' && route.carrier?.status === 'pending' && (
                                        <button
                                            onClick={() => onApprove(route.id)}
                                            title="Duyệt bài"
                                            className="h-10 w-10 flex items-center justify-center text-white bg-green-500 hover:bg-green-600 rounded-xl transition-all shadow-md active:scale-95"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => onEdit(route)}
                                        title="Chỉnh sửa"
                                        className="h-10 w-10 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 border border-blue-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>

                                    {currentUserRole === 'admin' && onDelete && (
                                        <button onClick={() => onDelete(route.id)} title="Xóa" className="h-10 w-10 flex items-center justify-center bg-white/50 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all border border-white/50">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default AdminRouteTable;