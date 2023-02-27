<script lang="ts" context="module">
	/**
	 * Represents a textual part of a message.
	 *
	 * That is to say, this part of the message is purely textual.
	 */
	 export type TextualMessagePart = {
		/** The text of the message. */
		message: string;
		/** The style of notice, if any. A value of `undefined` is identical to setting to `"none"`. */
		notice?: "error" | "warning" | "info" | "success" | "notice" | "none";
		/** An emphasized notice has a large coloured border. */
		emphasis?: boolean;
		/** Use this string in place of the notice name. */
		noticeLabel?: string;
	};

	import type { MessagePart } from '$lib/console/ConsoleMessage.svelte';
	export function isTextualMessage(part: MessagePart): part is TextualMessagePart {
		return typeof part === "object" && typeof part.message === "string";
	}
</script>

<script lang="ts">
	export let part: TextualMessagePart;
</script>

<style>

	p {
		padding: .15em 0;
	}
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
		white-space: break-spaces;
		display: flex;
	}

	.textual-message {
		padding: .75ex;
	}
</style>

<div class="textual-message">
	{#if typeof part.notice == "undefined" || part.notice == "none"}
		<p class="raw-text">{part.message}</p>
	{:else}
		<div class={"notice notice-type-"+part.notice} class:emphasis={part.emphasis}>
			<span class="notice-label">{(part.noticeLabel ?? part.notice.toUpperCase())+': '}</span>
			<span class="notice-content">{part.message}</span>
		</div>
	{/if}
</div>
