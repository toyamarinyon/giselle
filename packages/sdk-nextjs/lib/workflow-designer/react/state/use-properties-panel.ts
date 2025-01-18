import { useState } from "react";

export function usePropertiesPanel() {
	const [propertiesTab, setPropertiesTab] = useState("");
	const [openPropertiesPanel, setOpenPropertiesPanel] = useState(false);

	return {
		propertiesTab,
		setPropertiesTab,
		openPropertiesPanel,
		setOpenPropertiesPanel,
	};
}
