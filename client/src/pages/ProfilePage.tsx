import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { userApi } from '../api';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { passwordSchema, profileSchema, type PasswordValues, type ProfileValues } from '../lib/schemas';
import { PageHeader } from '../components/PageHeader';
import { FormField } from '../components/FormField';
import { Spinner } from '../components/Feedback';

export function ProfilePage() {
  const { user, setUser } = useAuth();

  const profile = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name } });
  const pw = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const saveProfile = profile.handleSubmit(async ({ name }) => {
    try {
      setUser(await userApi.updateProfile(name));
      toast.success('Profile updated');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  });

  const savePassword = pw.handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      pw.reset();
      toast.success('Password changed');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  });

  const pe = profile.formState.errors;
  const we = pw.formState.errors;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Profile" subtitle={`${user?.email} · ${user?.role}`} />

      <form onSubmit={saveProfile} noValidate className="card space-y-4 p-5 sm:p-6">
        <h2 className="font-semibold text-slate-900">Personal details</h2>
        <FormField label="Full name" htmlFor="name" error={pe.name?.message}>
          <input id="name" className={`input ${pe.name ? 'input-error' : ''}`} {...profile.register('name')} />
        </FormField>
        <div className="flex justify-end">
          <button className="btn-primary" disabled={profile.formState.isSubmitting}>
            {profile.formState.isSubmitting && <Spinner className="h-4 w-4" />} Save
          </button>
        </div>
      </form>

      <form onSubmit={savePassword} noValidate className="card space-y-4 p-5 sm:p-6">
        <h2 className="font-semibold text-slate-900">Change password</h2>
        <FormField label="Current password" htmlFor="currentPassword" error={we.currentPassword?.message}>
          <input id="currentPassword" type="password" autoComplete="current-password" className={`input ${we.currentPassword ? 'input-error' : ''}`} {...pw.register('currentPassword')} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="New password" htmlFor="newPassword" error={we.newPassword?.message}>
            <input id="newPassword" type="password" autoComplete="new-password" className={`input ${we.newPassword ? 'input-error' : ''}`} {...pw.register('newPassword')} />
          </FormField>
          <FormField label="Confirm new password" htmlFor="confirmPassword" error={we.confirmPassword?.message}>
            <input id="confirmPassword" type="password" autoComplete="new-password" className={`input ${we.confirmPassword ? 'input-error' : ''}`} {...pw.register('confirmPassword')} />
          </FormField>
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" disabled={pw.formState.isSubmitting}>
            {pw.formState.isSubmitting && <Spinner className="h-4 w-4" />} Update password
          </button>
        </div>
      </form>
    </div>
  );
}
