<script lang="ts">
	import Console from "$lib/console/Console.svelte";

	// Generated at build time - can't get types to work.
	// Types are located in node_modules/vite-plugin-info/client.d.ts
	// @ts-expect-error
	import { sha } from '~build/info';
	// Do not use alpha channel:
	// makes things too dank to deal with
	const shaColourHash = sha.slice(0,6);
	const shaColourCSS = '#'+shaColourHash
</script>

<style>
	/* :global(*) {
		background-color: #adff2f08;
		outline: 1px solid #ff0000aa;
	} */

	footer {
		border-top: 1px dashed var(--neutral-text);
		padding: 1rem;
	}

	.container {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		height: 100vh;
		box-sizing: border-box;
	}

	h1 {
		margin: 1rem
	}

	.footer {
		text-align: center;
	}

	.footer a {
		text-decoration: none;
	}

	.footer > * + * {
		border-left: 1px solid grey;
		padding: 1ex 0;
		padding-left: 1rem;
		margin-left: 1rem;
	}

	.git-logo {
		height: 28px;
		vertical-align: middle;
	}

	.git-logo-link {
		margin-right: 2ex;
	}

	.sha-colour-shower {
		border-radius: 100px; /* a large amount */
		padding: 10px 20px;
		padding-bottom: 13px;
		background-color: var(--sha-color);

		/* Margin to correct for drop-shadow */
		margin-right: 2px;
		filter: drop-shadow(2px 3px 0px black);
	}

	.sha-colour-shower:hover::before {
		z-index: -1;
	}

	.sha-colour-shower > * {
		color: white;
		/* color: var(--sha-color); */
		mix-blend-mode: difference;
}
</style>

<svelte:head>
	<title>Danking Around | Supibot Visual Debugger</title>
</svelte:head>

<div class="container">
	<h1>Supibot Visual Debugger</h1>

	<Console />

	<footer class="footer">
		<span>
			<span class="sha-colour-shower mono" style:--sha-color={shaColourCSS}>
				<a
					class="git-logo-link"
					href="//github.com/notnotquinn/supibot-visual-debugger"
					target="_blank"
					rel="noreferrer external"
				><img src="/git-icon-white.svg" alt="Git VCS Logo" class="mono git-logo"></a
				><a
				target="_blank"
				rel="noreferrer external"
				href="//github.com/notnotquinn/supibot-visual-debugger/tree/{sha}"
			>{shaColourHash}</a
			></span></span><span
			>
			Inspired By Mm2pl's <a target="_blank" rel="noreferrer external" href="https://kotmisia.pl/sbdbg/">SBDBG</a>
			(<a target="_blank" rel="noreferrer external" href="https://git.kotmisia.pl/mm2pl/sbdbg">Git</a>)
		</span>
	</footer>
</div>

