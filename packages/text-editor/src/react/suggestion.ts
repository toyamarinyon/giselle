import { defaultName } from "@giselles-ai/node-registry";
import {
	isContentGenerationNode,
	isTextGenerationNode,
	type SubSchema,
} from "@giselles-ai/protocol";
import type { UIConnection } from "@giselles-ai/react";
import { createSourceExtensionJSONContent } from "@giselles-ai/text-editor-utils";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
import {
	type SuggestionItem,
	SuggestionList,
	type SuggestionListRef,
} from "./suggestion-list";

export function createSuggestion(
	connections: UIConnection[] | undefined,
): Omit<SuggestionOptions<SuggestionItem>, "editor"> {
	return {
		char: "@",
		items: ({ query }) => {
			if (connections === undefined) {
				return [];
			}

			const items: SuggestionItem[] = [];

			for (const connection of connections) {
				const { outputNode, output } = connection;
				const schema = getSchema(connection);

				items.push({
					id: output.id,
					node: outputNode,
					output,
					label: `${defaultName(outputNode)} / ${output.label}`,
					fieldType: schema !== undefined ? "object" : undefined,
				});

				if (schema === undefined) {
					continue;
				}
				collectFieldItems(schema.properties, [], outputNode, output, items);
			}

			if (query === "") {
				return items;
			}

			const lowerQuery = query.toLowerCase();
			const requiredIds = new Set<string>();
			for (const item of items) {
				if (!item.label.toLowerCase().includes(lowerQuery)) {
					continue;
				}

				requiredIds.add(item.id);

				// When an object-type item matches, keep its descendants visible
				if (item.fieldType === "object") {
					for (const candidate of items) {
						if (
							candidate.node.id !== item.node.id ||
							candidate.output.id !== item.output.id
						) {
							continue;
						}

						const isDescendant =
							item.path === undefined ||
							(candidate.path !== undefined &&
								candidate.path.length > item.path.length &&
								item.path.every(
									(segment, index) => candidate.path?.[index] === segment,
								));
						if (isDescendant) {
							requiredIds.add(candidate.id);
						}
					}
				}

				// When a field item matches, keep its ancestors visible
				if (item.path !== undefined) {
					requiredIds.add(item.output.id);
					for (let i = 1; i < item.path.length; i++) {
						requiredIds.add(
							`${item.output.id}:${item.path.slice(0, i).join(".")}`,
						);
					}
				}
			}

			return items.filter((item) => requiredIds.has(item.id));
		},

		render: () => {
			let component: ReactRenderer<SuggestionListRef> | undefined;
			let popup: HTMLElement | undefined;
			let escapeHandler: ((event: KeyboardEvent) => void) | undefined;
			let pointerDownHandler: ((event: PointerEvent) => void) | undefined;

			return {
				onStart: (props) => {
					component = new ReactRenderer(SuggestionList, {
						props,
						editor: props.editor,
					});

					if (!props.clientRect) {
						return;
					}

					popup = document.createElement("div");
					popup.style.position = "absolute";
					popup.style.zIndex = "9999";
					popup.appendChild(component.element);
					document.body.appendChild(popup);

					const rect = props.clientRect();
					if (rect) {
						popup.style.top = `${rect.bottom + window.scrollY}px`;
						popup.style.left = `${rect.right + window.scrollX}px`;
					}

					// Add global Escape key handler
					escapeHandler = (event: KeyboardEvent) => {
						if (popup === undefined) {
							return;
						}
						if (event.key === "Escape") {
							popup.style.display = "none";
						}
					};
					document.addEventListener("keydown", escapeHandler);

					pointerDownHandler = (event: PointerEvent) => {
						if (popup === undefined) {
							return;
						}
						const target = event.target;
						if (target instanceof Node && popup.contains(target)) {
							return;
						}
						popup.style.display = "none";
					};
					document.addEventListener("pointerdown", pointerDownHandler);
				},

				onUpdate(props) {
					component?.updateProps(props);
					if (popup === undefined) {
						return;
					}

					// Re-show popup if it was hidden by Escape
					if (popup.style.display === "none") {
						popup.style.display = "block";
					}
				},

				onKeyDown(props) {
					return component?.ref?.onKeyDown(props) ?? false;
				},

				onExit() {
					if (escapeHandler) {
						document.removeEventListener("keydown", escapeHandler);
					}
					if (pointerDownHandler) {
						document.removeEventListener("pointerdown", pointerDownHandler);
					}
					popup?.remove();
					component?.destroy();
				},
			};
		},

		command: ({ editor, range, props }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.insertContentAt(
					range.from,
					createSourceExtensionJSONContent({
						node: {
							id: props.node.id,
							type: props.node.type,
							content: props.node.content,
						},
						outputId: props.output.id,
						path: props.path,
					}),
				)
				.insertContent(" ")
				.run();
		},
	};
}

function getSchema(connection: UIConnection) {
	const { outputNode } = connection;
	if (
		!isTextGenerationNode(outputNode) &&
		!isContentGenerationNode(outputNode)
	) {
		return;
	}

	if (outputNode.content.output.format !== "object") {
		return;
	}
	return outputNode.content.output.schema;
}

function collectFieldItems(
	properties: Record<string, SubSchema>,
	parentPath: string[],
	node: UIConnection["outputNode"],
	output: UIConnection["output"],
	items: SuggestionItem[],
) {
	for (const [field, sub] of Object.entries(properties)) {
		const fieldPath = [...parentPath, field];
		items.push({
			id: `${output.id}:${fieldPath.join(".")}`,
			node,
			output,
			label: field,
			path: fieldPath,
			fieldType: sub.type,
		});
		// Array field access (e.g. items[0].name) is not supported yet
		if (sub.type === "object") {
			collectFieldItems(sub.properties, fieldPath, node, output, items);
		}
	}
}
