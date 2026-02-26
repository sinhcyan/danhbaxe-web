import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full glass-heavy mt-auto border-t border-white/20">
            <div className="max-w-6xl mx-auto p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center font-black text-white">D</div>
                    <p className="font-bold tracking-tight">© 2026 Danhbaxe.vn</p>
                </div>
                <div className="flex items-center gap-8 font-bold">
                    <a href="#" className="hover:text-slate-900 transition-colors">Giới thiệu</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Điều khoản</a>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">v2.0 Liquid</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
