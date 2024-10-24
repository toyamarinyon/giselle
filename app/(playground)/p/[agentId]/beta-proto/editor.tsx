"use client";

import {
	Background,
	BackgroundVariant,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import bg from "./bg.png";
import "@xyflow/react/dist/style.css";
import { GradientPathDefinitions } from "./connector/gradient-definitions";
import {
	MousePositionProvider,
	useMousePosition,
} from "./contexts/mouse-position";
import type { FeatureFlags } from "./feature-flags/types";
import {
	giselleNodeArchetypes,
	promptBlueprint,
	textGeneratorParameterNames,
} from "./giselle-node/blueprints";
import {
	GiselleNode,
	GiselleNodeInformationPanel,
} from "./giselle-node/components";
import { type GiselleNodeId, panelTabs } from "./giselle-node/types";
import {
	addNodesAndConnect,
	selectNode,
	selectNodeAndSetPanelTab,
} from "./graph/actions";
import { useGraph } from "./graph/context";
import type { Graph } from "./graph/types";
import { Header } from "./header";
import {
	type ReactFlowNode,
	edgeTypes,
	nodeTypes,
} from "./react-flow-adapter/giselle-node";
import {
	useConnectionHandler,
	useGraphToReactFlowEffect,
	useKeyUpHandler,
	useNodeEventHandler,
} from "./react-flow-adapter/graph";
import { setSelectTool } from "./tool/actions";
import { Toolbar } from "./tool/components";
import { useTool } from "./tool/context";
import { ToolProvider } from "./tool/provider";
import type { AgentId } from "./types";

function EditorInner() {
	const [previewMode, setPreviewMode] = useState(false);
	const { state: toolState, dispatch: toolDispatch } = useTool();
	const { dispatch: graphDispatch } = useGraph();
	const reactFlowInstance = useReactFlow();
	const mousePosition = useMousePosition();
	useGraphToReactFlowEffect();
	const { handleConnect } = useConnectionHandler();
	const { handleNodeDragStop } = useNodeEventHandler();
	const { handleKeyUp } = useKeyUpHandler();
	return (
		<div className="w-full h-screen">
			<ReactFlow<ReactFlowNode>
				defaultNodes={[]}
				defaultEdges={[]}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				panOnScroll
				onKeyUp={handleKeyUp}
				selectionOnDrag
				panOnDrag={false}
				colorMode="dark"
				onConnect={handleConnect}
				onNodeDragStop={handleNodeDragStop}
				onNodeClick={(_, node) => {
					graphDispatch(
						selectNodeAndSetPanelTab({
							selectNode: {
								id: node.id as GiselleNodeId,
								panelTab: panelTabs.property,
							},
						}),
					);
				}}
				onPaneClick={(event) => {
					event.preventDefault();
					graphDispatch(
						selectNode({
							selectedNodeIds: [],
						}),
					);
					if (toolState.activeTool.type === "addGiselleNode") {
						const position = reactFlowInstance.flowToScreenPosition({
							x: event.clientX,
							y: event.clientY,
						});
						if (
							toolState.activeTool.giselleNodeBlueprint.archetype ===
							giselleNodeArchetypes.textGenerator
						) {
							graphDispatch(
								addNodesAndConnect({
									sourceNode: {
										node: promptBlueprint,
										position: {
											x: position.x - 300,
											y: position.y + 100,
										},
									},
									targetNode: {
										node: toolState.activeTool.giselleNodeBlueprint,
										position,
									},
									connector: {
										targetParameterName:
											textGeneratorParameterNames.instruction,
									},
								}),
							);
						}
						if (
							toolState.activeTool.giselleNodeBlueprint.archetype ===
							giselleNodeArchetypes.webSearch
						) {
							graphDispatch(
								addNodesAndConnect({
									sourceNode: {
										node: promptBlueprint,
										position: {
											x: position.x - 300,
											y: position.y + 100,
										},
									},
									targetNode: {
										node: toolState.activeTool.giselleNodeBlueprint,
										position,
									},
									connector: {
										targetParameterName:
											textGeneratorParameterNames.instruction,
									},
								}),
							);
						}
						toolDispatch(setSelectTool);
					}
				}}
				deleteKeyCode={null}
			>
				<Background
					className="!bg-black-100"
					lineWidth={0}
					variant={BackgroundVariant.Lines}
					style={{
						backgroundImage: `url(${bg.src})`,
						backgroundPositionX: "center",
						backgroundPositionY: "center",
						backgroundSize: "cover",
					}}
				/>
				{toolState.activeTool.type === "addGiselleNode" && (
					<div
						className="absolute"
						style={{
							left: `${mousePosition.x - 0}px`,
							top: `${mousePosition.y - 0}px`,
						}}
					>
						<GiselleNode {...toolState.activeTool.giselleNodeBlueprint} />
					</div>
				)}

				<Panel position={"bottom-center"}>
					<Toolbar />
				</Panel>
				<Panel position="top-left" className="!top-0 !left-0 !right-0 !m-0">
					<Header />
				</Panel>
				<Panel position="top-right" className="!top-0 !bottom-0 !right-0 !m-0">
					<GiselleNodeInformationPanel />
				</Panel>
				{/**<Panel position="top-left" className="!top-0 !bottom-0 !left-0 !m-0">
					<div className="absolute bg-black-100 w-[380px] rounded-[16px] overflow-hidden shadow-[0px_0px_8px_0px_hsla(0,_0%,_100%,_0.2)] top-[80px] bottom-[20px] left-[20px]">
						<div className="absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent from-[hsla(233,4%,37%,1)] to-[hsla(233,62%,22%,1)]" />
						<div className="flex gap-[10px] flex-col h-full">
							<div className="relative z-10 pt-[16px] px-[24px] flex justify-between h-[40px]">
								hello
							</div>
						</div>
					</div>
				</Panel>**/}
			</ReactFlow>
		</div>
	);
}

export function Editor() {
	return (
		<ReactFlowProvider>
			<MousePositionProvider>
				<ToolProvider>
					<GradientPathDefinitions />
					<EditorInner />
				</ToolProvider>
			</MousePositionProvider>
		</ReactFlowProvider>
	);
}
