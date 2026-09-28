import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CATEGORIES, PRIORITIES } from '../lib/types';
import { ticketSchema, type TicketValues } from '../lib/schemas';
import { FormField } from './FormField';
import { Spinner } from './Feedback';

interface Props {
  defaultValues?: Partial<TicketValues>;
  submitLabel: string;
  onSubmit: (values: TicketValues) => Promise<void>;
  onCancel?: () => void;
}

export function TicketForm({ defaultValues, submitLabel, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TicketValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { priority: 'Medium', ...defaultValues },
  });
  const descLength = watch('description')?.length ?? 0;

  const err = (name: keyof TicketValues) => ({
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    className: `input ${errors[name] ? 'input-error' : ''}`,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-5 p-5 sm:p-6">
      <FormField label="Title" htmlFor="title" error={errors.title?.message}>
        <input id="title" placeholder="Short summary of the issue" {...err('title')} {...register('title')} />
      </FormField>

      <FormField label="Description" htmlFor="description" error={errors.description?.message} hint={`${descLength}/5000 characters`}>
        <textarea id="description" rows={6} placeholder="What happened? What did you expect? Steps to reproduce…" {...err('description')} {...register('description')} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Category" htmlFor="category" error={errors.category?.message}>
          <select id="category" defaultValue="" {...err('category')} {...register('category')}>
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-slate-700">Priority</legend>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((p) => (
              <label key={p} className="cursor-pointer">
                <input type="radio" value={p} className="peer sr-only" {...register('priority')} />
                <span className="block rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-600 transition peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/40">
                  {p}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>}
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="h-4 w-4" />} {submitLabel}
        </button>
      </div>
    </form>
  );
}
