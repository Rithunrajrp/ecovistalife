'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { DataTable, Column } from '@/components/portal/ui/DataTable'
import { StatusBadge } from '@/components/portal/ui/StatusBadge'
import { Mail, Phone, Building2 } from 'lucide-react'

interface Lead {
  id: string
  first_name: string
  last_name: string | null
  email: string
  phone: string | null
  company: string | null
  status: string
  priority: string | null
  source: string
  created_at: string
  assigned_user: { full_name: string } | null
  project: { title: string } | null
}

interface LeadsTableProps {
  leads: Lead[]
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const router = useRouter()

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (lead) => (
        <div>
          <p className="font-medium text-white">
            {lead.first_name} {lead.last_name}
          </p>
          {lead.company && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
              <Building2 className="w-3 h-3" />
              {lead.company}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (lead) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Mail className="w-3.5 h-3.5" />
            <span className="text-xs">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Phone className="w-3.5 h-3.5" />
              <span className="text-xs">{lead.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (lead) => <StatusBadge status={lead.status} />,
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: (lead) => (
        <span className="text-gray-400 capitalize text-xs">
          {lead.source.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'assigned_to',
      header: 'Assigned To',
      render: (lead) => (
        <span className="text-gray-400">
          {lead.assigned_user?.full_name || '-'}
        </span>
      ),
    },
    {
      key: 'interested_in_project',
      header: 'Interested In',
      render: (lead) => (
        <span className="text-gray-400 text-xs">
          {lead.project?.title || '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (lead) => (
        <span className="text-gray-500 text-xs">
          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      data={leads}
      columns={columns}
      keyField="id"
      searchPlaceholder="Search leads by name, email, company..."
      onRowClick={(lead) => router.push(`/leads/${lead.id}`)}
      emptyMessage="No leads found. Add your first lead to get started."
    />
  )
}
