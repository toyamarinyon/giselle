import { createIdGenerator } from "@/lib/utils/generate-id";
import type { z } from "zod";

export const WorkspaceId = createIdGenerator("wrks");
export type WorkspaceId = z.infer<typeof WorkspaceId.schema>;
