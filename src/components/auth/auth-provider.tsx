import * as React from "react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

const SELECTED_CHARACTER_STORAGE_KEY = "async-campaign:selected-character-id";

type AuthContextValue = {
	selectedCharacterId: Id<"characters"> | null;
	selectedCharacter: Doc<"characters"> | null;
	isAuthenticated: boolean;
	selectCharacter: (character: Doc<"characters">) => void;
	clearSelectedCharacter: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
	children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
	const [selectedCharacter, setSelectedCharacter] =
		React.useState<Doc<"characters"> | null>(null);

	const [selectedCharacterId, setSelectedCharacterId] =
		React.useState<Id<"characters"> | null>(() => {
			if (typeof window === "undefined") return null;
			return window.localStorage.getItem(
				SELECTED_CHARACTER_STORAGE_KEY,
			) as Id<"characters"> | null;
		});

	const selectCharacter = React.useCallback((character: Doc<"characters">) => {
		setSelectedCharacter(character);
		setSelectedCharacterId(character._id);
		if (typeof window !== "undefined") {
			window.localStorage.setItem(
				SELECTED_CHARACTER_STORAGE_KEY,
				character._id,
			);
		}
	}, []);

	const clearSelectedCharacter = React.useCallback(() => {
		setSelectedCharacter(null);
		setSelectedCharacterId(null);
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(SELECTED_CHARACTER_STORAGE_KEY);
		}
	}, []);

	const value = React.useMemo<AuthContextValue>(
		() => ({
			selectedCharacterId,
			selectedCharacter,
			isAuthenticated: selectedCharacterId !== null,
			selectCharacter,
			clearSelectedCharacter,
		}),
		[
			selectedCharacterId,
			selectedCharacter,
			selectCharacter,
			clearSelectedCharacter,
		],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = React.useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

type RequireCharacterProps = {
	children: React.ReactNode;
	fallback: React.ReactNode;
};

export function RequireCharacter({
	children,
	fallback,
}: RequireCharacterProps) {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? children : fallback;
}
