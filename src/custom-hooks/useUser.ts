import { account } from "@components/app/api";
import { ISession } from "@components/types";
import { useState, useEffect } from "react";

const useSession = () => {
  const [user, setUser] = useState<ISession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const accountInfo = await account.get();
        setUser(accountInfo);
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);
  return { user, setUser, loading };
};

export default useSession;
