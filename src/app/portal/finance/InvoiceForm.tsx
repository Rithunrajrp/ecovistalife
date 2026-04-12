'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { createInvoice, updateInvoice, type FormState } from './actions'

interface Lead {
  id: string
  first_name: string
  last_name: string | null
  email: string
  phone: string | null
  company: string | null
}

interface Invoice {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  customer_address: string | null
  lead_id: string | null
  deal_id: string | null
  due_date: string
  notes: string | null
  items?: InvoiceItem[]
}

interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unit_price: number
  total?: number
}

interface InvoiceFormProps {
  invoice?: Invoice
  leads: Lead[]
}

export function InvoiceForm({ invoice, leads }: InvoiceFormProps) {
  const isEditing = !!invoice
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items || [{ description: '', quantity: 1, unit_price: 0 }]
  )

  const action = isEditing
    ? updateInvoice.bind(null, invoice.id)
    : createInvoice

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    action,
    {}
  )

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const taxAmount = subtotal * 0.18
  const totalAmount = subtotal + taxAmount

  const handleLeadSelect = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      const nameInput = document.getElementById('customer_name') as HTMLInputElement
      const emailInput = document.getElementById('customer_email') as HTMLInputElement
      const phoneInput = document.getElementById('customer_phone') as HTMLInputElement

      if (nameInput) nameInput.value = `${lead.first_name} ${lead.last_name || ''}`.trim()
      if (emailInput) emailInput.value = lead.email
      if (phoneInput && lead.phone) phoneInput.value = lead.phone
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {/* Error Message */}
      {state.message && !state.success && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{state.message}</p>
        </div>
      )}

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="lead_id" className="block text-sm font-medium text-gray-300 mb-2">
                Link to Lead (Optional)
              </label>
              <select
                id="lead_id"
                name="lead_id"
                defaultValue={invoice?.lead_id || ''}
                onChange={(e) => handleLeadSelect(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
              >
                <option value="">Select lead to auto-fill</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.first_name} {lead.last_name} - {lead.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-300 mb-2">
                Customer Name <span className="text-red-400">*</span>
              </label>
              <input
                id="customer_name"
                name="customer_name"
                type="text"
                defaultValue={invoice?.customer_name}
                required
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                placeholder="John Doe"
              />
              {state.errors?.customer_name && (
                <p className="mt-1 text-sm text-red-400">{state.errors.customer_name[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="customer_email" className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="customer_email"
                name="customer_email"
                type="email"
                defaultValue={invoice?.customer_email}
                required
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                placeholder="john@example.com"
              />
              {state.errors?.customer_email && (
                <p className="mt-1 text-sm text-red-400">{state.errors.customer_email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone
              </label>
              <input
                id="customer_phone"
                name="customer_phone"
                type="tel"
                defaultValue={invoice?.customer_phone || ''}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-300 mb-2">
                Due Date <span className="text-red-400">*</span>
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                defaultValue={invoice?.due_date?.split('T')[0] || ''}
                required
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
              />
              {state.errors?.due_date && (
                <p className="mt-1 text-sm text-red-400">{state.errors.due_date[0]}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="customer_address" className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>
              <textarea
                id="customer_address"
                name="customer_address"
                rows={2}
                defaultValue={invoice?.customer_address || ''}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 resize-none"
                placeholder="Customer address..."
              />
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Invoice Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    placeholder="Qty"
                    min="1"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    placeholder="Unit Price"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>
                <div className="w-32 py-2.5 text-right text-white">
                  ₹{(item.quantity * item.unit_price).toLocaleString()}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="p-2.5 text-gray-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">GST (18%)</span>
                  <span className="text-white">₹{taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-700">
                  <span className="text-white">Total</span>
                  <span className="text-[#D4AF37]">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={invoice?.notes || ''}
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 resize-none"
            placeholder="Any additional notes..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/finance/invoices"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEditing ? 'Update Invoice' : 'Create Invoice'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
