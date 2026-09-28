import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Headset } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import { FormField } from '../components/FormField';
import { Spinner } from '../components/Feedback';
import { loginSchema, registerSchema, type LoginValues, type RegisterValues } from '../lib/schemas';

function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Headset className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="card p-6 sm:p-8">{children}</div>
        <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
      </div>
    </div>
  );
}

function PasswordInput({ id, invalid, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { id: string; invalid: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className={`input pr-10 ${invalid ? 'input-error' : ''}`}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        {...rest}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-400 hover:text-slate-600"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setServerError(null);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(from ?? (user.role === 'admin' ? '/admin' : '/tickets'), { replace: true });
    } catch (e) {
      setServerError(getErrorMessage(e, 'Login failed'));
    }
  });

  return (
    <AuthShell
      title="Sign in to Helpdesk"
      subtitle="Track and manage your support requests"
      footer={<>Don’t have an account? <Link to="/register" className="font-medium text-indigo-600 hover:underline">Create one</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>}
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" className={`input ${errors.email ? 'input-error' : ''}`} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" invalid={!!errors.password} {...register('password')} />
        </FormField>
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="h-4 w-4" />} Sign in
        </button>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setServerError(null);
    try {
      await signUp(name, email, password);
      toast.success('Account created!');
      navigate('/tickets', { replace: true });
    } catch (e) {
      setServerError(getErrorMessage(e, 'Registration failed'));
    }
  });

  return (
    <AuthShell
      title="Create your account"
      subtitle="Raise and track support tickets in one place"
      footer={<>Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:underline">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>}
        <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
          <input id="name" autoComplete="name" className={`input ${errors.name ? 'input-error' : ''}`} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} {...register('name')} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" className={`input ${errors.email ? 'input-error' : ''}`} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message} hint="At least 8 characters, with a letter and a number">
          <PasswordInput id="password" autoComplete="new-password" invalid={!!errors.password} {...register('password')} />
        </FormField>
        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <PasswordInput id="confirmPassword" autoComplete="new-password" invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
        </FormField>
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="h-4 w-4" />} Create account
        </button>
      </form>
    </AuthShell>
  );
}
