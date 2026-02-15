import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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

  const checkAdminAndFinish = useCallback(async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const { data: adminData } = await supabase.rpc("is_admin");
        setIsAdmin(!!adminData);
        const { data: roleData } = await supabase.rpc("has_any_role");
        setHasAnyRole(!!roleData);
      } catch {
        setIsAdmin(false);
        setHasAnyRole(false);
      }
    } else {
      setIsAdmin(false);
      setHasAnyRole(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      // Sync social profile data on sign in
      if (event === 'SIGNED_IN' && newSession?.user) {
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
            .then(() => {}); // fire and forget
        }
        setLoading(true);
        setTimeout(() => {
          if (mounted) checkAdminAndFinish(newSession.user ?? null);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setHasAnyRole(false);
        setLoading(false);
      }
      // TOKEN_REFRESHED: don't change loading/isAdmin
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!mounted) return;
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      checkAdminAndFinish(existingSession?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminAndFinish]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoading(false);
    // On success, onAuthStateChange SIGNED_IN will trigger checkAdminAndFinish
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
