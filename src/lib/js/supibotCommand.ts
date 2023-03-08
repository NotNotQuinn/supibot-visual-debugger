import { browser } from '$app/environment';
import { parseParametersFromArguments } from './supibot-browser/command';
import type { Parameter } from './supibot-browser/command';
import * as loginManager from './loginManager';
import { applyParameters } from './supibot-browser/alias';

import type {
	SupibotCommandDetail,
	emptyObject,
	BasicCommandDescriptor,
	AnyCommand,
	// $alias
	AliasInvocation,
	AliasInvocationData,
	// $pipe
	PipeCommand,
	PipeCommandData,
} from './supibotCommandTypes';

/**
 * Queries `/api/bot/command/detail/:name` for command information.
 * @param commandName Command name to look up.
 * @returns Command detail
 */
async function fetchCommandDetail<
	ParametersDefinition extends Record<string, Parameter.Type> = emptyObject
>(commandName: string): Promise<SupibotCommandDetail<ParametersDefinition>> {
	if (!browser) return {
		aliases: [],
		author: "no-one",
		cooldown: 1000,
		description: "Dummy command for server-side rendering.",
		dynamicDescription: null,
		flags: [],
		name: "##dummy-command##",
		params: {} as ParametersDefinition
	};

	if (!commandName) throw new Error("Command name cannot be empty string.");

	// Lowercase command name
	commandName = commandName.toLowerCase();

	// Check session cache
	let cache_key = `cached_supibot_command_detail_${commandName}`;
	let detail: SupibotCommandDetail<ParametersDefinition> | null = JSON.parse(
		sessionStorage.getItem(cache_key) ?? 'null'
	);
	if (detail) return detail;

	// Download command detail
	let resp = await fetch(`https://supinic.com/api/bot/command/detail/${encodeURIComponent(commandName)}`);
	let json: { error: any; data: any; } = await resp.json();

	if (json.error) {
		throw new Error(`Cannot fetch command ${commandName} detail: HTTP ${resp.status}: ${json.error.message}`);
	}

	// Format params properly
	let formattedParams: Record<string, Parameter.Type> = {};
	for (let p of json.data.params) {
		formattedParams[p.name] = p.type;
	}

	let formattedData: SupibotCommandDetail<ParametersDefinition> = {
		...json.data,
		flags: Object.keys(json.data.flags),
		params: formattedParams,
	};

	// Cache and return result
	sessionStorage.setItem(cache_key, JSON.stringify(formattedData));
	return formattedData;
}

/**
 * Parses a supibot command into a javascript object.
 * @param invocation Command name invoked.
 * @param args Arguments to the command.
 */
export async function parse(invocation: string, args: string[]): Promise<AnyCommand> {
	let commandInfo = await fetchCommandDetail<Record<string, Parameter.Type>>(invocation);

	let descriptors: Parameter.Descriptor[] = [];

	for (const name in commandInfo.params) {
		descriptors.push({ name, type: commandInfo.params[name] });
	}

	let supibotInterpretation = parseParametersFromArguments(descriptors, args);
	if (!supibotInterpretation.success) {
		throw new Error(`Error parsing parameters: reply: ${supibotInterpretation.reply}`);
	}

	let cmd: AnyCommand = {
		staticCommand: commandInfo,
		instanceData: null,
		invocation: invocation,
		rawArguments: args,
		interpretedArguments: supibotInterpretation.args,
		parameters: supibotInterpretation.parameters,
	};

	// https://github.com/Supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/classes/command.js#L150
	// privilegedCommandCharacters: Characters treated in a special way for command names.
	if (invocation.startsWith('$')) {
		args.unshift(invocation.slice(1));
		invocation = '$';
	}

	if (commandInfo.name == "pipe") {
		cmd.instanceData = await parse_pipe_command(cmd as Exclude<PipeCommand, "data">);
	} else if (commandInfo.name == "alias" && (invocation == "$" || args[0] == "try" || args[0] == "run")) {
		cmd.instanceData = await parse_alias_invocation_command(cmd as Exclude<AliasInvocation, "data">);
	}

	return cmd;
}

// https://github.com/Supinic/supibot/blob/91175f2ef2bf579488353e7af389b8261cdf8f32/commands/pipe/index.js#L17
// matches | and > characters if and only if they're not preceded, nor followed by another | or >.
const pipeRegex = /(?<![|>])[|>](?![|>])/;

async function parse_pipe_command(cmd: Exclude<PipeCommand, "data">): Promise<PipeCommandData> {
	// To determine splitter: https://github.com/Supinic/supibot/blob/master/commands/pipe/index.js#L32
	let splitter;
	if (cmd.parameters._char) {
		splitter = cmd.parameters._char;
	}
	else {
		const input = cmd.interpretedArguments.join(" ");
		const alonePipeCount = [...input.matchAll(/\s\|\s/g)].length;
		const aloneBracketCount = [...input.matchAll(/\s>\s/g)].length;

		if (alonePipeCount === 0 && aloneBracketCount === 0) {
			splitter = pipeRegex;
		}
		else if (aloneBracketCount > alonePipeCount) {
			splitter = /\s>\s/;
		}
		else {
			splitter = /\s\|\s/;
		}
	}

	// To determine invocations: args.join(" ").split(splitter).map(i => i.trim())
	// https://github.com/Supinic/supibot/blob/91175f2ef2bf579488353e7af389b8261cdf8f32/commands/pipe/index.js#L51
	let invocations = cmd.interpretedArguments.join(' ').split(splitter).map(i => i.trim());
	let subcommands: PipeCommandData["subcommands"] = [];
	for (const inv of invocations) {
		let [invocation, ...args] = inv.split(' ').filter(Boolean);
		if (invocation == "pipe") {
			// Run-time generated pipe data

			subcommands.push({
				unparsed: {
					invocation: "pipe",
					args: args
				},
				parsed: null
			});
		} else {
			// Compile-time pipe data

			subcommands.push({
				unparsed: {
					invocation,
					args
				},
				parsed: await parse(invocation, args)
			});

		}
	}

	return { subcommands };
};

export class SupibotCommandParserError extends Error { };
function commandString(cmd: AnyCommand): string {
	return '$' + cmd.invocation + ' ' + cmd.rawArguments.join(' ');
}

async function parse_alias_invocation_command(cmd: Exclude<AliasInvocation, "data">): Promise<AliasInvocationData> {
	let aliasUser: string;
	let aliasName: string;
	let aliasInput: string[];

	let current_user = loginManager.fetch_user();
	if (cmd.interpretedArguments.length < 1) {
		// not enough args
		throw new SupibotCommandParserError(`Malformed '$alias' invocation: not enough args: '${commandString(cmd)}'`);
	} else if (cmd.invocation == '$') {
		// Ex: $$ fish foo bar
		//     || ~0~~ ~1+~~~~>
		//     || |    ^ [1+] arguments
		//     || ^ [0] alias name
		//     |^ command
		//     ^ prefix
		aliasUser = current_user.username;
		aliasName = cmd.interpretedArguments[0];
		aliasInput = cmd.interpretedArguments.slice(1);
	} else if (cmd.interpretedArguments.length < 2) {
		// not enough args
		throw new SupibotCommandParserError(`Malformed '$alias' invocation: not enough args: '${commandString(cmd)}'`);
	} else if (cmd.interpretedArguments[0] == "run") {
		// Ex: $alias run fish foo bar
		//     |~~~~~ ~0~ ~1~~ ~2+~~~~>
		//     ||     |   |    ^ [2+] arguments
		//     ||     |   ^ [1] alias name
		//     ||     ^ [0] 'run' subcommand
		//     |^ command
		//     ^ prefix
		aliasUser = current_user.username;
		aliasName = cmd.interpretedArguments[1];
		aliasInput = cmd.interpretedArguments.slice(2);
	} else if (cmd.interpretedArguments.length < 3) {
		// not enough args
		throw new SupibotCommandParserError(`Malformed '$alias' invocation: not enough args: '${commandString(cmd)}'`);
	} else if (cmd.interpretedArguments[0] == "try") {
		// Ex: $alias try brin____ fish foo bar
		//     |~~~~~ ~0~ ~1~~~~~~ ~2~~ ~3+~~~~>
		//     ||     |   |        |     ^ [3+] arguments
		//     ||     |   |        ^ [2] alias name
		//     ||     |   ^ [1] username
		//     ||     ^ [0] 'try' subcommand
		//     |^ command
		//     ^ prefix
		aliasUser = cmd.interpretedArguments[1];
		aliasName = cmd.interpretedArguments[2];
		aliasInput = cmd.interpretedArguments.slice(3);
	} else {
		// Ex: $alias foo bar dank
		// and somehow this fn gets called; probably not possible
		throw new SupibotCommandParserError(`Malformed '$alias' invocation: not an invocation: '${commandString(cmd)}'`);
	}

	// Static alias definition, Eg: "$abb say --> ${0+} <--"
	let alias = await resolve_alias(aliasUser, aliasName);

	// Instanced command equivalent of the alias, Ex: "$abb say --> foo bar <--"
	let replaced = applyParameters(current_user.username, undefined, alias.arguments, aliasInput);

	if (!replaced.success) {
		throw new Error(`Malformed '$alias' definition: alias "${aliasName}" (user: ${aliasUser}): ${replaced.reply}`);
	}

	return {
		commandEquivalent: {
			unparsed: {
				invocation: alias.invocation,
				arguments: replaced.resultArguments,
			},
			parsed: await parse(alias.invocation, replaced.resultArguments)
		},
		aliasUser,
		aliasName,
		aliasInput,
		aliasDefinition: alias,
	};
}


async function resolve_alias(aliasUser: string, aliasName: string): Promise<BasicCommandDescriptor> {
	if (!browser) return { invocation: 'abb', arguments: "say SSR is dank FeelsDankMan IF YOU SEE THIS IN BROWSER VI VON".split(' ') };

	// Check session cache
	let cache_key = `cached_supibot_alias_user:${aliasUser}_alias:${aliasName}`;
	let cached_alias: BasicCommandDescriptor | null = JSON.parse(
		sessionStorage.getItem(cache_key) ?? 'null'
	);
	if (cached_alias) return cached_alias;

	// Download command detail
	let resp = await fetch(`https://supinic.com/api/bot/user/${encodeURIComponent(aliasUser)}/alias/detail/${encodeURIComponent(aliasName)}`);
	let json: { error: any; data: any; } = await resp.json();

	if (json.error) {
		throw new Error(`Cannot fetch alias "${aliasName}" (user: ${aliasUser}) detail: HTTP ${resp.status}: ${json.error.message}`);
	}

	let resolved: BasicCommandDescriptor;
	if (json.data.linkAuthor !== null && json.data.linkName !== null) {
		// recurse once: guaranteed no links to links
		resolved = await resolve_alias(json.data.linkAuthor, json.data.linkName);
	} else {
		resolved = { invocation: json.data.invocation, arguments: json.data.arguments };
	}


	// Cache and return result
	sessionStorage.setItem(cache_key, JSON.stringify(resolved));
	return resolved;
}
