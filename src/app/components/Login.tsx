import { useState } from 'react';
import { Building2, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%)' }} />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <Building2 className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">HomeStay Dorm</h1>
            <p className="text-blue-300 text-sm mt-1">Hệ thống quản lý ký túc xá</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Nhập mật khẩu"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 pl-10 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-400/30 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang đăng nhập...</>
              ) : 'Đăng nhập'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs text-blue-300 font-medium mb-2">Tài khoản demo (Nhấn để điền):</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { label: '👨‍💼 Quản lý', user: 'admin' },
                { label: '💰 Sales', user: 'sales_user' },
                { label: '📄 Phụ trách', user: 'officer_user' },
                { label: '🧾 Kế toán', user: 'accountant_user' },
              ].map(demo => (
                <button
                  key={demo.user}
                  type="button"
                  onClick={() => setForm({ username: demo.user, password: 'password123' })}
                  className="text-left px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors border border-white/5"
                >
                  <p className="text-blue-200/70">{demo.label}</p>
                  <p className="text-white font-mono mt-0.5">{demo.user}</p>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-blue-300/40 text-center uppercase tracking-widest">Mật khẩu chung: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
