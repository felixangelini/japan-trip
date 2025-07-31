import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ItinerariesProvider } from "@/components/itineraries-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { PendingInvitesHandler } from "@/components/pending-invites-handler";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <ItinerariesProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
        <nav className="flex h-16 shrink-0 items-center gap-2 border-b">
              <div className="flex flex-col w-full mx-3">
            <div className="flex w-full gap-5 items-center px-3">
                  <SidebarTrigger />
              <div className="flex w-full items-center font-semibold">
                    <Link href={"/"}>My Itineraries</Link>
              </div>
              <div className="w-full flex justify-end  border-b-foreground/10 h-16">
                <div className="w-full justify-end flex items-center p-3 px-5 text-sm">

                  {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
          {children}
        </main>
          </SidebarInset>
        </SidebarProvider>
        <PendingInvitesHandler />
      </ItinerariesProvider>
    </QueryProvider>
  );
}
