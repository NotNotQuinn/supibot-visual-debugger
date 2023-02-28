<script lang="ts">
	import type { VisualMessagePart } from '$lib/message/visual.js';
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
