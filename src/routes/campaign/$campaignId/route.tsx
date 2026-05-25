import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/campaign/$campaignId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/campaign/$campaignId"!</div>
}
