<script lang="ts" context="module">
	import type { TextualMessagePart }from '$lib/console/message/TextualMessage.svelte';
	import type { VisualMessagePart }from '$lib/console/message/VisualMessage.svelte';

	/**
	 * Represents a single part of a message.
	 *
	 * Messages are made up of a series of parts, and rendered in order.
	 */
	export type MessagePart =
		| TextualMessagePart
		| VisualMessagePart
		// | CommandMessagePart
	;
</script>

<script lang="ts" type="module">
	import TextualMessage, { isTextualMessage } from "$lib/console/message/TextualMessage.svelte";
	import VisualMessage, { isVisualMessage } from "$lib/console/message/VisualMessage.svelte";

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
</style>

<!-- foo -->
<div class="message mono">
	{#each message as part}
		{#if isVisualMessage(part)}
			<VisualMessage {part}/>
		{:else if isTextualMessage(part)}
			<TextualMessage {part} />
		{:else}
			<i>[message render error]: Invalid message part. JSON is shown below.</i>
			<div class="mono" style="white-space: break-spaces">{JSON.stringify(part)}</div>
		{/if}
	{:else}
		<i style="padding: calc(.75ex + .15em) .75ex;">empty message</i>
	{/each}
</div>
