<script lang="ts">
	// Imports
	import { setContext, onMount } from 'svelte';
	import { _supibotCommandWritable } from '$lib/stores.js'
	import { runDebugCommand } from '$lib/js/debugCommand.js'
	import {
		type writeConsoleFn,
		type MessagePart,
		writeConsoleKey,
	} from '$lib/message';

	import * as loginManager from '$lib/js/loginManager.js';

	// Components
	import ConsoleInput from "$lib/console/ConsoleInput.svelte";
	import ConsoleSidebar from "$lib/console/ConsoleSidebar.svelte";
	import ConsoleMessageList from '$lib/console/ConsoleMessageList.svelte';

	let messages: Array<MessagePart>[] = [[{ message:`This is Supibot Visual Debugger v0.0.1` }]];

	onMount(() => {
		let { username, userid } = loginManager.fetch_user();
		writeConsole(false,
			"visual:solid-horizontal-line wide",
			{ notice: 'info', message: loginManager.isLoggedIn() ? `Logged in as: ${username} (ID: ${userid})` : 'You are not logged in.' }
		)
	});

	function intakeDebugCommand({ detail: user_input }: CustomEvent<string>) {
		runDebugCommand(user_input, writeConsole, () => { messages = []; });
	}

	// Functions
	/**
	 * Logs a message to the Debug Console
	 * @param beginMessage If true, creates a new Message.
	 * @param parts The data to log. Shown in array order.
	 */
	const writeConsole: writeConsoleFn = function writeConsole(beginMessage: boolean, ...parts: MessagePart[]) {
		if (messages.length === 0) beginMessage = true;
		if (beginMessage) {
			messages.push(parts);
		} else {
			messages[messages.length-1].push(...parts);
		}
		messages = messages;
	}
	setContext(writeConsoleKey, writeConsole);
</script>

<style>
	.console-content {
		border-left: var(--neutral-text) dotted 1px;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		flex: 4;
		padding: 1ex;
	}

	.console-sidebar {
		flex: 1;
		padding: 5px;
		min-width: 200px;
	}
	.console {
		display: flex;
		flex-direction: row;
		min-width: 6rem;
		align-items: stretch;
		overflow: hidden;
		flex: 1;
		padding: 0 1rem;
	}
</style>

<div class="console">
	<div class="console-sidebar">
		<ConsoleSidebar />
	</div>

	<div class="console-content">
		<ConsoleInput
			bind:value={$_supibotCommandWritable}
			keybind="s"
			noEnterEvent={true}
			placeholder="Try: $pipe ping | shuffle"
		>
			<span style="font-weight: bold;">Supibot Command:</span>
		</ConsoleInput>

		<ConsoleMessageList bind:messages />

		<ConsoleInput
			keybind="d"
			placeholder="h for help"
			on:enter={intakeDebugCommand}
		>
			<span style="font-weight: bold;">Debug Command:</span>
		</ConsoleInput>
	</div>
</div>
