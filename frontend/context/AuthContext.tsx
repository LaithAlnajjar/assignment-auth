"use client";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
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
import { useRouter } from "next/navigation";

interface AuthContextType {
  currentUser: User | null;
  role: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
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
        try {
          const res = await api.get("/profile");
          setRole(res.data.role || "user");
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
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      const idToken = await userCredential.user.getIdToken();
      const refreshToken = userCredential.user.refreshToken;

      await api.post("/auth/login", { idToken, refreshToken });

      await api.post("/users");

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        pass
      );
      const idToken = await userCredential.user.getIdToken();
      const refreshToken = userCredential.user.refreshToken;

      await api.post("/auth/login", { idToken, refreshToken });

      await api.post("/users");

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      await signOut(auth);
      setRole(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout Failed", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        loading,
        signInWithGoogle,
        loginWithEmail,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
