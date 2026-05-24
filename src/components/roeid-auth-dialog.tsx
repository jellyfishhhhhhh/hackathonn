import { useNavigate } from "@tanstack/react-router";
import { Slot } from "@radix-ui/react-slot";
import { cloneElement, isValidElement, type ReactNode } from "react";

/**
 * Wrapper care simulează redirect-ul către sso.roeid.ro.
 * Copilul (de obicei un <Button>) primește un onClick care navighează
 * la /sso/roeid — la fel cum „Login with Google" pleacă de pe site.
 */
export function RoeidAuthDialog({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const go = () => navigate({ to: "/sso/roeid" });

  if (isValidElement<{ onClick?: () => void }>(children)) {
    return cloneElement(children, { onClick: go });
  }
  return (
    <Slot onClick={go}>{children}</Slot>
  );
}
