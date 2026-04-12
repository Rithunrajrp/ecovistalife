// Login page has its own layout without the portal sidebar/topbar
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
