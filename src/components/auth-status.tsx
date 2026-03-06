"use client"

import { Button } from "@/components/ui/button"
import { GoogleSignIn } from "@/components/google-sign-in"
import { useAuth } from "@/components/auth-provider"

export function AuthStatus() {
  const { email, name, isAuthenticated, isReady, isWorking, signOut } = useAuth()

  if (!isReady) {
    return <p className="text-xs text-muted-foreground">Checking Supabase session...</p>
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Sign in to sync jobs and applications to Supabase.</p>
        <GoogleSignIn />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-sm font-medium truncate max-w-[140px]">{name || "Signed in"}</p>
        <p className="text-xs text-muted-foreground truncate max-w-[140px]">{email || "Supabase user"}</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => void signOut()} disabled={isWorking}>
        {isWorking ? "..." : "Sign out"}
      </Button>
    </div>
  )
}
