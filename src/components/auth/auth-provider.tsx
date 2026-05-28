import * as React from "react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

const SELECTED_USER_STORAGE_KEY = "async-campaign:selected-user-id";

type AuthContextValue = {
	selectedUserId: Id<"users"> | null;
	selectedUser: Doc<"users"> | null;
	isAuthenticated: boolean;
	selectUser: (user: Doc<"users">) => void;
	clearSelectedUser: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
	children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
	const [selectedUser, setSelectedUser] = React.useState<Doc<"users"> | null>(
		null,
	);

	const [selectedUserId, setSelectedUserId] =
		React.useState<Id<"users"> | null>(() => {
			if (typeof window === "undefined") return null;
			return window.localStorage.getItem(
				SELECTED_USER_STORAGE_KEY,
			) as Id<"users"> | null;
		});

	const selectUser = React.useCallback((user: Doc<"users">) => {
		setSelectedUser(user);
		setSelectedUserId(user._id);
		if (typeof window !== "undefined") {
			window.localStorage.setItem(SELECTED_USER_STORAGE_KEY, user._id);
		}
	}, []);

	const clearSelectedUser = React.useCallback(() => {
		setSelectedUser(null);
		setSelectedUserId(null);
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(SELECTED_USER_STORAGE_KEY);
		}
	}, []);

	const value = React.useMemo<AuthContextValue>(
		() => ({
			selectedUserId,
			selectedUser,
			isAuthenticated: selectedUserId !== null,
			selectUser,
			clearSelectedUser,
		}),
		[selectedUserId, selectedUser, selectUser, clearSelectedUser],
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
