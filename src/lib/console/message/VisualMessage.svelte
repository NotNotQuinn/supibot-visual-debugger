<script lang="ts" context="module">
	/**
	 * Represents a visual part of a message.
	 *
	 * That is to say, this part of the message is purely visual.
	 *
	 * All possible values here start with `"visual:"` to distinguish them from possible future message parts.
	 */
	 export type VisualMessagePart =
	 	// solid-horizontal-line
		| "visual:solid-horizontal-line"
		| "visual:solid-horizontal-line wide"
	 	// dotted-horizontal-line
		| "visual:dotted-horizontal-line"
		| "visual:dotted-horizontal-line wide"
		// dashed-horizontal-line
		| "visual:dashed-horizontal-line"
		| "visual:dashed-horizontal-line wide"
	;

	import type { MessagePart } from '$lib/console/ConsoleMessage.svelte'
	export function isVisualMessage(part: MessagePart): part is VisualMessagePart {
		return typeof part == "string" && part.startsWith("visual:");
	}
</script>

<script lang="ts">
	export let part: VisualMessagePart;
</script>

<style>
	/* solid-horizontal-line styles */
	.solid-horizontal-line {
		display: block;
		border-top: 1px solid grey;
		height: 0;
	}

	/* dashed-horizontal-line styles */
	.dashed-horizontal-line {
		display: block;
		border-top: 1px dashed grey;
		height: 0;
	}

	/* dotted-horizontal-line styles */
	.dotted-horizontal-line {
		display: block;
		border-top: 1px dotted grey;
		height: 0;
	}

	/* wide/non-wide styles */
	.wide {
		margin-left: 0;
		margin-right: 0;
	}
	:not(.wide) {
		margin-left: 1ex;
		margin-right: 1ex;
	}
</style>

<span class={part.slice(7)} />
