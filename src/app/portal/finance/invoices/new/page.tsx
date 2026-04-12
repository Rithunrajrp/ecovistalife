import { requireManagerOrAdmin } from '@/lib/dal'
import { getLeadsForInvoice } from '../../actions'
import { InvoiceForm } from '../../InvoiceForm'

export default async function NewInvoicePage() {
  await requireManagerOrAdmin()
  const leads = await getLeadsForInvoice()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Create Invoice</h1>
        <p className="text-gray-400 mt-1">
          Create a new invoice for a customer or lead.
        </p>
      </div>

      {/* Form */}
      <InvoiceForm leads={leads} />
    </div>
  )
}
