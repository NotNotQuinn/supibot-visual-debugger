<script lang="ts">
	import Console from "$lib/console/Console.svelte";
	import GitShaSVG, { gitSha, fullGitSha } from "$lib/GitShaSVG.svelte";
</script>

<style>
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

	.footer * {
		/**
		 * Still in draft specification, but why not add it i guess.
		 * https://drafts.csswg.org/css-text-4/#propdef-text-space-trim
		 */
		text-space-trim: discard-after;
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

	.git-info > :global(*) {
		margin-left: 2ex;
	}

</style>

<svelte:head>
	<title>Danking Around | Supibot Visual Debugger</title>
</svelte:head>

<div class="container">
	<h1>Supibot Visual Debugger</h1>

	<Console />

	<footer class="footer">
		<span class="git-info">
			<a href="//github.com/notnotquinn/supibot-visual-debugger" target="_blank" rel="noreferrer external">
				<img src="/git-icon-white.svg" alt="Git VCS Logo" class="mono git-logo">
			</a>

			<GitShaSVG />

			<a href="//github.com/notnotquinn/supibot-visual-debugger/tree/{fullGitSha}"
				class="mono"
				target="_blank"
				rel="noreferrer external">
				{gitSha}
			</a>
		</span>

		<span>
			Inspired By Mm2pl's <a target="_blank" rel="noreferrer external" href="https://kotmisia.pl/sbdbg/">SBDBG</a>
			(<a target="_blank" rel="noreferrer external" href="https://git.kotmisia.pl/mm2pl/sbdbg">Git</a>)
		</span>
	</footer>
</div>

