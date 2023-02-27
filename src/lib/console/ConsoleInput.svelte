<script lang="ts">
	// Imports
	import { createEventDispatcher } from "svelte";
	import Keybind from "$lib/Keybind.svelte";

	/**
	 * This value is bound to the textarea element's value.
	 */
	export let value: string = "";

	/**
	 * When true, the user can enter newlines and the `on:enter` event is never fired.
	 */
	export let noEnterEvent: boolean = false;

	/**
	 * The keybind to auto-focus this element's input.
	 * Empty string means no keybind.
	 */
	export let keybind: string = "";

	/**
	 * The textarea's placeholder value.
	 */
	export let placeholder: string = "";

	// Variables.
	const dispatch = createEventDispatcher<{ 'enter': string }>();
	let textarea: HTMLTextAreaElement;

	// Functions
	/**
	 * Runs on every key press. Prevents entering newlines.
	 *
	 * If enter is pressed, the 'enter' event is fired and the input is cleared.
	 * @param e The keyboard event.
	 */
	function debugCommandSubmit(e: KeyboardEvent & { currentTarget: EventTarget & HTMLTextAreaElement }) {
		if (noEnterEvent) return;
		// When the user presses enter, run the command and clear the input.
		if (e.key != "Enter") return;
		if (e.shiftKey) {
			// No newlines.
			e.preventDefault();
			return;
		}

		// Okay should be good.
		e.preventDefault();
		dispatch('enter', e.currentTarget.value );
		e.currentTarget.value = "";
	}
</script>

<style>
	.input {
		resize: none;
		flex: 1;
	}
	.input-area > * {
		margin: 2px
	}
	.input-area {
		padding: 2px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}
</style>

<div class="input-area">
	<label for="input">
		<Keybind {keybind} on:press={() => textarea.focus()}/>
		<slot />
	</label>
	<br />
	<textarea
		{placeholder}
		name="input"
		class="input"
		on:keydown={debugCommandSubmit}
		bind:this={textarea}
		bind:value
	/>
</div>

