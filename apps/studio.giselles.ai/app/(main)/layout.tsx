import { GiselleLogo } from "@/components/giselle-logo";
import { settingsV2Flag } from "@/flags";
import { UserButton } from "@/services/accounts/components";
import TeamCreation from "@/services/teams/components/team-creation";
import { TeamSelection } from "@/services/teams/components/team-selection";
import Link from "next/link";
import type { ReactNode } from "react";
import { Nav } from "./nav";
import LayoutV2 from "./v2/layout";

export default async function Layout({ children }: { children: ReactNode }) {
	const settingsV2Mode = await settingsV2Flag();
	if (settingsV2Mode) {
		return <LayoutV2>{children}</LayoutV2>;
	}

	return (
		<div className="h-screen overflow-y-hidden bg-black-900 divide-y divide-black-80 flex flex-col">
			<header className="h-[60px] flex items-center px-[24px] justify-between">
				<div className="flex">
					<Link href="/">
						<GiselleLogo className="w-[70px] h-auto fill-white mt-[4px] mr-[8px]" />
					</Link>
					<Nav />
				</div>
				<div className="flex items-center gap-4">
					<TeamSelection />
					<TeamCreation />
					<UserButton />
				</div>
			</header>
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
