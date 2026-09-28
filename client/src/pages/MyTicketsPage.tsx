import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ticketApi } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useTicketQuery } from '../hooks/useTicketQuery';
import { PageHeader } from '../components/PageHeader';
import { TicketFilters } from '../components/TicketFilters';
import { TicketCard } from '../components/TicketCard';
import { Pagination } from '../components/Pagination';
import { EmptyState, ErrorState, ListSkeleton } from '../components/Feedback';

export function MyTicketsPage() {
  const { query, update, search, setSearch } = useTicketQuery();
  const { data, loading, error, reload } = useAsync(() => ticketApi.list(query), [query]);
  const filtered = !!(query.search || query.status || query.priority || query.category);

  return (
    <>
      <PageHeader
        title="My tickets"
        subtitle="Everything you’ve raised with the support team"
        actions={
          <Link to="/tickets/new" className="btn-primary">
            <Plus className="h-4 w-4" /> New ticket
          </Link>
        }
      />

      <TicketFilters search={search} onSearch={setSearch} filters={query} onChange={update} />

      <section className="mt-6 space-y-3" aria-live="polite" aria-busy={loading}>
        {loading && !data ? (
          <ListSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data?.tickets.length ? (
          filtered ? (
            <EmptyState title="No matching tickets" description="Try changing or clearing your filters." />
          ) : (
            <EmptyState
              title="No tickets yet"
              description="When you need help, create a ticket and our team will pick it up."
              action={<Link to="/tickets/new" className="btn-primary"><Plus className="h-4 w-4" /> Create your first ticket</Link>}
            />
          )
        ) : (
          <div className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {data.tickets.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
            <Pagination pagination={data.pagination} onChange={(page) => update({ page })} />
          </div>
        )}
      </section>
    </>
  );
}
