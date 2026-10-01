import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  decideFarmerVerification,
  listPendingFarmers,
  openFarmerDocument,
} from '../../services/officer.service';

function FarmerRow({ farmer, onDecide }) {
  const { t } = useTranslation();
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);

  const handleDecide = async (status) => {
    setBusy(true);
    try {
      await onDecide(farmer.id, { status, remarks });
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className="border-b align-top">
      <td className="py-3 pr-4">
        <div className="font-medium">{farmer.user.name}</div>
        <div className="text-sm text-gray-500">{farmer.user.phone}</div>
      </td>
      <td className="py-3 pr-4 text-sm">
        <div>{farmer.citizenshipNo}</div>
        <div className="text-gray-500">{farmer.landRegNo}</div>
      </td>
      <td className="py-3 pr-4 text-sm">{farmer.landArea}</td>
      <td className="py-3 pr-4 text-sm">
        {farmer.documentUrls.length === 0 && <span className="text-gray-400">-</span>}
        {farmer.documentUrls.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => openFarmerDocument(farmer.id, url)}
            className="block text-green-700 underline text-sm"
          >
            {t('common.viewDocument')}
          </button>
        ))}
      </td>
      <td className="py-3 pr-4 text-sm capitalize">{farmer.verificationStatus}</td>
      {farmer.verificationStatus === 'pending' ? (
        <td className="py-3">
          <input
            type="text"
            placeholder={t('officer.remarksPlaceholder')}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-48 mb-2 block"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleDecide('verified')}
              className="px-3 py-1 rounded bg-green-700 text-white text-sm hover:bg-green-800 disabled:opacity-60"
            >
              {t('officer.verify')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleDecide('rejected')}
              className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
            >
              {t('officer.reject')}
            </button>
          </div>
        </td>
      ) : (
        <td className="py-3 text-sm text-gray-500">{farmer.remarks || '-'}</td>
      )}
    </tr>
  );
}

function OfficerFarmerVerification() {
  const { t } = useTranslation();
  const [status, setStatus] = useState('pending');
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (nextStatus) => {
    setLoading(true);
    setError('');
    try {
      const data = await listPendingFarmers(nextStatus);
      setFarmers(data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Standard fetch-on-filter-change effect; load() sets state before its
    // first await, which this rule flags conservatively.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(status);
    // load is intentionally omitted: it's redefined each render but stable in behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleDecide = async (farmerId, payload) => {
    await decideFarmerVerification(farmerId, payload);
    load(status);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-4">{t('officer.verificationQueueTitle')}</h1>

      <div className="mb-4">
        <label className="text-sm font-medium mr-2" htmlFor="status-filter">
          {t('officer.statusFilter')}
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="pending">pending</option>
          <option value="verified">verified</option>
          <option value="rejected">rejected</option>
        </select>
      </div>

      {loading && <p>{t('common.loading')}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && farmers.length === 0 && <p className="text-gray-500">{t('officer.noFarmers')}</p>}

      {!loading && farmers.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-sm text-gray-600">
                <th className="py-2 px-4">Farmer</th>
                <th className="py-2 px-4">IDs</th>
                <th className="py-2 px-4">Land (ropani)</th>
                <th className="py-2 px-4">Documents</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((farmer) => (
                <FarmerRow key={farmer.id} farmer={farmer} onDecide={handleDecide} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OfficerFarmerVerification;
