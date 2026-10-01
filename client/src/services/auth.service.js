import api from './api';

export async function registerUser(payload) {
  const res = await api.post('/auth/register', payload);
  return res.data.data;
}

export async function loginUser(payload) {
  const res = await api.post('/auth/login', payload);
  return res.data.data;
}

export async function fetchMe() {
  const res = await api.get('/auth/me');
  return res.data.data;
}
