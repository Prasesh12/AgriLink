import { useTranslation } from 'react-i18next';

function BuyerDashboard() {
  const { t } = useTranslation();
  return (
    <div className="max-w-md bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-green-900 mb-2">{t('nav.dashboard')}</h1>
      <p className="text-gray-600">The marketplace is coming in a later sprint.</p>
    </div>
  );
}

export default BuyerDashboard;
