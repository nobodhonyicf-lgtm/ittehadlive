import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  hasAnyRole: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAnyRole, setHasAnyRole] = useState(false);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const checkRoles = useCallback(async (currentUser: User | null, keepOnError = false) => {
    if (currentUser) {
      try {
        const [adminRes, roleRes] = await Promise.all([
          supabase.rpc("is_admin"),
          supabase.rpc("has_any_role"),
        ]);
        setIsAdmin(!!adminRes.data);
        setHasAnyRole(!!roleRes.data);
      } catch {
        // On re-check errors, keep existing values to prevent false redirects
        if (!keepOnError) {
          setIsAdmin(false);
          setHasAnyRole(false);
        }
      }
    } else {
      setIsAdmin(false);
      setHasAnyRole(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' && newSession?.user) {
        // Sync social profile data
        const meta = newSession.user.user_metadata;
        const fullName = meta?.full_name || meta?.name;
        const avatarUrl = meta?.avatar_url || meta?.picture;
        if (fullName || avatarUrl) {
          const updates: Record<string, string> = {};
          if (fullName) updates.full_name = fullName;
          if (avatarUrl) updates.avatar_url = avatarUrl;
          supabase
            .from("profiles")
            .update(updates)
            .eq("user_id", newSession.user.id)
            .then(() => {});
        }

        // Only re-check roles if initial load is already done
        // Do NOT set loading=true here — it unmounts the entire admin UI and closes dialogs
        if (initializedRef.current) {
          await checkRoles(newSession.user, true);
        }
        // Ensure loading is turned off after sign-in completes
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        // Token refresh — do nothing, keep UI stable
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setHasAnyRole(false);
        setLoading(false);
      }
    });

    // THEN check existing session
    const initAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        await checkRoles(existingSession?.user ?? null);
      } finally {
        if (mounted) {
          initializedRef.current = true;
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkRoles]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoading(false);
    // On success, onAuthStateChange SIGNED_IN will trigger role check
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, hasAnyRole, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};