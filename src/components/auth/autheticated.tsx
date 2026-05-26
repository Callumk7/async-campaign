import { Navigate } from "@tanstack/react-router";
import { useAuth } from "./auth-provider";

interface AuthenticatedProps {
	children: React.ReactNode;
}

export function Authenticated({ children }: AuthenticatedProps) {
	const { isAuthenticated } = useAuth();
	if (!isAuthenticated) return <Navigate to="/login" />;
	return children;
}
