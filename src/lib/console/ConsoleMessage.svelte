<script lang="ts" type="module">
	import {
		isTextualMessage,
		isVisualMessage,
		type MessagePart
	} from "$lib/message";

	import TextualMessage from '$lib/console/message/TextualMessage.svelte';
	import VisualMessage from '$lib/console/message/VisualMessage.svelte';

	// Exports / Props
	/**
	 * The message to render, made up of parts.
	 */
	export let message: MessagePart[];
</script>

<style>
	/* Message container styles */
	.message {
		box-shadow: 3px 3px 5px #0000003f;
		outline: grey solid 1px;
		background-color: #2a2932;
		margin: 1ex;
		display: flex;
		flex-direction: column;
		align-self: stretch;
	}

	.padded-content {
		padding: 1ex;
	}
</style>

<!-- foo -->
<div class="message mono">
	{#each message as part}
		{#if isVisualMessage(part)}
			<VisualMessage {part}/>
		{:else if isTextualMessage(part)}
			<TextualMessage {part} />
		{:else}
		<div class="padded-content">
			<i>[message render error]: Invalid message part. JSON is shown below.</i>
			<div class="mono" style="white-space: break-spaces">{JSON.stringify(part)}</div>
		</div>
		{/if}
	{:else}
		<i class="padded-content">empty message</i>
	{/each}
</div>
