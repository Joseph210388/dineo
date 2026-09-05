"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import AuthModal from "./auth-modal";

const AuthModalContext = createContext({
  openAuth: () => {},
  closeAuth: () => {},
});

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("sign-in");
  const [reason, setReason] = useState("");
  const [redirectPath, setRedirectPath] = useState("");
  const [showClose, setShowClose] = useState(false);

  const openAuth = useCallback((options = {}) => {
    setMode(options.mode === "sign-up" ? "sign-up" : "sign-in");
    setReason(options.reason || "");
    setRedirectPath(options.redirectPath || "");
    setShowClose(options.showClose === true);
    setIsOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(() => ({ openAuth, closeAuth }), [openAuth, closeAuth]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={isOpen}
        mode={mode}
        reason={reason}
        redirectPath={redirectPath}
        onModeChange={setMode}
        onClose={closeAuth}
        showClose={showClose}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
