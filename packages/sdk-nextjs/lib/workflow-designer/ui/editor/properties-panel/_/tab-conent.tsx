import { Content } from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";
export function TabsContent({ ref, ...props }: ComponentProps<typeof Content>) {
	return (
		<Content
			ref={ref}
			className="overflow-y-auto overflow-x-hidden"
			{...props}
		/>
	);
}
TabsContent.displayName = Content.displayName;
