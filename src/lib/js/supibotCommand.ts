export type ParameterType = "string" | "number" | "boolean" | "object";

type ParameterTypeMapping = {
	string: string;
	number: number;
	boolean: boolean;
	object: any;
};

/**
 * The parameters object which contains the parsed parameter values.
 */
type ParametersObject<ParametersDefinition extends Record<string, ParameterType>> = {
	[k in keyof ParametersDefinition]?: ParameterTypeMapping[ParametersDefinition[k]]
};

/**
 * Static information about a command.
 *
 * This data is returned by `/api/bot/command/list`.
 */
export type StaticSupibotCommand = {
	name: string;
	aliases: string[];
	description: string;
	cooldown: number;
	flags: string[];
};

export type AnyCommand = SupibotCommand<any, any>;
export type PipeCommand = SupibotCommand<PipeCommandParametersDefinition, PipeCommandInstanceData>;

export type PipeCommandParametersDefinition = {
	_apos: "object",
	_char: "string",
	_force: "boolean",
	_pos: "number",
};

export type PipeCommandInstanceData = {
	subcommands: AnyCommand[];
};

/**
 * A detailed view of a supibot command.
 *
 * This data is returned by `/api/bot/command/detail/:name`.
 */
export type StaticSupibotCommandDetail<ParametersDefinition extends Record<string, ParameterType> = Record<string, never>> = StaticSupibotCommand & {
	/** The parameter definition. */
	params: ParametersDefinition;
	/** The author who created the command. Usually 'supinic'. */
	author: string;
	/** Always null, for now. We tell the API not to give us this data. */
	dynamicDescription: null;
};

/** A generic supibot command. */
export type SupibotCommand<ParametersDefinition extends Record<string, ParameterType> = Record<string, never>, CommandSpecificData = null> = {
	/** The name used to invoke the command. */
	invocation: string;
	/** Static information about this command. */
	staticCommand: StaticSupibotCommandDetail<ParametersDefinition>;
	/** The raw text after the command name, unparsed. May include parameters. */
	rawArguments: string[];
	/** The input arguments as interpreted by supibot. */
	interpretedArguments: string[];
	/** Parameters that are present. */
	parameters: ParametersObject<ParametersDefinition>;
	/** Parsed data that is specific to a command. */
	commandSpecificData: CommandSpecificData;
};

/**
 * Parses a supibot command into a javascript object.
 * @param command Command string with prefix.
 */
export function parse(command: string): AnyCommand {
	// basic data format
	let cmd: SupibotCommand<{ dank: "boolean"; }, null> = {
		staticCommand: {
			aliases: ["bar"],
			author: "no one",
			cooldown: 1000,
			description: "nothing",
			dynamicDescription: null,
			flags: [],
			name: "foo",
			params: { dank: "boolean" }
		},
		invocation: "bar",
		rawArguments: [],
		interpretedArguments: [],
		parameters: { dank: true },
		commandSpecificData: null
	};

	return cmd;
}
