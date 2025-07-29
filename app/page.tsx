import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import HeroCountdown from "@/components/hero-countdown";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <main className="h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Japan Trip</Link>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        <div className="flex-1 flex w-full flex-col">
          <HeroCountdown actionButton={data ? <Link href="/protected">
            <Button> Go App </Button>
          </Link> : <AuthButton />} />
        </div>
      </div>
    </main>
  );
}
