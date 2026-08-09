import {
  useNavigate as useTanstackNavigate,
  useLocation as useTanstackLocation,
} from "@tanstack/react-router";

/**
 * Thin compatibility layer so ported components can navigate with a plain
 * path string, exactly as they did before, while the app uses TanStack Router.
 */
export function useNavigate() {
  const navigate = useTanstackNavigate();
  return (to: string, options?: { replace?: boolean }) => {
    void navigate({ to: to as never, replace: options?.replace });
  };
}

export function useLocation() {
  return useTanstackLocation();
}
