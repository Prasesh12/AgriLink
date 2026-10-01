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
  name: z.string().min(2, 'Name is too short'),
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit phone number'),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['farmer', 'buyer']),
});

function Register() {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'farmer' } });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const payload = { ...data, email: data.email || undefined };
      const user = await registerUser(payload);
      navigate(roleHome(user.role));
    } catch (err) {
      setServerError(err.response?.data?.message || t('auth.registerFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-white rounded-lg shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-green-900">{t('auth.registerTitle')}</h1>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            {t('auth.name')}
          </label>
          <input id="name" type="text" className="w-full border rounded px-3 py-2" {...register('name')} />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>

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
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            {t('auth.email')}
          </label>
          <input id="email" type="email" className="w-full border rounded px-3 py-2" {...register('email')} />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
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

        <fieldset>
          <legend className="block text-sm font-medium mb-1">{t('auth.role')}</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" value="farmer" {...register('role')} />
              {t('auth.roleFarmer')}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="buyer" {...register('role')} />
              {t('auth.roleBuyer')}
            </label>
          </div>
        </fieldset>

        {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-700 text-white rounded py-2 hover:bg-green-800 disabled:opacity-60"
        >
          {t('auth.registerButton')}
        </button>

        <p className="text-sm text-center text-gray-600">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-green-700 font-medium">
            {t('auth.loginLink')}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
