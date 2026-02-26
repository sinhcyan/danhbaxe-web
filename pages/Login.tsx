import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/layouts/AuthLayout';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (username === 'admin' && password === '123') {
            login('admin', 'admin', 'admin_master_id');
            navigate('/admin');
        } else if (username === 'member' && password === '123') {
            login('member', 'member', 'member_01_id');
            navigate('/admin');
        } else {
            setError('Sai thông tin đăng nhập. (Gợi ý: admin/123 hoặc member/123)');
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md glass-heavy rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white text-4xl font-bold mb-6 shadow-xl shadow-blue-500/30">D</div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Portal Đăng Nhập</h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <div className="glass-input rounded-2xl p-1">
                            <input
                                required
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Tên đăng nhập"
                                className="w-full px-5 py-4 bg-transparent focus:outline-none font-bold text-slate-800 placeholder-slate-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="glass-input rounded-2xl p-1">
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Mật khẩu"
                                className="w-full px-5 py-4 bg-transparent focus:outline-none font-bold text-slate-800 placeholder-slate-400"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-black text-center bg-red-50 py-2 rounded-xl">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl shadow-xl transition-all active:scale-[0.98] mt-4 uppercase tracking-widest text-sm"
                    >
                        Đăng nhập
                    </button>
                </form>

                <button
                    onClick={() => navigate('/')}
                    className="w-full mt-8 text-slate-500 text-xs font-bold hover:text-blue-600 transition-colors uppercase tracking-widest"
                >
                    Quay lại trang chủ
                </button>
            </div>
        </AuthLayout>
    );
};

export default Login;