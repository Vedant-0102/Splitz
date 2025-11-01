import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function useStoreUser() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const [userId, setUserId] = useState(null);
  const storeUser = useMutation(api.users.store);
  
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    let isMounted = true;

    async function createUser() {
      try {
        const id = await storeUser();
        if (isMounted) {
          setUserId(id);
        }
      } catch (error) {
        console.error("Error storing user:", error);
      }
    }
    
    createUser();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  return {
    isLoading: isLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
  };
}