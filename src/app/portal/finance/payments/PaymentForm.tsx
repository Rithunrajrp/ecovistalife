'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { recordPayment, type FormState } from '../actions'

interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  total_amount: number
  amount_paid: number
  status: string
}

interface PaymentFormProps {
  invoices: Invoice[]
  defaultInvoiceId?: string
}

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
]

export function PaymentForm({ invoices, defaultInvoiceId }: PaymentFormProps) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(defaultInvoiceId || '')
  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId)
  const remainingAmount = selectedInvoice
    ? selectedInvoice.total_amount - selectedInvoice.amount_paid
    : 0

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    recordPayment,
    {}
  )

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString()}`
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Error Message */}
      {state.message && !state.success && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{state.message}</p>
        </div>
      )}

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
        {/* Invoice Selection */}
        <div>
          <label htmlFor="invoice_id" className="block text-sm font-medium text-gray-300 mb-2">
            Invoice <span className="text-red-400">*</span>
          </label>
          <select
            id="invoice_id"
            name="invoice_id"
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
          >
            <option value="">Select invoice</option>
            {invoices.map(invoice => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoice_number} - {invoice.customer_name} ({formatCurrency(invoice.total_amount - invoice.amount_paid)} due)
              </option>
            ))}
          </select>
          {state.errors?.invoice_id && (
            <p className="mt-1 text-sm text-red-400">{state.errors.invoice_id[0]}</p>
          )}
        </div>

        {/* Invoice Summary */}
        {selectedInvoice && (
          <div className="p-4 bg-gray-800/50 rounded-xl">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Amount</p>
                <p className="text-white font-medium">{formatCurrency(selectedInvoice.total_amount)}</p>
              </div>
              <div>
                <p className="text-gray-500">Amount Paid</p>
                <p className="text-emerald-400">{formatCurrency(selectedInvoice.amount_paid)}</p>
              </div>
              <div>
                <p className="text-gray-500">Remaining</p>
                <p className="text-[#D4AF37] font-semibold">{formatCurrency(remainingAmount)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount || undefined}
                defaultValue={remainingAmount || ''}
                required
                className="w-full pl-8 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                placeholder="0.00"
              />
            </div>
            {state.errors?.amount && (
              <p className="mt-1 text-sm text-red-400">{state.errors.amount[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-300 mb-2">
              Payment Method <span className="text-red-400">*</span>
            </label>
            <select
              id="payment_method"
              name="payment_method"
              defaultValue="bank_transfer"
              required
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
            {state.errors?.payment_method && (
              <p className="mt-1 text-sm text-red-400">{state.errors.payment_method[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-300 mb-2">
              Payment Date <span className="text-red-400">*</span>
            </label>
            <input
              id="payment_date"
              name="payment_date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
            />
            {state.errors?.payment_date && (
              <p className="mt-1 text-sm text-red-400">{state.errors.payment_date[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="reference_number" className="block text-sm font-medium text-gray-300 mb-2">
              Reference Number
            </label>
            <input
              id="reference_number"
              name="reference_number"
              type="text"
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
              placeholder="Transaction ID, Cheque Number, etc."
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 resize-none"
              placeholder="Any additional notes..."
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/finance/payments"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </Link>

        <button
          type="submit"
          disabled={isPending || !selectedInvoiceId}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Recording...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Record Payment
            </>
          )}
        </button>
      </div>
    </form>
  )
}
