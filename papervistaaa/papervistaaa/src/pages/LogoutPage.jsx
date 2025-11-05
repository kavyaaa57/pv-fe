import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LogoutPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="max-w-lg mx-auto">
      <div className="card text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-700 text-xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Successfully Logged Out</h1>
        <p className="text-gray-600 mb-4">You have been securely signed out. Your research data has been saved.</p>
        <div className="flex items-center justify-center space-x-3">
          <button onClick={() => navigate('/login')} className="btn-primary">Sign In Again</button>
          <button onClick={() => navigate('/')} className="btn-secondary">Return Home</button>
        </div>
        <div className="mt-4 text-xs text-gray-500">Logout time: {new Date().toLocaleString()}</div>
      </div>
    </div>
  );
};

export default LogoutPage;



