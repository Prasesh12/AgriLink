import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = {
  farmer: [{ to: '/farmer', label: 'nav.dashboard' }],
  buyer: [{ to: '/buyer', label: 'nav.dashboard' }],
  officer: [{ to: '/officer', label: 'nav.verifyFarmers' }],
  admin: [{ to: '/admin', label: 'nav.dashboard' }],
};

function DashboardLayout() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const links = NAV_LINKS[user?.role] || [];

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('agrilink_lang', next);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 shrink-0 bg-green-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-green-800">{t('app.name')}</div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${isActive ? 'bg-green-700' : 'hover:bg-green-800'}`
              }
            >
              {t(link.label)}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-green-800 space-y-1">
          <button
            type="button"
            onClick={toggleLanguage}
            className="w-full text-left px-3 py-2 rounded hover:bg-green-800"
          >
            {i18n.language === 'en' ? 'नेपाली' : 'English'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded hover:bg-green-800"
          >
            {t('nav.logout')}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <div className="mb-4 text-sm text-gray-600">
          {t('nav.loggedInAs', { name: user?.name, role: user?.role })}
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
