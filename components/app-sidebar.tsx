"use client"

import * as React from "react"
import {
  Mail,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ItinerariesSwitcher } from "./itineraries-switcher"
import { usePendingInvites } from "@/hooks/use-itinerary-invites"
import { Button } from "./ui/button"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Il mio viaggio",
      url: "/protected",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Itinerario",
          url: "/protected",
        },
        {
          title: "Tappe",
          url: "/protected/stops",
        },
        {
          title: "Attività",
          url: "/protected/activities",
        },
      ],
    },
    {
      title: "Configurazioni",
      url: "/protected/config",
      icon: Settings2,
      items: [
        {
          title: "Generale",
          url: "/protected/config",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ItinerariesSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <PendingInvitesIndicator />
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function PendingInvitesIndicator() {
  const { data: pendingInvites = [] } = usePendingInvites();

  if (pendingInvites.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start text-yellow-600 border-yellow-600 hover:bg-yellow-50"
      >
        <Mail className="h-4 w-4 mr-2" />
        {pendingInvites.length} invito{pendingInvites.length !== 1 ? 'i' : ''} pendente{pendingInvites.length !== 1 ? 'i' : ''}
      </Button>
    </div>
  );
}
