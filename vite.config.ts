import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import BuildInfo from 'vite-plugin-info';

export default defineConfig({
	plugins: [
		// Implements svelte compiling
		sveltekit(),
		// Implements virtual modules starting with `~build/`
		// Including:
		//   - `~build/time`: Build date+time (DO NOT USE)
		//   - `~build/info`: Build info (git)
		//   - `~build/meta`: Custom information
		//   - `~build/package`: package.json information
		BuildInfo({
			meta: {
				gitHomepage: '//github.com/notnotquinn/supibot-visual-debugger',
				gitCommitPageTemplate: '//github.com/notnotquinn/supibot-visual-debugger/tree/%commit.sha%'
			}
		}),
	]
});
