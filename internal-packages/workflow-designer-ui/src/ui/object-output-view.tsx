"use client";

import { Streamdown } from "streamdown";

export function ObjectOutputView({
	output,
}: {
	output: Record<string, unknown>;
}) {
	return (
		<Streamdown className="markdown-renderer">
			{`\`\`\`json\n${JSON.stringify(output, null, 2)}\n\`\`\``}
		</Streamdown>
	);
}
