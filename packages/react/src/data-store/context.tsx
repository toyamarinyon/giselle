"use client";

import type { DataStoreId, WorkspaceId } from "@giselles-ai/protocol";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import useSWR from "swr";

export interface DataStoreItem {
	id: DataStoreId;
	name: string;
}

export interface DataStoreContextValue {
	isAvailable: boolean;
	dataStores: DataStoreItem[];
	settingPath: string;
}

const DataStoreContext = createContext<DataStoreContextValue | undefined>(
	undefined,
);

export interface DataStoreProviderProps {
	isAvailable?: boolean;
	workspaceId?: WorkspaceId;
	initialDataStores?: DataStoreItem[];
	settingPath?: string;
	fetchDataStores?: () => Promise<DataStoreItem[]>;
}

export function DataStoreProvider({
	children,
	isAvailable = false,
	workspaceId,
	initialDataStores = [],
	settingPath = "",
	fetchDataStores,
}: PropsWithChildren<DataStoreProviderProps>) {
	const isConfigured =
		workspaceId !== undefined && fetchDataStores !== undefined;

	const { data } = useSWR<DataStoreItem[]>(
		isConfigured ? ["data-stores", workspaceId] : null,
		fetchDataStores ?? null,
		{ fallbackData: initialDataStores },
	);

	return (
		<DataStoreContext
			value={{
				isAvailable,
				dataStores: data ?? initialDataStores,
				settingPath,
			}}
		>
			{children}
		</DataStoreContext>
	);
}

export function useDataStore(): DataStoreContextValue {
	const context = useContext(DataStoreContext);
	if (context === undefined) {
		throw new Error("useDataStore must be used within a DataStoreProvider");
	}
	return context;
}
