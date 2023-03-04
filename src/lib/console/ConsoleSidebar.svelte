<script lang="ts">
	import { getContext } from 'svelte';
	import {
		ValidVisualMessageParts,
		type MessagePart,
		type VisualMessagePart,
		type writeConsoleFn,
		writeConsoleKey
	} from '$lib/message';


	let new_message: boolean = true;
	let emphasis: boolean = false;
	let message: string = "[message goes here]";
	let visual: VisualMessagePart = "visual:solid-horizontal-line";
	let noticeMessage = "";

	const _writeConsole = getContext<writeConsoleFn>(writeConsoleKey)
	const writeConsole: writeConsoleFn = (beginMessage: boolean, ...parts: MessagePart[]) => {
		if (beginMessage) console.log('beginMessage')
		console.log(parts);
		_writeConsole(beginMessage, ...parts);
	}
</script>

<style>
	textarea {
		box-sizing: border-box;
		min-width: 100%;
		resize: vertical;
		margin-bottom: 1ex;
	}
</style>

<div class="mono">
	<h3>UI Debug Menu</h3>
	<p style="font-size: 10pt;">Internal representation shown in log.</p>

	<textarea bind:value={message}></textarea>
	<button on:click={() => writeConsole(true) }>Append Empty Message</button><br>

	<button on:click={() => // @ts-expect-error
		writeConsole(new_message, { some: "invalid", data: "here" })}>Append Invalid Message Part</button><br>
	<br>

	<p>Options</p>
	<label><input type="checkbox" name="new" id="new" bind:checked={new_message}> Create New Message</label><br>
	<br>

	<p>Send 'just text':</p>
	<button on:click={_=> writeConsole(new_message, { message }) }>Just Text</button><br>
	<br>

	<p>Send a 'Notice':</p>
	<label><input type="checkbox" name="emphasis" id="emphasis" bind:checked={emphasis}> Emphasis</label><br>
	<button on:click={_=> writeConsole(new_message, { message, notice: 'notice', noticeLabel: noticeMessage || undefined, emphasis }) }>Notice</button><br>
	<button on:click={_=> writeConsole(new_message, { message, notice: 'success', noticeLabel: noticeMessage || undefined, emphasis }) }>Success</button><br>
	<button on:click={_=> writeConsole(new_message, { message, notice: 'info', noticeLabel: noticeMessage || undefined, emphasis }) }>Info</button><br>
	<button on:click={_=> writeConsole(new_message, { message, notice: 'warning', noticeLabel: noticeMessage || undefined, emphasis }) }>Warning</button><br>
	<button on:click={_=> writeConsole(new_message, { message, notice: 'error', noticeLabel: noticeMessage || undefined, emphasis }) }>Error</button><br>
	<br>

	<p>Notice Label</p>
	<input type="text" name="notice-message" id="notice-message" placeholder="<default>" bind:value={noticeMessage}>
	<br>
	<br>
	<p>Visual Elements</p>
	<select bind:value={visual}>
		{#each ValidVisualMessageParts as msg, i}
			<option value="{msg}" selected={i==0}>{msg}</option>
		{/each}
	</select><br>
	<!-- @js-expect-error -->
	<button on:click={
		() => writeConsole(new_message, visual)
	}>Append Visual Element</button>
</div>
