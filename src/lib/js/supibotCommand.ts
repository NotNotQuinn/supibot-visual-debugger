import { browser } from '$app/environment';
import { parseParametersFromArguments } from './supibot-browser/command';
import type { Parameter, Language } from './supibot-browser/command';

/** Maps parameter type names to types. */
type ParameterTypeMapping = {
	string: string;
	number: number;
	boolean: boolean;
	date: Date;
	object: object;
	regex: RegExp;
	language: Language;
};

/**
 * The parameters object which contains the parsed parameter values.
 */
type ParametersObject<ParametersDefinition extends Record<string, Parameter.Type>> = {
	[k in keyof ParametersDefinition]?: ParameterTypeMapping[ParametersDefinition[k]]
};

type p = ParametersObject<{ foo: 'string'; }>;

export type emptyObject = Record<string | number | symbol, never>;

export type AnyCommand =
	| AliasInvocation
	| PipeCommand
	| GenericSupibotCommand
	;

/**
 * Data about an alias invocation.
 */
export type AliasInvocationData = {
	/** The alias' arguments applied in context and resulting command string parsed. */
	replacedAndParsed: AnyCommand;
	/** The user the alias is attached to. Not necessarily the person who made it. */
	aliasUser: string;
	/** The name of the alias. */
	aliasName: string;
	/** The definition of the alias. */
	aliasDefinition: {
		/** The equivalent command name. */
		invocation: string;
		/** The source arguments of the alias. Including any unresolved replacements, such as `${0+}` or `${executor}` */
		arguments: string[];
	};
};

/**
 * Represents when an alias is invoked, but not other uses of the $alias command.
 *
 * Examples: `$$fish`, `$alias try brin____ fish`
 *
 * NOT: `$alias code ...`, `$alias add ...`
 */
export type AliasInvocation = GenericSupibotCommand<{
	parameters: emptyObject;
	instanceData: AliasInvocationData;
}>;

/** Data about a pipe invocation. */
export type PipeCommandData = {
	subcommands: {
		unparsed: {
			invocation: string;
			args: string[];
		};
		parsed: AnyCommand;
	}[];
};

/**
 * A pipe command.
 */
export type PipeCommand = GenericSupibotCommand<{
	parameters: {
		_force: "boolean",
		_apos: "object",
		_char: "string",
		_pos: "number",
	};
	instanceData: PipeCommandData;
}>;

/**
 * A detailed view of a supibot command.
 *
 * This data is returned by `/api/bot/command/detail/:name`.
 */
export interface SupibotCommandDetail<ParametersDefinition extends Record<string, Parameter.Type> = emptyObject> {
	/** Alternative names for the command. */
	aliases: string[];
	/** The author who created the command. Usually `'supinic'`. */
	author: string;
	/** The default cooldown for the command in milliseconds. May be overwritten on a case-by-case basis. */
	cooldown: number;
	/** The short description of the command. */
	description: string;
	/** Always null, for now. We tell the API not to give us this data. */
	dynamicDescription: null;
	/** Flags for this command. */
	flags: string[];
	/** The name of the command. */
	name: string;
	/** The parameter definition. */
	params: ParametersDefinition;
};

/**
 * A generic supibot command.
 *
 * Parsed from a command invocation string.
 */
export interface GenericSupibotCommand<CommandInfo extends {
	parameters: Record<string, Parameter.Type>,
	instanceData: unknown;
} = {
	parameters: Record<string, Parameter.Type>,
	instanceData: unknown,
}> {
	/** Static information about this command. */
	staticCommand: SupibotCommandDetail<CommandInfo["parameters"]>;
	/** Parsed data that is specific to a command. */
	instanceData: CommandInfo["instanceData"];
	/** The name used to invoke the command. */
	invocation: string;
	/** The raw text after the command name, unparsed. May include parameters. */
	rawArguments: string[];
	/** The input arguments as interpreted by supibot. */
	interpretedArguments: string[];
	/** Parameters that are present. */
	parameters: ParametersObject<CommandInfo["parameters"]>;
};

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

		}
		subcommands.push({
			unparsed: {
				invocation,
				args
			},
			parsed: invocation != "pipe" ? await parse(invocation, args) : "TODO: runtime parsing of pipes" as unknown as AnyCommand
		});
	}

	return { subcommands };
};

function parse_alias_invocation_command(cmd: Exclude<AliasInvocation, "data">): AliasInvocationData {
	return null as unknown as AliasInvocationData;
}

