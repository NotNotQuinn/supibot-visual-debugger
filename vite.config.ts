import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import BuildInfo from 'vite-plugin-info';

export default defineConfig({
	plugins: [
		// Implements svelte compiling
		sveltekit(),
		// Implements vitual modules starting with `~build/`
		// Including:
		//   - `~build/time`: Build date+time (DO NOT USE)
		//   - `~build/info`: Build info (git)
		//   - `~build/meta`: Custom information
		//   - `~build/package`: package.json information
		BuildInfo({
			github: 'https://github.com/notnotquinn/supibot-visual-debugger'
		}),
	]
});
