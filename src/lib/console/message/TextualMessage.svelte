<script lang="ts">
	import {
		type TextualMessagePart,
		isTextualMessage_HTML_UNCHECKED
	} from "$lib/message";
	export let part: TextualMessagePart;
</script>

<style>
	.notice-type-success {
		--notice-color: hsl(120, 93%, 79%);
	}
	.notice-type-info {
		--notice-color: hsl(210, 73%, 75%);
	}
	.notice-type-warning {
		--notice-color: hsl(51, 100%, 68%);
	}
	.notice-type-error {
		--notice-color: hsl(340, 57%, 64%);
	}
	.notice-type-notice {
		--notice-color: white;
	}

	.notice-content {
		padding-left: 1ex;
	}

	.notice > .notice-label {
		content: var(--notice-title);
		color: var(--notice-color);
		white-space: pre;
	}

	.notice.emphasis {
		outline: var(--notice-color) dotted 2px;
		padding: 6px;
		margin: 5px;
		padding-left: 10px;
	}

	.notice {
		display: flex;
	}

	.textual-message {
		white-space: break-spaces;
		padding: 1ex;
	}
	:global(.textual-message) + .textual-message {
		padding-top: 0;
	}
	.textual-message:where(p) {
		background-color: red;
	}
</style>

<div class="textual-message">
	{#if isTextualMessage_HTML_UNCHECKED(part)}
		<p>{@html part.HTML_UNCHECKED}</p>
	{:else if typeof part.notice == "undefined" || part.notice == "none"}
		<p>{part.message}</p>
	{:else}
		<div class={"notice notice-type-"+part.notice} class:emphasis={part.emphasis}>
			<span class="notice-label">{(part.noticeLabel ?? part.notice.toUpperCase())}:</span>
			<span class="notice-content">{part.message}</span>
		</div>
	{/if}
</div>
