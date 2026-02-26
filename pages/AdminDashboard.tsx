import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../services/supabase';
import { Route, Carrier } from '../types';
import { useAuth } from '../contexts/AuthContext';
import AdminRouteTable from '../components/admin/AdminRouteTable';
import AdminRouteForm from '../components/admin/AdminRouteForm';
import AdminLayout from '../components/layouts/AdminLayout';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

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
        <AdminLayout
            sidebar={
                <AdminSidebar
                    role={role}
                    activeTab={activeTab}
                    seeding={seeding}
                    onNavigate={(tab) => { cancelEdit(); setActiveTab(tab); }}
                    onSeedData={handleSeedData}
                    onLogout={() => { logout(); navigate('/'); }}
                />
            }
            header={
                <AdminHeader
                    role={role}
                    activeTab={activeTab}
                    isEditing={!!editingRouteId}
                />
            }
        >
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
        </AdminLayout>
    );
};

export default AdminDashboard;