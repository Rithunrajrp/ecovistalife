import { requireManagerOrAdmin } from '@/lib/dal'
import { getInvoicesForPayment } from '../../actions'
import { PaymentForm } from '../PaymentForm'

interface PageProps {
  searchParams: Promise<{ invoice_id?: string }>
}

export default async function NewPaymentPage({ searchParams }: PageProps) {
  await requireManagerOrAdmin()
  const { invoice_id } = await searchParams
  const invoices = await getInvoicesForPayment()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Record Payment</h1>
        <p className="text-gray-400 mt-1">
          Record a new payment against an invoice.
        </p>
      </div>

      {/* Form */}
      <PaymentForm invoices={invoices} defaultInvoiceId={invoice_id} />
    </div>
  )
}
