"use client"

import * as React from "react"
import {
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
