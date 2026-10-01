import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { submitFarmerProfile } from '../../services/farmer.service';

const schema = z.object({
  citizenshipNo: z.string().min(3, 'Citizenship number is required'),
  landRegNo: z.string().min(1, 'Land registration number is required'),
  landArea: z.coerce.number().positive('Land area must be greater than 0'),
  district: z.string().min(2, 'District is required'),
});

function FarmerProfileForm({ onSubmitted }) {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState('');
  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const farmer = await submitFarmerProfile({ ...data, documents: files });
      onSubmitted(farmer);
    } catch (err) {
      setServerError(err.response?.data?.message || t('common.error'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-xl font-bold text-green-900">{t('farmer.profileTitle')}</h2>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="citizenshipNo">
          {t('farmer.citizenshipNo')}
        </label>
        <input
          id="citizenshipNo"
          type="text"
          className="w-full border rounded px-3 py-2"
          {...register('citizenshipNo')}
        />
        {errors.citizenshipNo && (
          <p className="text-red-600 text-sm mt-1">{errors.citizenshipNo.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="landRegNo">
          {t('farmer.landRegNo')}
        </label>
        <input
          id="landRegNo"
          type="text"
          className="w-full border rounded px-3 py-2"
          {...register('landRegNo')}
        />
        {errors.landRegNo && <p className="text-red-600 text-sm mt-1">{errors.landRegNo.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="landArea">
          {t('farmer.landArea')}
        </label>
        <input
          id="landArea"
          type="number"
          step="0.01"
          className="w-full border rounded px-3 py-2"
          {...register('landArea')}
        />
        {errors.landArea && <p className="text-red-600 text-sm mt-1">{errors.landArea.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="district">
          {t('farmer.district')}
        </label>
        <input
          id="district"
          type="text"
          className="w-full border rounded px-3 py-2"
          {...register('district')}
        />
        {errors.district && <p className="text-red-600 text-sm mt-1">{errors.district.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="documents">
          {t('farmer.documents')}
        </label>
        <input
          id="documents"
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          className="w-full text-sm"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
      </div>

      {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-700 text-white rounded py-2 hover:bg-green-800 disabled:opacity-60"
      >
        {t('farmer.submitProfile')}
      </button>
    </form>
  );
}

export default FarmerProfileForm;
