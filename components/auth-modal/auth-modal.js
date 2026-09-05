"use client";

import { usePathname, useRouter } from "next/navigation";
import Popup from "../popup/popup";
import AuthForms from "./auth-forms";

export default function AuthModal({
  isOpen,
  mode,
  reason,
  redirectPath,
  onModeChange,
  onClose,
  showClose = false,
}) {
  const router = useRouter();
  const pathname = usePathname();

  function handleSuccess() {
    onClose();
    if (redirectPath && redirectPath !== pathname) {
      router.push(redirectPath);
    }
    router.refresh();
  }

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      showClose={showClose}
      closePosition="bar"
      maxWidthClass="max-w-md"
      panelClassName="px-5 pb-6 pt-4 sm:px-7 sm:pb-7"
    >
      <AuthForms mode={mode} onModeChange={onModeChange} reason={reason} onSuccess={handleSuccess} />
    </Popup>
  );
}
