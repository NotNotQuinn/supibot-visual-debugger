<script lang="ts">
	// Imports
	import { setContext } from 'svelte';

	// Components
	import ConsoleInput from "$lib/console/ConsoleInput.svelte";
	import ConsoleSidebar from "$lib/console/ConsoleSidebar.svelte";
	import ConsoleMessageList from '$lib/console/ConsoleMessageList.svelte';

	// Types
	import type { MessagePart } from '$lib/console/ConsoleMessage.svelte';

	let messages: Array<MessagePart>[] = [
		[
			{ notice: 'warning',emphasis:true, message: 'This is only a UI, so far.\nNon functional.'},
		],
		[
			{message:"This is SVD v1.0.0 (commit b1ef426a, built 2023-02-26)"},
			"visual:dashed-horizontal-line",
			{notice:"info", message:"Logged in as quinndt (uid: 6714725)"},
		],
		[
			{message:"SVD> $ping"},
			"visual:solid-horizontal-line wide",
			{notice:'info',noticeLabel:'Supibot',message:"Pong! Uptime: 2d, 2h; Temperature: 47.2°C; Free memory: 446 MB/945 MB; CPU usage: rising sharply; Commands used: 96294; Redis: 33623 keys; Banphrase API: Not connected; Latency to TMI: 198ms"}
		]
	];

	// h                 : Show help
	// $<command>        : Execute supibot command
	// l <name>          : Load alias 'dank' from your account.
	// s                 : Step current execution
	// p [command]       : Parse [command] or current command if not
	//                     provided, and show internal representation.
	//                     Useful to see if something is bugged.
	// login <id> <auth> : Log in to your account with supibot.
	// logout            : Log out of your account with supibot.

	// If there get too many commands, i.e. the help gets unruly to read,
	// then separate them into groups, and have the groups be colour coded.
	type CommandExecuteFnCtx = {
		args: string[];
	}
	type CommandExecuteFn = (ctx: CommandExecuteFnCtx) => void
	type CommandDefinition = {
		help_text: string;
		help_invocation: string;
		execute: CommandExecuteFn;
	}
	let commands: { [x:string]: CommandDefinition } = {
		h: {
			help_invocation: 'h',
			help_text: 'Show help.',
			execute: (ctx: unknown) => {
				let cmds = Object.values(commands);
				let maxlen = Math.max(...cmds.map(i => i.help_invocation.length)) + 1;

				for (const command of cmds) {
					logMessageParts(false, {
						notice: 'notice',
						message: command.help_text,
						noticeLabel: (command.help_invocation+(" ".repeat(maxlen))).slice(0, maxlen)
					},"visual:dashed-horizontal-line")
				}
			}
		},
		clear: {
			help_invocation: 'clear',
			help_text: 'Clear and delete all messages.\nUse with caution.',
			execute: _ctx => {
				messages = [];
			}
		},
		$: {
			help_invocation: '$<command>',
			help_text: 'Run a supibot command.\nCan also be used with a space.',
			execute: ctx => {
				logMessageParts(false, { message: 'TODO :)', notice: 'error'})
			}
		},
		login: {
			help_invocation: "login <id> <auth>",
			help_text: "Login to the supinic.com API.\nRequired to use most of the debugger.",
			execute: ctx => {

			}
		},
		logout: {
			help_invocation: "logout",
			help_text: "Logout of the supinic.com API.",
			execute: ctx => {

			}
		}
	};

	// Bound variables.
	let supibotCommand: string;
	function runDebugCommand({ detail: user_input }: CustomEvent<string>) {
		logMessageParts(true, { message: "SVD> "+user_input }, "visual:solid-horizontal-line wide");

		let [command_string, ...args] = user_input.split(' ');
		if (command_string.startsWith('$')) {
			args.unshift(command_string.slice(1));
			command_string = '$'
		}

		let ctx = { args };

		if (Object.hasOwn(commands, command_string)) {
			let command = commands[command_string as "h"];
			command.execute(ctx);
		} else {
			logMessageParts(false, {notice: "error", message: `Unknown debug command: "${command_string}"`})
		}



	}

	// Functions
	/**
	 * Logs a message to the Debug Console
	 * @param beginMessage If true, creates a new Message.
	 * @param parts The data to log. Shown in array order.
	 */
	function logMessageParts(beginMessage: boolean, ...parts: MessagePart[]) {
		if (messages.length == 0) beginMessage = true;
		if (beginMessage) {
			messages.push(parts);
		} else {
			messages[messages.length-1].push(...parts);
		}
		messages = messages;
	}
	setContext("logMessageParts", logMessageParts);
</script>

<script lang="ts" context="module">
	export type logMessagePartsFn = (beginMessage: boolean, ...parts: MessagePart[]) => void;
</script>

<style>
	.console-content {
		border-left: var(--neutral-text) dotted 1px;
		padding: 1ex;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		flex: 4;
		padding: 5px;
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
	}
</style>

<div class="console">
	<div class="console-sidebar">
		<ConsoleSidebar />
	</div>

	<div class="console-content">
		<ConsoleInput
			bind:value={supibotCommand}
			keybind="s"
			noEnterEvent={true}
			placeholder="Try: $pipe ping | shuffle"
		>
			<h4 style="display: inline">Supibot Command:</h4>
		</ConsoleInput>

		<ConsoleMessageList bind:messages />

		<ConsoleInput
			keybind="d"
			placeholder="h for help"
			on:enter={runDebugCommand}
		>
			<h4 style="display: inline">Debug Command:</h4>
		</ConsoleInput>
	</div>
</div>
