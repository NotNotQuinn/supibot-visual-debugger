
<script lang="ts">
	import { createEventDispatcher } from "svelte";
	/**
	 * A string to represent the key.
	 *
	 * Must be the same as those on keydown events.
	 */
	export let keybind: string;

	const dispatch = createEventDispatcher<{ 'press': undefined }>();
	function keydown(e: KeyboardEvent) {
		if ( keybind === "" || e.key != keybind || e.repeat || !e.ctrlKey) return;
		// Tell the browser not to use this key press for anything else.
		e.preventDefault();
		dispatch('press');
	}
</script>

<style>
	.keybind-definition:not(:hover) > .key {
		text-decoration: dotted underline white 1px;
	}
	.keybind-definition:hover > .key::before {
		content: 'CTRL + ';
	}
	.key {
		text-transform: uppercase;
	}
</style>
<!--
@component
	Displays the keyboard shortcut, and adds an event listener.

	Custom event `on:press` is dispatched when the keybind is pressed.
	If key is the empty string, nothing is displayed.
-->
<svelte:window on:keydown={keydown} />
{#if keybind != ""}
	<strong class="keybind-definition">
		[<span class="key mono">{keybind}</span>]
	</strong>
{/if}
