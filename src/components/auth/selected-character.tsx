import { Navigate } from "@tanstack/react-router";
import { useAuth } from "./auth-provider";

interface SelectedCharacterProps {
	children: React.ReactNode;
	loadingFallback?: React.ReactNode;
}

export function SelectedCharacter({
	children,
	loadingFallback = null,
}: SelectedCharacterProps) {
	const {
		isAuthenticated,
		isSelectedUserLoading,
		isCharacterSelected,
		isSelectedCharacterLoading,
		selectedUserId,
	} = useAuth();

	if (isSelectedUserLoading || isSelectedCharacterLoading) {
		return loadingFallback;
	}

	if (!isAuthenticated || !selectedUserId) {
		return <Navigate to="/login" />;
	}

	if (!isCharacterSelected) {
		return (
			<Navigate
				to="/users/$userId/characters"
				params={{ userId: selectedUserId }}
			/>
		);
	}

	return children;
}
