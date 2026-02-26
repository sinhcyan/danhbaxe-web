import React from 'react';

interface AdminHeaderProps {
    role: string | null;
    activeTab: 'manage' | 'add' | 'account';
    isEditing: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ role, activeTab, isEditing }) => {
    return (
        <header className="px-10 py-8 border-b border-white/30 flex justify-between items-center sticky top-0 z-20 bg-white/10 backdrop-blur-md">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                {activeTab === 'manage' && (role === 'admin' ? 'Tất cả lộ trình hệ thống' : 'Lộ trình của tôi')}
                {activeTab === 'add' && (isEditing ? 'Chỉnh sửa lộ trình' : 'Tạo lộ trình mới')}
            </h2>
            <div className="flex items-center gap-4 bg-white/40 rounded-full px-2 py-2 pr-6 border border-white/50 shadow-sm">
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold uppercase">{role?.[0]}</div>
                <div>
                    <p className="text-xs font-black text-slate-800 uppercase">{role}</p>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
