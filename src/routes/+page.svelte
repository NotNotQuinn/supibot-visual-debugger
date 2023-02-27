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
</style>

<svelte:head>
	<title>Danking Around | Supibot Visual Debugger</title>
</svelte:head>

<div class="container">
	<h1>Supibot Visual Debugger</h1>

	<Console />

	<footer>Inspired by <a href="https://kotmisia.pl/sbdbg/">SBDBG</a> (<a href="https://git.kotmisia.pl/mm2pl/sbdbg">git</a>) by Mm2pl</footer>
</div>

