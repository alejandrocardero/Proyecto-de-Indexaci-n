"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-local";
import { useAppToast } from "@/components/feedback/ToastProvider";

interface ProtectedButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

export function ProtectedButton({
  children,
  onClick,
  href,
  className,
  ...props
}: ProtectedButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { showError } = useAppToast();

  const handleClick = () => {
    if (!isAuthenticated) {
      showError(
        "Debes autenticarte",
        "Inicia sesión o crea una cuenta para continuar."
      );
      return;
    }
    if (href) {
      router.push(href);
    }
    onClick?.();
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Button>
  );
}
