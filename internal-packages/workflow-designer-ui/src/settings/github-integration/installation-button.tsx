"use client";

import { useIntegration } from "@giselle-sdk/integration/react";
import { useGiselleEngine } from "giselle-sdk/react";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef } from "react";

export function GitHubAppInstallButton({
	children,
	className,
}: { children: ReactNode; className?: string }) {
	const client = useGiselleEngine();
	const integration = useIntegration();
	const popupRef = useRef<Window | null>(null);
	const router = useRouter();

	const handleInstall = useCallback(async () => {
		const width = 800;
		const height = 800;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2;

		const url = await client.installationUrl({
			state: integration.installationState,
		});
		popupRef.current = window.open(
			url,
			"Configure GitHub App",
			`width=${width},height=${height},top=${top},left=${left},popup=1`,
		);

		if (!popupRef.current) {
			console.warn("Failed to open popup window");
			return;
		}
	}, [client, integration]);

	// Handler for installation message from popup window
	const handleInstallationMessage = useCallback(
		(event: MessageEvent) => {
			if (event.data?.type === "github-app-installed") {
				integration.refresh();
			}
		},
		[integration],
	);

	// Listen for visibility changes to refresh data when user returns to the page
	useEffect(() => {
		// Add event listener for installation message from popup
		window.addEventListener("message", handleInstallationMessage);

		return () => {
			window.removeEventListener("message", handleInstallationMessage);

			// Close popup if component unmounts
			if (popupRef.current && !popupRef.current.closed) {
				popupRef.current.close();
			}
		};
	}, [handleInstallationMessage]);

	return (
		<button type="button" onClick={handleInstall} className={className}>
			{children}
		</button>
	);
}
