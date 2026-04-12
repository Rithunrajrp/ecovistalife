import { redirect } from 'next/navigation'

// Portal root redirects to dashboard
export default function PortalPage() {
  redirect('/dashboard')
}
