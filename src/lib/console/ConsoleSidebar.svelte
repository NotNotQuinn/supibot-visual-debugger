<script lang="ts">
	import { getContext } from 'svelte';
	import type { logMessagePartsFn } from '$lib/console/Console.svelte';
	let new_message: boolean = true;
	let emphasis: boolean = false;
	let message: string = "[message goes here]";
	let notice: "info"|"warning"|"success"|"error"|"none"|"notice" = "none";
	let visual: string = "";
	let noticeMessage = "";
	const logMessageParts = getContext<logMessagePartsFn>("logMessageParts")
</script>
<style>
	textarea {
		box-sizing: border-box;
		min-width: 100%;
		resize: vertical;
		margin-bottom: 1ex;
	}
</style>

<textarea bind:value={message}></textarea>
<button on:click={() => logMessageParts(new_message, { notice, message, emphasis, noticeLabel: noticeMessage || undefined }) }>Append Message Part</button><br>
<button on:click={() => logMessageParts(true) }>Append Empty Message</button><br>
<br>

<p>Options</p>
<label><input type="checkbox" name="new" id="new" bind:checked={new_message}> New Message</label><br>
<label><input type="checkbox" name="emphasis" id="emphasis" bind:checked={emphasis}> Emphasis</label><br>
<br>

<p>Notice Type:</p>
<label><input type="radio" name="notice" id="regular" value="none" bind:group={notice}> None</label><br>
<label><input type="radio" name="notice" id="notice" value="notice" bind:group={notice}> Notice</label><br>
<label><input type="radio" name="notice" id="success" value="success" bind:group={notice}> Success</label><br>
<label><input type="radio" name="notice" id="info" value="info" bind:group={notice}> Info</label><br>
<label><input type="radio" name="notice" id="warning" value="warning" bind:group={notice}> Warning</label><br>
<label><input type="radio" name="notice" id="error" value="error" bind:group={notice}> Error</label><br>
<br>

<p>Notice Message</p>
<input type="text" name="notice-message" id="notice-message" placeholder="<default>" bind:value={noticeMessage}>
<br>
<br>
<p>Visual Elements</p>
<input type="text" name="visual-elements" id="visual-elements" placeholder="solid-horizontal-line wide" bind:value={visual}>
<!-- @js-expect-error -->
<button on:click={
	() => /* @ts-expect-error */
	logMessageParts(new_message, "visual:"+visual)
}>Append Visual Element</button>
