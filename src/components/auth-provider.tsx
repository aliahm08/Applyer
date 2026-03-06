"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { type AuthChangeEvent, type Session, type User } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type SessionUser = {
  uid: string
  email: string | null
  name: string | null
  photoUrl: string | null
}

type AuthState = {
  user: SessionUser | null
  email: string | null
  name: string | null
  photoUrl: string | null
  isAuthenticated: boolean
  isReady: boolean
  isWorking: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function toSessionUser(user: User): SessionUser {
  return {
    uid: user.id,
    email: user.email ?? null,
    name: (user.user_metadata?.full_name as string | undefined) ?? (user.user_metadata?.name as string | undefined) ?? null,
    photoUrl: (user.user_metadata?.avatar_url as string | undefined) ?? (user.user_metadata?.picture as string | undefined) ?? null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let supabase

    try {
      supabase = getSupabaseBrowserClient()
    } catch (sessionError) {
      setUser(null)
      setError(sessionError instanceof Error ? sessionError.message : "Supabase auth is not configured")
      setIsReady(true)
      return
    }

    const syncUser = async (_event?: AuthChangeEvent, session?: Session | null) => {
      try {
        const nextUser = session?.user ?? (await supabase.auth.getUser()).data.user ?? null
        setUser(nextUser ? toSessionUser(nextUser) : null)
        setError(null)
      } catch (sessionError) {
        setUser(null)
        setError(sessionError instanceof Error ? sessionError.message : "Unable to establish Supabase session")
      } finally {
        setIsReady(true)
        setIsWorking(false)
      }
    }

    void syncUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      void syncUser(event, session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      email: user?.email ?? null,
      name: user?.name ?? null,
      photoUrl: user?.photoUrl ?? null,
      isAuthenticated: Boolean(user),
      isReady,
      isWorking,
      error,
      signInWithGoogle: async () => {
        setIsWorking(true)
        setError(null)

        try {
          const currentPath = window.location.pathname === "/auth/callback" ? "/" : window.location.pathname
          const { error: signInError } = await getSupabaseBrowserClient().auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`,
            },
          })

          if (signInError) {
            throw signInError
          }
        } catch (signInError) {
          setError(signInError instanceof Error ? signInError.message : "Google sign-in failed")
          setIsWorking(false)
        }
      },
      signOut: async () => {
        setIsWorking(true)

        try {
          const { error: signOutError } = await getSupabaseBrowserClient().auth.signOut()
          if (signOutError) {
            throw signOutError
          }
          setUser(null)
        } catch (signOutError) {
          setError(signOutError instanceof Error ? signOutError.message : "Sign-out failed")
        } finally {
          setIsWorking(false)
        }
      },
    }),
    [error, isReady, isWorking, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}
