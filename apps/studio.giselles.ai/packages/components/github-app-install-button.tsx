"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InfoIcon, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
	installationUrl: string;
	installed: boolean;
};

export function GitHubAppInstallButton({ installationUrl, installed }: Props) {
	const popupRef = useRef<Window | null>(null);
	const intervalRef = useRef<number | null>(null);
	const router = useRouter();
	const [showWarningDialog, setShowWarningDialog] = useState(false);

	const handleInstall = () => {
		if (!installed) {
			// For new installations, show the warning dialog first
			setShowWarningDialog(true);
		} else {
			// For existing installations, go directly to configuration
			openInstallationWindow();
		}
	};

	const openInstallationWindow = () => {
		const width = 800;
		const height = 800;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2;

		popupRef.current = window.open(
			installationUrl,
			"Configure GitHub App",
			`width=${width},height=${height},top=${top},left=${left},popup=1`,
		);

		if (!popupRef.current) {
			console.warn("Failed to open popup window");
			return;
		}

		intervalRef.current = window.setInterval(() => {
			if (popupRef.current?.closed) {
				router.refresh();
				if (intervalRef.current) {
					window.clearInterval(intervalRef.current);
				}
			}
		}, 300);
	};

	useEffect(() => {
		const handleFocus = () => {
			if (popupRef.current?.closed) {
				router.refresh();
				if (intervalRef.current) {
					window.clearInterval(intervalRef.current);
				}
			}
		};

		window.addEventListener("focus", handleFocus);

		return () => {
			window.removeEventListener("focus", handleFocus);
			if (intervalRef.current) {
				window.clearInterval(intervalRef.current);
			}
			if (popupRef.current && !popupRef.current.closed) {
				popupRef.current.close();
			}
		};
	}, [router]);

	return (
		<>
			<Button
				variant="link"
				onClick={handleInstall}
				className="flex items-center gap-2 w-full justify-center px-6 py-3 text-sm font-medium shrink text-black-30"
			>
				{installed
					? "Configure Giselle's GitHub App"
					: "Add Giselle's GitHub App"}
				<ExternalLink className="w-5 h-5" />
			</Button>

			{/* Warning Dialog for Team-Based Installation */}
			<Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Team-Based GitHub Integration</DialogTitle>
						<DialogDescription>
							You are about to install the GitHub App for your entire team.
						</DialogDescription>
					</DialogHeader>
					
					<div className="py-4">
						<Alert className="mb-4">
							<InfoIcon className="h-4 w-4" />
							<AlertTitle>Important security information</AlertTitle>
							<AlertDescription>
								This GitHub App will be installed for your entire team. All team members will have 
								access to the repositories you connect, through Giselle.
							</AlertDescription>
						</Alert>
						
						<p className="text-sm text-muted-foreground mb-2">
							Please ensure that you:
						</p>
						<ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
							<li>Have permission to install apps for your GitHub organization</li>
							<li>Only select repositories that should be accessible to your entire team</li>
							<li>Understand that this grants repository access to all team members via Giselle</li>
						</ul>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowWarningDialog(false)}>
							Cancel
						</Button>
						<Button onClick={() => {
							setShowWarningDialog(false);
							openInstallationWindow();
						}}>
							Continue to GitHub
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
