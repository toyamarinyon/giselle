import type { NodeData } from "@/lib/workflow-data";
import type { SVGProps } from "react";
import { DocumentIcon } from "../icons/document";
import { GlobeIcon } from "../icons/globe";
import { PromptIcon } from "../icons/prompt";
import { TextGenerationIcon } from "../icons/text-generation";

type ContentTypeIconProps = SVGProps<SVGSVGElement> & {
	contentType: NodeData["content"]["type"];
};
export function ContentTypeIcon({
	contentType,
	...props
}: ContentTypeIconProps) {
	switch (contentType) {
		case "textGeneration":
			return <TextGenerationIcon {...props} />;
		// case "webSearch":
		// 	return <GlobeIcon {...props} />;
		case "text":
			return <PromptIcon {...props} />;
		// case "file":
		// 	return <DocumentIcon {...props} />;
		// case "files":
		// 	return <DocumentIcon {...props} />;
		default: {
			const _exhaustiveCheck: never = contentType;
			return _exhaustiveCheck;
		}
	}
}
