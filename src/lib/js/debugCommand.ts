
import type { writeConsoleFn, MessagePart } from "$lib/message";
import * as loginManager from './loginManager';
import * as supibotCommand from './supibot/command';
import ErrorStackParser from 'error-stack-parser';
import { supibotCommand as supibotCommandStore } from '../stores';
import { get } from 'svelte/store';


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

/** Context passed to a debug command's implementation. */
type ActionCtx = Readonly<{
	/** Debug CLI arguments */
	args: string[];
	/** The current supibot command string, as of when the command was invoked. */
	current_supibot_command: string;

	/** The message displaying the command that was just typed. */
	rendered_invocation_text: MessagePart[];
	/** The usage text built from basic help information. */
	rendered_usage_text: MessagePart[];

	/** Creates a new (empty) message. */
	dbg_begin_message: () => void;
	/** Appends parts to the most recent message. */
	dbg_log: (...parts: MessagePart[]) => void;
	/** Clears ALL messages. */
	dbg_clear: () => void;
}>;

/** The logical implementation of a debug command. */
type Action = (ctx: ActionCtx) => Promise<void>;

/** A flag for a debug command; Changes behaviour in some way. */
type Flag =
	| "dont-show-invocation"
	;


/** A debug command, for use in the debug console. */
type DebugCommand = {
	help_text: string;
	help_invocation: string;
	flags?: Flag[];
	execute: Action;
};

const unimplemented: Action = async function debug_command__UNIMPLEMENTED(ctx) {
	ctx.dbg_log({ message: 'Unimplemented!', notice: 'error' });
};

const needLogin: (a: Action) => Action = wrapped => {
	return async function debug_command__NEEDS_LOGIN(ctx) {
		if (!loginManager.isLoggedIn()) {
			ctx.dbg_log({ notice: 'error', message: `You must be logged in to do that.` });
			return;
		}

		wrapped(ctx);
	};
};

let commands: { [x: string]: DebugCommand; } = {
	h: {
		help_invocation: 'h',
		help_text: 'Show help.',
		execute: async function debug_command_h(ctx) {
			let command_objs = Object.values(commands);
			let max_len = Math.max(...command_objs.map(i => i.help_invocation.length)) + 1;

			for (const command of command_objs) {
				ctx.dbg_log(
					{
						notice: 'notice',
						noticeLabel: (command.help_invocation + (" ".repeat(max_len))).slice(0, max_len),
						message: command.help_text,
					},
					"visual:dashed-horizontal-line"
				);
			}
		}
	},
	clear: {
		help_invocation: 'clear',
		help_text: 'Delete all messages.',
		execute: async function debug_command_clear(ctx) {
			ctx.dbg_clear();
		}
	},
	$: {
		help_invocation: '$<command>',
		help_text: 'Run a supibot command. Can also be used with a space.',
		execute: needLogin(async function debug_command_$(ctx) {
			let command = ctx.args.join(' ');

			let resp = await loginManager.authed_fetch("https://supinic.com/api/bot/command/run", {
				method: "POST",
				body: JSON.stringify({ query: "$" + command }),
				headers: { "Content-Type": "application/json" }
			});

			let json = await resp.json();

			console.log('Raw /api/bot/command/run:', json);

			if (json.error) {
				ctx.dbg_log({ notice: 'error', emphasis: true, message: json.error.message ?? '(empty error message)' });
				return;
			}

			ctx.dbg_log({ notice: 'info', noticeLabel: 'Supibot', message: json.data.reply ?? '(empty message)' });
		})
	},
	parse: {
		help_invocation: 'parse [command]',
		help_text: 'Parse [command] or current command if not provided, and show internal representation. Useful to see if something is bugged.',
		execute: async function debug_command_parse(ctx) {
			let invocation: string;
			let args: string[];

			if (ctx.args.length == 0) {
				[invocation, ...args] = ctx.current_supibot_command.split(' ').filter(Boolean);
			} else {
				[invocation, ...args] = ctx.args;
			}

			if (!invocation) {
				ctx.dbg_log(
					{ notice: 'error', message: 'No command in the textbox.' },
					"visual:dashed-horizontal-line"
				);

				ctx.dbg_log(...ctx.rendered_usage_text);
				return;
			}

			if (!invocation.startsWith('$') || invocation == "$") {
				throw new Error("Command string must include prefix.");
			}

			let parsed = await supibotCommand.parse(invocation.slice(1), args);
			ctx.dbg_log({ message: JSON.stringify(parsed, undefined, 4) });
		}
	},
	login: {
		help_invocation: "login [<id> <auth>]",
		help_text: "Login to the supinic.com API and store tokens in localStorage. Required to use most of the debugger.",
		flags: ["dont-show-invocation"],
		execute: async function debug_command_login(ctx) {
			ctx.dbg_begin_message();
			ctx.dbg_log({ message: "SVD> login" + (ctx.args.length ? ' [redacted]' : '') }, "visual:solid-horizontal-line wide");
			if (ctx.args.length == 0) {
				ctx.dbg_log({ message: "Usage: login <supibot user id> <API key>\nGo to https://supinic.com/user/auth-key to generate a key." });
				return;
			}
			const [uid, key] = ctx.args;

			let success = await loginManager.tryLogin(uid, key);

			if (!success) {
				ctx.dbg_log({ notice: 'error', emphasis: /* if not now, when? */ true, message: 'Invalid credentials.' });
			} else {
				let user = loginManager.fetch_user();
				ctx.dbg_log(
					{ message: `Logged in successfully.` },
					"visual:dotted-horizontal-line",
					{ message: `Username: ${user.username}\nSupibot ID: ${user.userid}` },
				);
			}
		},
	},
	logout: {
		help_invocation: "logout",
		help_text: "Logout of the supinic.com API.",
		execute: async function debug_command_logout(ctx) {
			loginManager.logout();
			ctx.dbg_log({ message: "Logged out successfully." });
		}
	},
};

export async function runDebugCommand(user_input: string, writeConsole: writeConsoleFn, clearConsole: () => void) {
	let start = new Date().valueOf();
	let rendered_invocation: MessagePart[] = [{ message: "SVD> " + user_input }, "visual:solid-horizontal-line wide"];

	// Get command name separate from args
	let [command_string, ...args] = user_input.split(' ').filter(Boolean);

	// Special case: '$' prefixed text
	if (command_string.length > 1 && command_string.startsWith('$')) {
		args.unshift(command_string.slice(1));
		command_string = '$';
	}

	// Get command
	if (!Object.hasOwn(commands, command_string)) {
		writeConsole(true,
			...rendered_invocation,
			{ notice: "error", message: `Unknown debug command: "${command_string}"` }
		);
		return;
	}

	// Start command "execution"
	let command = commands[command_string];
	if (!command.flags?.includes("dont-show-invocation")) {
		writeConsole(true, ...rendered_invocation);
	}

	// Load/Generate contextual data
	let ctx: ActionCtx = {
		// Variable data
		args,
		current_supibot_command: get(supibotCommandStore),
		rendered_invocation_text: rendered_invocation,
		// Constant data
		rendered_usage_text: [{ message: `Usage: ${command.help_invocation}\n${command.help_text}` }],
		// Functions
		dbg_begin_message: () => writeConsole(true),
		dbg_log: (...p: MessagePart[]) => writeConsole(false, ...p),
		dbg_clear: clearConsole,
	};

	// Execute!
	try {
		// Errors are planned.
		await command.execute(ctx);
	} catch (e: any) {
		// In case error handling goes wrong in some way - there is still a log somewhere.
		console.error(`Error running command '${user_input}':`, e);

		if (e instanceof Error) {
			const stack = ErrorStackParser.parse(e).map(i => i.toString());
			const lastLine = stack.findIndex(i => i.includes('runDebugCommand'));
			const stack_str = stack.slice(0, lastLine).join('\n');
			writeConsole(false,
				"visual:solid-horizontal-line wide",
				{ notice: 'error', emphasis: true, noticeLabel: e.name, message: e.message + '\n\n' + stack_str }
			);
		} else {
			writeConsole(false,
				"visual:solid-horizontal-line wide",
				{ notice: 'error', emphasis: true, message: `Non-error object: JSON shown below.\n\n${JSON.stringify(e)}` }
			);
		}
	} finally {
		// Show how long a command takes - but only if it is "long enough".
		// Right now that means 2.5 seconds.
		const min_duration = 2500;

		let end = new Date().valueOf();
		let duration = (end - start);

		if (duration >= min_duration) {
			writeConsole(false,
				"visual:solid-horizontal-line wide",
				{ notice: 'info', message: `Command finished in ${(duration / 1000).toFixed(2)}s` },
			);
		}
	}
}
