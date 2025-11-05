import { Menu, Search, BookOpen, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">PaperVista</h1>
                <p className="text-xs text-gray-500">AI Research Paper Explorer</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search research papers..."
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm">{user.name}</div>
                <button
                  onClick={() => navigate('/logout')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  title="Sign out"
                >
                  <LogOut className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-secondary">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
