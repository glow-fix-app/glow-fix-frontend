import { Link } from "react-router-dom";

export function AuthFooterLink({ children, to }) {
  return (
    <Link className="font-medium text-text-primary underline decoration-text-primary/20 underline-offset-4 transition-all hover:decoration-text-primary hover:text-black" to={to}>
      {children}
    </Link>
  );
}
