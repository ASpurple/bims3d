import { ConfigEnv, defineConfig } from "vite";

export default ({ mode }: ConfigEnv) => {
	return defineConfig({
		base: mode === "development" ? "" : "/bims3d/",
		build: {
			outDir: "./docs",
		},
		server: {
			port: 3000,
		},
	});
};
