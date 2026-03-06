"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { Chrome } from "lucide-react"

export function GoogleSignIn() {
  const { error, isWorking, signInWithGoogle } = useAuth()

  return (
    <div className="space-y-2">
      <Button onClick={() => void signInWithGoogle()} disabled={isWorking} className="w-full gap-2">
        <Chrome className="h-4 w-4" />
        {isWorking ? "Redirecting..." : "Continue with Google"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
