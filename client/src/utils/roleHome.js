const ROLE_HOME = {
  farmer: '/farmer',
  buyer: '/buyer',
  officer: '/officer',
  admin: '/admin',
};

export function roleHome(role) {
  return ROLE_HOME[role] || '/';
}
