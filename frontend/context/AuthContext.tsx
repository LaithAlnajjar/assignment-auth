"use client";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import auth from "@/lib/firebase";
import { api } from "@/lib/api";
import { useRouter } from "next/router";

interface AuthContextType {
  currentUser: User | null;
  role: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setCurrentUser(currentUser);

      if (currentUser) {
        const token = await currentUser.getIdToken();

        try {
          const res = await api.get("http://localhost:3000/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data;
          setRole(data.user?.role || "user");
        } catch (err) {
          console.error("Failed to fetch profile", err);
          setRole("user");
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push("/dashboard");
  };

  const logout = async () => {
    await signOut(auth);
    setRole(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, role, loading, signInWithGoogle, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
