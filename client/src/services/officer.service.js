import api from './api';

export async function listPendingFarmers(status = 'pending') {
  const res = await api.get('/officer/farmers', { params: { status } });
  return res.data.data;
}

export async function decideFarmerVerification(farmerId, { status, remarks }) {
  const res = await api.patch(`/officer/farmers/${farmerId}`, { status, remarks });
  return res.data.data;
}

// Document downloads are auth-protected, so a plain <a href> won't carry the
// token; fetch as a blob and open it via an object URL instead.
export async function openFarmerDocument(farmerId, documentUrl) {
  const filename = documentUrl.split('/').pop();
  const res = await api.get(`/farmers/${farmerId}/documents/${filename}`, { responseType: 'blob' });
  const blobUrl = URL.createObjectURL(res.data);
  window.open(blobUrl, '_blank', 'noopener,noreferrer');
}
