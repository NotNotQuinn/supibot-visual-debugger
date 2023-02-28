const commands = {
	h: function help() {

	}
} as const;

import type { writable } from "svelte/store";
import type { logMessagePartsFn } from "$lib/message";

export function runDebugCommand(user_input: string, supibotCommand: typeof writable<string>, logMessageParts: logMessagePartsFn) {

	logMessageParts(true, { message: "SVD> " + user_input }, "visual:solid-horizontal-line wide");

	let [command_string, ...args] = user_input.split(' ');
	if (command_string.startsWith('$')) {
		args.unshift(command_string.slice(1));
		command_string = '$';
	}
	console.log($supibotCommand);
	let ctx = { args };

	if (Object.hasOwn(commands, command_string)) {
		let command = commands[command_string as "h"];
		command();
	} else {
		logMessageParts(false, { notice: "error", message: `Unknown debug command: "${command_string}"` });
	}



}
