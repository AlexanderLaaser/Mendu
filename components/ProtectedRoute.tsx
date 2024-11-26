"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/authContext";
import LoadingIcon from "./icons/Loading";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingIcon />;
  }

  return <>{user ? children : null}</>;
};

export default ProtectedRoute;
