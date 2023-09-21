import { defineConfig } from "vite";

export default () => {
	return defineConfig({
		build: {
			outDir: "./docs",
		},
	});
};
