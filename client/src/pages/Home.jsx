import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

function Home() {
  const { t, i18n } = useTranslation();
  const [health, setHealth] = useState({ state: 'loading' });

  useEffect(() => {
    api
      .get('/health')
      .then((res) => setHealth({ state: 'ok', data: res.data.data }))
      .catch(() => setHealth({ state: 'error' }));
  }, []);

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('agrilink_lang', next);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-green-50 text-green-900">
      <h1 className="text-3xl font-bold">{t('app.name')}</h1>

      {health.state === 'loading' && <p>{t('common.loading')}</p>}
      {health.state === 'ok' && (
        <p className="text-green-700">
          {t('common.healthOk')} ({health.data.status})
        </p>
      )}
      {health.state === 'error' && <p className="text-red-600">{t('common.healthError')}</p>}

      <button
        type="button"
        onClick={toggleLanguage}
        className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
      >
        {i18n.language === 'en' ? 'नेपाली' : 'English'}
      </button>
    </div>
  );
}

export default Home;
