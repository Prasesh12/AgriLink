import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { roleHome } from '../../utils/roleHome';

const phoneRegex = /^9\d{9}$/;

const schema = z.object({
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit phone number'),
  password: z.string().min(1, 'Password is required'),
});

function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const user = await login(data);
      navigate(roleHome(user.role));
    } catch {
      setServerError(t('auth.loginFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-white rounded-lg shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-green-900">{t('auth.loginTitle')}</h1>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">
            {t('auth.phone')}
          </label>
          <input
            id="phone"
            type="text"
            inputMode="numeric"
            className="w-full border rounded px-3 py-2"
            {...register('phone')}
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            {t('auth.password')}
          </label>
          <input
            id="password"
            type="password"
            className="w-full border rounded px-3 py-2"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-700 text-white rounded py-2 hover:bg-green-800 disabled:opacity-60"
        >
          {t('auth.loginButton')}
        </button>

        <p className="text-sm text-center text-gray-600">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-green-700 font-medium">
            {t('auth.registerLink')}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
