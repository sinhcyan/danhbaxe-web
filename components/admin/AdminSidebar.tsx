import React from 'react';

interface AdminSidebarProps {
    role: string | null;
    activeTab: 'manage' | 'add' | 'account';
    seeding: boolean;
    onNavigate: (tab: 'manage' | 'add') => void;
    onSeedData: () => void;
    onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ role, activeTab, seeding, onNavigate, onSeedData, onLogout }) => {
    return (
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
                        onClick={() => onNavigate('manage')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'manage' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        Quản lý lộ trình
                    </button>
                    <button
                        onClick={() => onNavigate('add')}
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
                        onClick={onSeedData}
                        disabled={seeding}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold transition-all text-xs uppercase tracking-widest border border-blue-200"
                    >
                        {seeding ? 'Đang nạp...' : 'Khôi phục dữ liệu'}
                    </button>
                )}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] bg-slate-200/50 hover:bg-red-500 hover:text-white text-slate-600 font-bold transition-all text-xs uppercase tracking-widest"
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
