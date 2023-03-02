<script lang="ts" context="module">
	// Generated at build time - can't get types to work.
	// Types are located in node_modules/vite-plugin-info/client.d.ts
	// @ts-expect-error
	import { sha } from '~build/info';

	// Do not use alpha channel:
	// makes things too dank to deal with

	/** Git SHA truncated to 6 characters. */
	export const gitSha: string = sha.slice(0,6);
	/** Git SHA rendered as a CSS colour. */
	export const gitShaColour = '#'+gitSha;
	/** Git SHA (not truncated). */
	export const fullGitSha = sha;
</script>

<style>
	.sha-colour-shower {
		vertical-align: middle;
	}

	.show-when-preceding-elm-is-hovering {
		display: none;
	}

	*:hover + .show-when-preceding-elm-is-hovering {
		padding: 1ex;
		display: block;
		position: absolute;
		top: var(--mouse-y);
		left: var(--mouse-x);
		transform: translate(-50%, calc(-100% - .5rem));
		border: 1px solid white;
		background-color: var(--neutral-background);
	}
</style>

<!-- Track mouse movements for hovering on git sha colour shower :) -->
<svelte:body on:mousemove={e => {
	let x = e.clientX.toString()+'px';
	let y = e.clientY.toString()+'px';
	// In pixels, the coordinates within the viewport. Top left is (0,0)
	document.documentElement.style.setProperty('--mouse-x', x);
	document.documentElement.style.setProperty('--mouse-y', y);
}}/>

<span>
	<svg
		height="16"
		width="16"
		class="sha-colour-shower preceding-hovering-target">
		<rect
			height="16"
			width="16"
			style="fill: {gitShaColour}; stroke: white; stroke-width: 2;" >
		</rect>
	</svg>
	<span
		class="show-when-preceding-elm-is-hovering mono"
		style="background-color: {gitShaColour};"
		title="foo">
		<span style="color: white; mix-blend-mode: difference;">
			Rendered Git SHA
		</span>
	</span>
</span>
