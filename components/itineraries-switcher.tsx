"use client"

import * as React from "react"
import { ChevronsUpDown, Earth, Plus, Lock, Globe } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useCurrentItinerary } from "@/hooks/use-current-itinerary"
import { CreateItineraryModal } from "./create-itinerary-modal"
import type { Itinerary } from "@/lib/schemas/itinerary"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export function ItinerariesSwitcher() {
    const { isMobile } = useSidebar()
    const { 
        itineraries, 
        currentItinerary, 
        setCurrentItinerary, 
        isLoading,
        error
    } = useCurrentItinerary()
    const [isModalOpen, setIsModalOpen] = React.useState(false)

    if (error) {
        return (
            <div className="flex items-center gap-2 text-sm text-red-600">
                <div className="h-4 w-4">⚠️</div>
                Errore nel caricamento
            </div>
        )
    }

    if (isLoading && itineraries.length === 0) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Caricamento...
            </div>
        )
    }

    if (!currentItinerary && itineraries.length === 0) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Crea Itinerario
                </Button>
                <CreateItineraryModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                />
            </div>
        )
    }

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Earth className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{currentItinerary?.title}</span>
                                    <span className="truncate text-xs">
                                        {currentItinerary?.is_public ? (
                                            <Globe className="inline h-3 w-3 mr-1" />
                                        ) : (
                                            <Lock className="inline h-3 w-3 mr-1" />
                                        )}
                                        {currentItinerary?.start_date && currentItinerary?.end_date 
                                            ? `${format(new Date(currentItinerary.start_date), 'dd MMM', { locale: it })} - ${format(new Date(currentItinerary.end_date), 'dd MMM yyyy', { locale: it })}`
                                            : 'Nessuna data'
                                        }
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-muted-foreground text-xs">
                                I tuoi Itinerari
                            </DropdownMenuLabel>
                            {itineraries.map((itinerary: Itinerary) => (
                                <DropdownMenuItem
                                    key={itinerary.id}
                                    onClick={() => setCurrentItinerary(itinerary)}
                                    className="gap-2 p-2"
                                >
                                    <div className="flex size-6 items-center justify-center rounded-md border">
                                        {itinerary.is_public ? (
                                            <Globe className="size-3.5 shrink-0" />
                                        ) : (
                                            <Lock className="size-3.5 shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{itinerary.title}</span>
                                        {itinerary.start_date && (
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(itinerary.start_date), 'dd MMM yyyy', { locale: it })}
                                            </span>
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="gap-2 p-2"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                    <Plus className="size-4" />
                                </div>
                                <div className="text-muted-foreground font-medium">Crea Itinerario</div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            
            <CreateItineraryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    )
}
