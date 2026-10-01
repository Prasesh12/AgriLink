import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import FarmerProfileForm from './FarmerProfileForm';

function FarmerDashboard() {
  const { t } = useTranslation();
  const { user, refresh } = useAuth();
  const farmer = user?.farmer;

  if (!farmer) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-green-900 mb-1">{t('farmer.noProfileTitle')}</h1>
        <p className="text-gray-600 mb-6">{t('farmer.noProfileBody')}</p>
        <FarmerProfileForm onSubmitted={refresh} />
      </div>
    );
  }

  if (farmer.verificationStatus === 'pending') {
    return (
      <div className="max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-yellow-700 mb-2">{t('farmer.pendingTitle')}</h1>
        <p className="text-gray-600">{t('farmer.pendingBody')}</p>
      </div>
    );
  }

  if (farmer.verificationStatus === 'rejected') {
    return (
      <div>
        <div className="max-w-md bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-red-700 mb-2">{t('farmer.rejectedTitle')}</h1>
          <p className="text-gray-600 mb-2">{t('farmer.rejectedBody')}</p>
          {farmer.remarks && (
            <p className="text-sm bg-red-50 border border-red-200 rounded p-2">
              <strong>{t('farmer.remarks')}:</strong> {farmer.remarks}
            </p>
          )}
        </div>
        <FarmerProfileForm onSubmitted={refresh} />
      </div>
    );
  }

  return (
    <div className="max-w-md bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-2">{t('farmer.verifiedTitle')}</h1>
      <p className="text-gray-600">{t('farmer.verifiedBody')}</p>
    </div>
  );
}

export default FarmerDashboard;
