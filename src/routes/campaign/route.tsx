import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/campaign')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/campaign"!</div>
}
