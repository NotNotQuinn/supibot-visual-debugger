<script lang="ts">
	import Console from "$lib/console/Console.svelte";
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
		padding: 1rem;
		box-sizing: border-box;
	}

	h1 {
		margin: 1rem
	}

	.footer {
		text-align: center;
		padding-bottom: 0;
	}
</style>

<svelte:head>
	<title>Danking Around | Supibot Visual Debugger</title>
</svelte:head>

<div class="container">
	<h1>Supibot Visual Debugger</h1>

	<Console />

	<footer class="footer">
		<span class="footer-end"><a href="//github.com/notnotquinn/supibot-visual-debugger" target="_blank" rel="noreferrer external">Source Code</a></span>
		&#9679;
		<span class="footer-start">Inspired by Mm2pl's <a target="_blank" rel="noreferrer external" href="https://kotmisia.pl/sbdbg/">SBDBG</a> (<a target="_blank" rel="noreferrer external" href="https://git.kotmisia.pl/mm2pl/sbdbg">git</a>)</span>
	</footer>
</div>

