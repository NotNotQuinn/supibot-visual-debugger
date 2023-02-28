<script lang='ts'>
	import type { MessagePart } from '$lib/message'
	import ConsoleMessage from '$lib/console/ConsoleMessage.svelte'
	export let messages: MessagePart[][];
</script>

<style>
	.console-messages-list {
		border-bottom: 2px dotted var(--neutral-text);
		overflow: hidden;
		flex: 1;
	}
	.console-messages-list {
		display: flex;
		flex-direction: column-reverse;
		overflow-y: scroll;
		height: 100%;
	}
	.no-messages {
		color: grey;
		align-self: center;
		padding-bottom: min(5vh, 5px);
		margin-bottom: 1rem;
	}
</style>

<div class="console-messages-list">
	{#each [...messages].reverse() as message}
			<ConsoleMessage {message} />
	{:else}
		<i class="no-messages">There are no messages to display.</i>
	{/each}
</div>
