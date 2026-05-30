import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

const SELECTED_USER_STORAGE_KEY = "async-campaign:selected-user-id";
const SELECTED_CHARACTER_STORAGE_KEY = "async-campaign:selected-character-id";

type AuthContextValue = {
	selectedUserId: Id<"users"> | null;
	selectedUser: Doc<"users"> | null;
	selectedCharacterId: Id<"characters"> | null;
	selectedCharacter: Doc<"characters"> | null;
	isAuthenticated: boolean;
	isSelectedUserLoading: boolean;
	isCharacterSelected: boolean;
	isSelectedCharacterLoading: boolean;
	selectUser: (user: Doc<"users">) => void;
	clearSelectedUser: () => void;
	selectCharacter: (character: Doc<"characters">) => void;
	clearSelectedCharacter: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
	children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
	const [selectedUserSnapshot, setSelectedUserSnapshot] =
		React.useState<Doc<"users"> | null>(null);

	const [selectedUserId, setSelectedUserId] =
		React.useState<Id<"users"> | null>(() => {
			if (typeof window === "undefined") return null;
			return window.localStorage.getItem(
				SELECTED_USER_STORAGE_KEY,
			) as Id<"users"> | null;
		});

	const [selectedCharacterSnapshot, setSelectedCharacterSnapshot] =
		React.useState<Doc<"characters"> | null>(null);

	const [selectedCharacterId, setSelectedCharacterId] =
		React.useState<Id<"characters"> | null>(() => {
			if (typeof window === "undefined") return null;
			return window.localStorage.getItem(
				SELECTED_CHARACTER_STORAGE_KEY,
			) as Id<"characters"> | null;
		});

	const selectedUserQuery = useQuery(
		convexQuery(
			api.users.getUser,
			selectedUserId ? { id: selectedUserId } : "skip",
		),
	);

	const selectedCharacterQuery = useQuery(
		convexQuery(
			api.characters.getCharacter,
			selectedCharacterId ? { id: selectedCharacterId } : "skip",
		),
	);

	const selectedUser = selectedUserId
		? selectedUserQuery.data === undefined
			? selectedUserSnapshot
			: selectedUserQuery.data
		: null;

	const selectedCharacter = selectedCharacterId
		? selectedCharacterQuery.data === undefined
			? selectedCharacterSnapshot
			: selectedCharacterQuery.data
		: null;

	const clearSelectedCharacter = React.useCallback(() => {
		setSelectedCharacterSnapshot(null);
		setSelectedCharacterId(null);
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(SELECTED_CHARACTER_STORAGE_KEY);
		}
	}, []);

	const selectUser = React.useCallback(
		(user: Doc<"users">) => {
			setSelectedUserSnapshot(user);
			setSelectedUserId(user._id);
			clearSelectedCharacter();
			if (typeof window !== "undefined") {
				window.localStorage.setItem(SELECTED_USER_STORAGE_KEY, user._id);
			}
		},
		[clearSelectedCharacter],
	);

	const clearSelectedUser = React.useCallback(() => {
		setSelectedUserSnapshot(null);
		setSelectedUserId(null);
		clearSelectedCharacter();
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(SELECTED_USER_STORAGE_KEY);
		}
	}, [clearSelectedCharacter]);

	const selectCharacter = React.useCallback((character: Doc<"characters">) => {
		setSelectedCharacterSnapshot(character);
		setSelectedCharacterId(character._id);
		if (typeof window !== "undefined") {
			window.localStorage.setItem(
				SELECTED_CHARACTER_STORAGE_KEY,
				character._id,
			);
		}
	}, []);

	React.useEffect(() => {
		if (selectedUserId && selectedUserQuery.data === null) {
			clearSelectedUser();
		}
	}, [selectedUserId, selectedUserQuery.data, clearSelectedUser]);

	React.useEffect(() => {
		if (!selectedUserId && selectedCharacterId) {
			clearSelectedCharacter();
		}
	}, [selectedUserId, selectedCharacterId, clearSelectedCharacter]);

	React.useEffect(() => {
		const queriedCharacter = selectedCharacterQuery.data;
		if (!selectedCharacterId || queriedCharacter === undefined) return;

		if (
			queriedCharacter === null ||
			(selectedUserId !== null && queriedCharacter.playerId !== selectedUserId)
		) {
			clearSelectedCharacter();
		}
	}, [
		selectedUserId,
		selectedCharacterId,
		selectedCharacterQuery.data,
		clearSelectedCharacter,
	]);

	const isSelectedUserLoading =
		selectedUserId !== null &&
		selectedUser === null &&
		selectedUserQuery.data === undefined;
	const isSelectedCharacterLoading =
		selectedCharacterId !== null &&
		selectedCharacter === null &&
		selectedCharacterQuery.data === undefined;

	const value = React.useMemo<AuthContextValue>(
		() => ({
			selectedUserId,
			selectedUser,
			selectedCharacterId,
			selectedCharacter,
			isAuthenticated: selectedUserId !== null,
			isSelectedUserLoading,
			isCharacterSelected: selectedCharacter !== null,
			isSelectedCharacterLoading,
			selectUser,
			clearSelectedUser,
			selectCharacter,
			clearSelectedCharacter,
		}),
		[
			selectedUserId,
			selectedUser,
			selectedCharacterId,
			selectedCharacter,
			isSelectedUserLoading,
			isSelectedCharacterLoading,
			selectUser,
			clearSelectedUser,
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

type RequireUserProps = {
	children: React.ReactNode;
	fallback: React.ReactNode;
};

export function RequireUser({ children, fallback }: RequireUserProps) {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? children : fallback;
}
