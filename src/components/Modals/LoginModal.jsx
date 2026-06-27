import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaLock, FaEnvelope, FaTimes, FaSpinner } from 'react-icons/fa';

const LoginModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onClose(); // Đăng nhập thành công thì đóng modal
    } catch (err) {
      console.error(err);
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl border border-white/60 overflow-hidden transform transition-all">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 flex justify-between items-center relative">
          <h2 className="text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
            <FaLock /> Đăng Nhập Quản Trị
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/20">
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200 font-semibold text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Tài khoản Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800" 
                placeholder="[EMAIL_ADDRESS]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-black text-blue-900/60 mb-1.5 uppercase tracking-wide">Mật khẩu</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner transition-all font-semibold text-gray-800" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 py-3 text-white font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'ĐĂNG NHẬP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
