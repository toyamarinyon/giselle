import { createNode } from "./node/factory";
import { initWorkflow } from "./workflow";

const workflow = initWorkflow({
	storage: {
		type: "local",
	},
});
