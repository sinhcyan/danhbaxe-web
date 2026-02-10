import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabase';
import { Route, Carrier } from '../types';
import { useAuth } from '../contexts/AuthContext';
import AdminRouteTable from '../components/admin/AdminRouteTable';
import AdminRouteForm from '../components/admin/AdminRouteForm';

const AdminDashboard: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manage' | 'add' | 'account'>('manage');
  const [seeding, setSeeding] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  const { role, userId, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [role, navigate]);

  const fetchData = async () => {
    setLoading(true);
    const data = await supabaseService.getRoutes();
    setRoutes(data);
    setLoading(false);
  };

  const filteredRoutes = routes.filter(route => {
      if (role === 'admin') return true;
      return route.carrier?.creator_id === userId;
  });

  const handleSeedData = async () => {
    if (role !== 'admin') {
        alert("Chỉ Admin mới có quyền này.");
        return;
    }
    if (!confirm('Bạn có chắc muốn nạp dữ liệu mẫu? (Chỉ hoạt động khi DB rỗng)')) return;
    setSeeding(true);
    const res = await supabaseService.seedData();
    alert(res.message);
    setSeeding(false);
    fetchData();
  };

  const handleApprove = async (routeId: string) => {
    if (role !== 'admin') return;
    await supabaseService.updateRouteStatus(routeId, 'published');
    fetchData();
  };

  const handleEdit = (route: Route) => {
    setEditingRouteId(route.id);
    setActiveTab('add');
  };

  const cancelEdit = () => {
      setEditingRouteId(null);
      setActiveTab('manage');
  };

  const handleSaveRoute = async (formData: any) => {
    try {
        const routeDataForUpdate = {
            origin_district: formData.origin,
            destination_province: formData.destination,
            path_tags: [formData.origin, ...formData.tags, formData.destination],
            timed_stops: [
                { name: formData.origin, time: formData.time },
                ...formData.tags.map((tag: string) => ({ name: tag, time: '--:--' })),
                { name: formData.destination, time: '--:--' }
            ],
            departure_times: [formData.time],
            price: formData.price ? parseInt(formData.price) : undefined,
        };

        if (editingRouteId) {
            const existingRoute = routes.find(r => r.id === editingRouteId);
            if (!existingRoute) return;

            await supabaseService.updateRoute(editingRouteId, routeDataForUpdate);
            
            await supabaseService.updateCarrier(existingRoute.carrier_id, {
                name: formData.carrierName,
                phone: formData.carrierPhone || existingRoute.carrier?.phone,
                status: role === 'admin' ? existingRoute.carrier?.status : 'pending'
            });

            alert(role === 'admin' ? 'Đã cập nhật thành công!' : 'Đã cập nhật! Tuyến xe đang chờ duyệt lại.');
        } else {
            const carrierId = crypto.randomUUID();
            const newCarrier: Carrier = {
                id: carrierId,
                name: formData.carrierName,
                phone: formData.carrierPhone || '0xxxxxxxxx',
                type: 'fixed',
                services: ['passenger'],
                status: role === 'admin' ? 'published' : 'pending',
                creator_id: userId || undefined
            };
            const newRoute: Route = {
                id: crypto.randomUUID(),
                carrier_id: carrierId,
                ...routeDataForUpdate,
                description: `Tạo bởi ${role}`,
            } as Route;

            await supabaseService.saveCarrier(newCarrier);
            await supabaseService.saveRoute(newRoute);
            alert(role === 'admin' ? 'Đã tạo lộ trình mới!' : 'Đã tạo lộ trình! Vui lòng chờ Admin duyệt.');
        }
        
        cancelEdit();
        fetchData();
    } catch (error) {
        console.error("Save Error:", error);
        alert('Có lỗi xảy ra khi lưu.');
    }
  };

  return (
    <div className="min-h-screen flex p-4 md:p-6 gap-6">
        <div className="w-80 glass-heavy rounded-[2.5rem] flex flex-col hidden md:flex sticky top-6 h-[calc(100vh-3rem)]">
            <div className="p-10 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg ${role === 'admin' ? 'bg-slate-900' : 'bg-blue-600'}`}>
                    {role === 'admin' ? 'A' : 'M'}
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight uppercase">Portal</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</p>
                </div>
            </div>
            
            <div className="px-6 py-2 flex-1 overflow-y-auto no-scrollbar">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-4">Menu</p>
                <nav className="space-y-2">
                    <button 
                        onClick={() => { cancelEdit(); setActiveTab('manage'); }}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'manage' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        Quản lý lộ trình
                    </button>
                    <button 
                        onClick={() => { cancelEdit(); setActiveTab('add'); }}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'add' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Thêm mới
                    </button>
                </nav>
            </div>

            <div className="p-8 space-y-3">
                {role === 'admin' && (
                    <button 
                        onClick={handleSeedData}
                        disabled={seeding}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold transition-all text-xs uppercase tracking-widest border border-blue-200"
                    >
                        {seeding ? 'Đang nạp...' : 'Khôi phục dữ liệu'}
                    </button>
                )}
                <button 
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] bg-slate-200/50 hover:bg-red-500 hover:text-white text-slate-600 font-bold transition-all text-xs uppercase tracking-widest"
                >
                    Đăng xuất
                </button>
            </div>
        </div>

        <div className="flex-1 glass-heavy rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl">
            <header className="px-10 py-8 border-b border-white/30 flex justify-between items-center sticky top-0 z-20 bg-white/10 backdrop-blur-md">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    {activeTab === 'manage' && (role === 'admin' ? 'Tất cả lộ trình hệ thống' : 'Lộ trình của tôi')}
                    {activeTab === 'add' && (editingRouteId ? 'Chỉnh sửa lộ trình' : 'Tạo lộ trình mới')}
                </h2>
                <div className="flex items-center gap-4 bg-white/40 rounded-full px-2 py-2 pr-6 border border-white/50 shadow-sm">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold uppercase">{role?.[0]}</div>
                    <div>
                        <p className="text-xs font-black text-slate-800 uppercase">{role}</p>
                    </div>
                </div>
            </header>

            <main className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                {activeTab === 'manage' && (
                    <AdminRouteTable 
                        routes={filteredRoutes} 
                        loading={loading} 
                        currentUserRole={role} 
                        onApprove={handleApprove} 
                        onEdit={handleEdit} 
                    />
                )}

                {activeTab === 'add' && (
                    <AdminRouteForm 
                        editingRoute={routes.find(r => r.id === editingRouteId) || null}
                        onSave={handleSaveRoute}
                        onCancel={cancelEdit}
                    />
                )}
            </main>
        </div>
    </div>
  );
};

export default AdminDashboard;