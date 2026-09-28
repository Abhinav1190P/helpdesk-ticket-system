import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="text-sm font-semibold text-indigo-600">404</p>
    <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
    <p className="mt-2 text-sm text-slate-500">The page you’re looking for doesn’t exist.</p>
    <Link to="/" className="btn-primary mt-6">Go home</Link>
  </div>
);
