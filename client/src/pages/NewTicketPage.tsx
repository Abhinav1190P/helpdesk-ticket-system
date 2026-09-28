import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ticketApi } from '../api';
import { getErrorMessage } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { TicketForm } from '../components/TicketForm';

export function NewTicketPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New support ticket" subtitle="Describe your issue and we’ll get back to you." />
      <TicketForm
        submitLabel="Create ticket"
        onCancel={() => navigate(-1)}
        onSubmit={async (values) => {
          try {
            const ticket = await ticketApi.create(values);
            toast.success('Ticket created');
            navigate(`/tickets/${ticket.id}`, { replace: true });
          } catch (e) {
            toast.error(getErrorMessage(e, 'Could not create ticket'));
          }
        }}
      />
    </div>
  );
}
