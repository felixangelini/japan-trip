import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen md:ml-52 md:peer-data-[state=collapsed]:ml-0 transition-[margin-left] duration-200 ease-linear">
        <nav className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-col w-full">
            <div className="flex w-full gap-5 items-center px-3">
              <SidebarTrigger />
              <div className="flex w-full items-center font-semibold">
                <Link href={"/"}>Japan Trip</Link>
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
  );
}
