"use client";

import { IContext, ISession } from "@components/types";
import { createContext, useContext, useState, ReactNode } from "react";

const SessionContext = createContext<IContext | null>(null);

type SessionContextProviderProps = {
  children: ReactNode;
};

export const SessionContextProvider: React.FC<SessionContextProviderProps> = ({
  children,
}) => {
  const sessionString: string | null = localStorage.getItem("chat_session");
  const sessionFromLocalStorage = sessionString && JSON.parse(sessionString);
  const [session, setSession] = useState<ISession | null>(
    sessionFromLocalStorage
  );

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = (): IContext => {
  const sessionContext = useContext(SessionContext);
  if (!sessionContext) {
    throw new Error("useSessionContext must be used within a Session Context");
  }
  return sessionContext;
};
