import api from './api';

export async function submitFarmerProfile({ citizenshipNo, landRegNo, landArea, district, documents }) {
  const form = new FormData();
  form.append('citizenshipNo', citizenshipNo);
  form.append('landRegNo', landRegNo);
  form.append('landArea', landArea);
  form.append('district', district);
  (documents || []).forEach((file) => form.append('documents', file));

  const res = await api.post('/farmers/profile', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
