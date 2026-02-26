import React from 'react';

interface EmptyStateProps {
    onContribute: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onContribute }) => {
    return (
        <div className="glass-heavy rounded-[3rem] p-16 text-center">
            <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-400 shadow-inner">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Chưa có dữ liệu tuyến này</h3>
            <p className="text-slate-600 mb-10 max-w-sm mx-auto font-medium">Bạn có biết nhà xe nào chạy tuyến này? Hãy đóng góp ngay để cộng đồng cùng biết nhé!</p>
            <button
                onClick={onContribute}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-3xl font-bold transition-all shadow-lg hover:shadow-blue-500/30"
            >
                Đóng góp ngay
            </button>
        </div>
    );
};

export default EmptyState;
