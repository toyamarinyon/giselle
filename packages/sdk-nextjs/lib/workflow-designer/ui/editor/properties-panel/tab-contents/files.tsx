import type { ReactNode } from "react";

function DataList({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div>
			<p className="text-[12px] text-black-40">{label}</p>
			<div>{children}</div>
		</div>
	);
}

function formatFileSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let size = bytes;
	let unitIndex = 0;

	const targetUnit =
		size < 1024
			? "B"
			: size < 1024 ** 2
				? "KB"
				: size < 1024 ** 3
					? "MB"
					: size < 1024 ** 4
						? "GB"
						: "TB";

	while (
		size >= 1024 &&
		unitIndex < units.length - 1 &&
		units[unitIndex] !== targetUnit
	) {
		size /= 1024;
		unitIndex++;
	}

	return `${Math.round(size * 100) / 100} ${targetUnit}`;
}

function TabContentFile({
	nodeId,
	content,
	onContentChange,
}: {
	nodeId: NodeId;
	content: FileContent;
	onContentChange?: (content: FileContent) => void;
}) {
	const { graph } = useGraph();

	const sourcedFromNodes = useMemo(
		() =>
			graph.connections
				.filter((connection) => connection.sourceNodeId === nodeId)
				.map((connection) =>
					graph.nodes.find((node) => node.id === connection.targetNodeId),
				)
				.filter((node) => node !== undefined),
		[graph, nodeId],
	);
	const [isDragging, setIsDragging] = useState(false);

	const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const setFile = useCallback(
		(file: File) => {
			const fileData = new FileReader();

			fileData.readAsArrayBuffer(file);
			fileData.onload = async () => {
				if (!fileData.result) {
					return;
				}
				const fileId = createFileId();
				onContentChange?.({
					...content,
					data: {
						id: fileId,
						status: "uploading",
						name: file.name,
						contentType: file.type,
						size: file.size,
					},
				});
				const blob = await upload(
					pathJoin(vercelBlobFileFolder, fileId, file.name),
					file,
					{
						access: "public",
						handleUploadUrl: "/api/files/upload",
					},
				);
				const uploadedAt = Date.now();

				onContentChange?.({
					...content,
					data: {
						id: fileId,
						status: "processing",
						name: file.name,
						contentType: file.type,
						size: file.size,
						uploadedAt,
						fileBlobUrl: blob.url,
					},
				});

				const parseBlob = await parse(fileId, file.name, blob.url);

				onContentChange?.({
					...content,
					data: {
						id: fileId,
						status: "completed",
						name: file.name,
						contentType: file.type,
						size: file.size,
						uploadedAt,
						fileBlobUrl: blob.url,
						processedAt: Date.now(),
						textDataUrl: parseBlob.url,
					},
				});
			};
		},
		[content, onContentChange],
	);

	const onDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);
			setFile(e.dataTransfer.files[0]);
		},
		[setFile],
	);

	const onFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (!e.target.files) {
				return;
			}
			setFile(e.target.files[0]);
		},
		[setFile],
	);
	return (
		<div className="relative z-10 flex flex-col gap-[2px] h-full text-[14px] text-black-30">
			{content.data == null ? (
				<div className="p-[16px]">
					<div
						className={clsx(
							"h-[300px] flex flex-col gap-[16px] justify-center items-center rounded-[8px] border border-dashed text-black-70 px-[18px]",
							isDragging ? "bg-black-80/20 border-black-50" : "border-black-70",
						)}
						onDragOver={onDragOver}
						onDragLeave={onDragLeave}
						onDrop={onDrop}
					>
						{isDragging ? (
							<>
								<DocumentIcon className="w-[30px] h-[30px] fill-black-70" />
								<p className="text-center">Drop to upload your files</p>
							</>
						) : (
							<div className="flex flex-col gap-[16px] justify-center items-center">
								<ArrowUpFromLineIcon size={38} className="stroke-black-70" />
								<label
									htmlFor="file"
									className="text-center flex flex-col gap-[16px]"
								>
									<p>
										No contents added yet. Click to upload or drag and drop
										files here (supports images, documents, and more; max 4.5MB
										per file).
									</p>
									<div className="flex gap-[8px] justify-center items-center">
										<span>or</span>
										<span className="font-bold text-black--50 text-[14px] underline cursor-pointer">
											Select files
											<input
												id="file"
												type="file"
												onChange={onFileChange}
												className="hidden"
											/>
										</span>
									</div>
								</label>
							</div>
						)}
					</div>
				</div>
			) : (
				<>
					<PropertiesPanelContentBox>
						<div className="my-[12px] flex flex-col gap-[8px]">
							<DataList label="File Name">
								<p>{content.data.name}</p>
							</DataList>
							<DataList label="Content Type">
								<p>{content.data.contentType}</p>
							</DataList>
							<DataList label="Size">
								<p>{formatFileSize(content.data.size)}</p>
							</DataList>
							<DataList label="Status">
								<p>{content.data.status}</p>
							</DataList>
							<DataList label="Uploaded">
								<p>
									{content.data.status !== "completed"
										? "---"
										: formatTimestamp.toRelativeTime(content.data.processedAt)}
								</p>
							</DataList>
						</div>
					</PropertiesPanelContentBox>
					<div className="border-t border-[hsla(222,21%,40%,1)]" />
					<PropertiesPanelContentBox className="text-black-30 grid gap-2">
						<div className="flex justify-between items-center">
							<p className="font-rosart">Sourced From</p>
						</div>

						<div className="grid gap-2">
							{sourcedFromNodes.map((node) => (
								<Block
									key={node.id}
									hoverCardContent={
										<div className="flex justify-between space-x-4">
											node type: {node.content.type}
											{node.content.type === "text" && (
												<div className="line-clamp-5 text-[14px]">
													{node.content.text}
												</div>
											)}
										</div>
									}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-[8px]">
											<p className="truncate text-[14px] font-rosart">
												{node.name}
											</p>
										</div>
									</div>
								</Block>
							))}
						</div>
					</PropertiesPanelContentBox>
				</>
			)}
		</div>
	);
}

function TabsContentFiles({
	content,
	onContentChange,
}: {
	nodeId: NodeId;
	content: FilesContent;
	onContentChange: (content: FilesContent) => void;
}) {
	const [isDragging, setIsDragging] = useState(false);

	const { addToast } = useToast();

	const setFiles = useCallback(
		async (files: File[]) => {
			let contentData = content.data;
			await Promise.all(
				files.map(async (file) => {
					const fileData = new FileReader();
					fileData.readAsArrayBuffer(file);
					fileData.onload = async () => {
						if (!fileData.result) {
							return;
						}
						const fileId = createFileId();
						contentData = [
							...contentData,
							{
								id: fileId,
								status: "uploading",
								name: file.name,
								contentType: file.type,
								size: file.size,
							},
						];
						try {
							onContentChange?.({
								...content,
								data: contentData,
							});
							const blob = await upload(
								pathJoin(vercelBlobFileFolder, fileId, file.name),
								file,
								{
									access: "public",
									handleUploadUrl: "/api/files/upload",
								},
							);
							const uploadedAt = Date.now();

							contentData = [
								...contentData.filter((file) => file.id !== fileId),
								{
									id: fileId,
									status: "processing",
									name: file.name,
									contentType: file.type,
									size: file.size,
									uploadedAt,
									fileBlobUrl: blob.url,
								},
							];

							onContentChange?.({
								...content,
								data: contentData,
							});

							const parseBlob = await parse(fileId, file.name, blob.url);

							contentData = [
								...contentData.filter((file) => file.id !== fileId),
								{
									id: fileId,
									status: "completed",
									name: file.name,
									contentType: file.type,
									size: file.size,
									uploadedAt,
									fileBlobUrl: blob.url,
									processedAt: Date.now(),
									textDataUrl: parseBlob.url,
								},
							];
							onContentChange?.({
								...content,
								data: contentData,
							});
						} catch (error) {
							contentData = [
								...contentData.filter((file) => file.id !== fileId),
								{
									id: fileId,
									status: "failed",
									name: file.name,
									contentType: file.type,
									size: file.size,
								},
							];
							onContentChange?.({
								...content,
								data: contentData,
							});

							addToast({
								type: "error",
								message: toErrorWithMessage(error).message,
							});
						}
					};
				}),
			);
		},
		[content, onContentChange, addToast],
	);

	const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const onDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);
			setFiles(Array.from(e.dataTransfer.files));
		},
		[setFiles],
	);

	const onFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (!e.target.files) {
				return;
			}
			setFiles(Array.from(e.target.files));
		},
		[setFiles],
	);

	const handleRemoveFile = useCallback(
		async (fileToRemove: FileData) => {
			onContentChange({
				...content,
				data: content.data.filter((file) => file.id !== fileToRemove.id),
			});
			await remove(fileToRemove);
		},
		[content, onContentChange],
	);

	return (
		<div className="relative z-10 flex flex-col gap-[2px] h-full text-[14px] text-black-30">
			<div className="p-[16px] divide-y divide-black-50">
				{content.data.length > 0 && (
					<div className="pb-[16px] flex flex-col gap-[8px]">
						{content.data.map((file) => (
							<FileListItem
								key={file.id}
								fileData={file}
								onRemove={handleRemoveFile}
							/>
						))}
					</div>
				)}
				<div className="py-[16px]">
					<div
						className={clsx(
							"h-[300px] flex flex-col gap-[16px] justify-center items-center rounded-[8px] border border-dashed text-black-70 px-[18px]",
							isDragging ? "bg-black-80/20 border-black-50" : "border-black-70",
						)}
						onDragOver={onDragOver}
						onDragLeave={onDragLeave}
						onDrop={onDrop}
					>
						{isDragging ? (
							<>
								<DocumentIcon className="w-[30px] h-[30px] fill-black-70" />
								<p className="text-center">Drop to upload your files</p>
							</>
						) : (
							<div className="flex flex-col gap-[16px] justify-center items-center">
								<ArrowUpFromLineIcon size={38} className="stroke-black-70" />
								<label
									htmlFor="file"
									className="text-center flex flex-col gap-[16px]"
								>
									<p>
										Drop files here to upload. (Currently, only PDF files can be
										uploaded. Support for other file formats will be added
										soon.)
									</p>
									<div className="flex gap-[8px] justify-center items-center">
										<span>or</span>
										<span className="font-bold text-black--50 text-[14px] underline cursor-pointer">
											Select files
											<input
												id="file"
												type="file"
												onChange={onFileChange}
												className="hidden"
											/>
										</span>
									</div>
								</label>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function FileListItem({
	fileData,
	onRemove,
}: {
	fileData: FileData;
	onRemove: (file: FileData) => void;
}) {
	return (
		<div className="flex items-center overflow-x-hidden group justify-between bg-black-100 hover:bg-white/10 transition-colors px-[4px] py-[8px] rounded-[8px]">
			<div className="flex items-center overflow-x-hidden">
				{fileData.status === "failed" ? (
					<FileXIcon className="w-[46px] h-[46px] stroke-current stroke-1" />
				) : (
					<div className="relative">
						<FileIcon className="w-[46px] h-[46px] stroke-current stroke-1" />
						<div className="uppercase absolute bottom-[8px] w-[46px] py-[2px] text-[10px] flex justify-center">
							<p>
								{fileData.contentType === "application/pdf"
									? "pdf"
									: fileData.contentType === "text/markdown"
										? "md"
										: ""}
							</p>
						</div>
					</div>
				)}
				<div className="overflow-x-hidden">
					<p className="truncate">{fileData.name}</p>
					{fileData.status === "uploading" && <p>Uploading...</p>}
					{fileData.status === "processing" && <p>Processing...</p>}
					{fileData.status === "completed" && (
						<p className="text-black-50">
							{formatTimestamp.toRelativeTime(fileData.uploadedAt)}
						</p>
					)}
					{fileData.status === "failed" && <p>Failed</p>}
				</div>
			</div>
			<Tooltip text="Remove">
				<button
					type="button"
					className="hidden group-hover:block px-[4px] py-[4px] bg-transparent hover:bg-white/10 rounded-[8px] transition-colors mr-[2px] flex-shrink-0"
					onClick={() => onRemove(fileData)}
				>
					<TrashIcon className="w-[24px] h-[24px] stroke-current stroke-[1px] " />
				</button>
			</Tooltip>
		</div>
	);
}
