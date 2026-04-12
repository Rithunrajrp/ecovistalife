'use client'

import { useState, useTransition } from 'react'
import { Send, Printer, XCircle, MoreHorizontal, Loader2 } from 'lucide-react'
import { updateInvoiceStatus } from '../../actions'

interface Invoice {
  id: string
  status: string
  invoice_number: string
}

interface InvoiceActionsProps {
  invoice: Invoice
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleStatusUpdate = (status: 'sent' | 'cancelled') => {
    startTransition(async () => {
      await updateInvoiceStatus(invoice.id, status)
      setIsOpen(false)
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MoreHorizontal className="w-4 h-4" />
        )}
        Actions
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-[#1f2937] border border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
            {invoice.status === 'draft' && (
              <button
                onClick={() => handleStatusUpdate('sent')}
                disabled={isPending}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-blue-400" />
                Mark as Sent
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-white hover:bg-gray-800 transition-colors"
            >
              <Printer className="w-4 h-4 text-gray-400" />
              Print Invoice
            </button>
            {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isPending}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-red-400 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Cancel Invoice
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
