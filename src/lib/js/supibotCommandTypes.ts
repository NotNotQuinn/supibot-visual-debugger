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
export type ParametersObject<ParametersDefinition extends Record<string, Parameter.Type>> = {
	[k in keyof ParametersDefinition]?: ParameterTypeMapping[ParametersDefinition[k]]
};

export type emptyObject = Record<string | number | symbol, never>;

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
 * Any supibot command.
 */
export type AnyCommand =
	| AliasInvocation
	| PipeCommand
	| GenericSupibotCommand
	;

/** Describes a bare-bones command. */
export type BasicCommandDescriptor = {
	/** The command invoked. */
	invocation: string;
	/** The arguments passed to the command. */
	arguments: string[];
};

/**
 * Data about an alias invocation.
 */
export type AliasInvocationData = {
	/** A command equivalent to the alias invocation. */
	commandEquivalent: {
		/** Textual command equivalent. */
		unparsed: BasicCommandDescriptor;
		/** Parsed command equivalent. */
		parsed: AnyCommand;
	};
	/** The user the alias is attached to. Not necessarily the person who made it. */
	aliasUser: string;
	/** The name of the alias. */
	aliasName: string;
	/** Arguments input to the alias. Ex: `"foo bar"` in `"$$fish foo bar"` */
	aliasInput: string[];
	/** The definition of the alias. Includes any alias 'parameters' aka replacements. Ex: "abb say ${0+}" */
	aliasDefinition: BasicCommandDescriptor;
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
	subcommands: ({
		unparsed: {
			invocation: string;
			args: string[];
		};
		parsed: AnyCommand;
	} | {
		unparsed: {
			invocation: "pipe";
			args: string[];
		},
		parsed: null;
	})[];
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
