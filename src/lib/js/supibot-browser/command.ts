/*
source: https://github.com/supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/classes/command.js
source: https://github.com/Supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/singletons/utils.js
source: https://github.com/Supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/%40types/classes/command.d.ts
source: https://github.com/Supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/%40types/globals.d.ts

Changes:

- Denoted in comments by @edited
- Merged/Converted to typescript file.
- Cherry-picked static functions required:
	- parseParametersFromArguments(...):
		- calls parseAndAppendParameter(...):
			- calls parseParameter(...):
				- calls parseRegExp(...)
				- calls languageISO.getLanguage(...):
					- uses npm module 'github:supinic/language-iso-codes';
*/

// Typings are wrong, default export is the parser class.
declare module 'language-iso-codes' {
	// i don't care that 'exports and export assignments are not permitted in module augmentations', just let me edit this.
	// @ts-ignore
	export default Parser;
}

import languageISO, { type Language } from 'language-iso-codes';
export type { Language };

// https://github.com/Supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/%40types/globals.d.ts#L12-L13
export declare type JSONifiable = null | boolean | number | string | { [P: string]: JSONifiable; } | JSONifiable[];
export declare type SimpleGenericData = Record<string, JSONifiable>;

// https://github.com/Supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/%40types/classes/command.d.ts#L37
export declare namespace Parameter {
	type Type = "string" | "number" | "boolean" | "date" | "object" | "regex" | "language";
	type ParsedType = string | number | boolean | Date | SimpleGenericData | RegExp | Language;
	type Descriptor = {
		type: Type;
		name: string;
	};
}
// https://github.com/supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/classes/command.js#L152
const ignoreParametersDelimiter = "--";

// https://github.com/supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/classes/command.js#L1024
export function parseParametersFromArguments(paramsDefinition: Parameter.Descriptor[], argsArray: string[]): {
	success: true;
	parameters: Record<string, Parameter.ParsedType>;
	args: string[];
} | {
	success: false;
	reply?: string;
} {
	const argsStr = argsArray.join(" ");
	const outputArguments = [];
	let parameters = {};

	// Buffer used to store read characters before we know what to do with them
	let buffer = "";
	/** Parameter definition of the current parameter @type {typeof paramsDefinition[0] | null} */
	let currentParam: typeof paramsDefinition[0] | null = null;
	// is true if currently reading inside of a parameter
	let insideParam = false;
	// is true if the current param started using quotes
	let quotedParam = false;

	for (let i = 0; i < argsStr.length; i++) {
		const char = argsStr[i];
		buffer += char;

		if (!insideParam) {
			if (buffer.slice(0, -1) === ignoreParametersDelimiter && char === " ") {
				// Delimiter means all arguments after this point will be ignored, and just passed as-is
				outputArguments.push(...argsStr.slice(i + 1).split(" "));
				return {
					success: true,
					parameters,
					args: outputArguments
				};
			}

			if (char === ":") {
				currentParam = paramsDefinition.find(i => i.name === buffer.slice(0, -1)) ?? null;
				if (currentParam) {
					insideParam = true;
					buffer = "";
					if (argsStr[i + 1] === "\"") {
						i++;
						quotedParam = true;
					}
				}
			}
			else if (char === " ") {
				const sliced = buffer.slice(0, -1);
				if (sliced.length > 0) {
					outputArguments.push(sliced);
				}
				buffer = "";
			}
		}

		if (insideParam) {
			if (!quotedParam && char === " ") {
				// end of unquoted param
				const value = parseAndAppendParameter(buffer.slice(0, -1), currentParam!, quotedParam, parameters);
				if (!value.success) {
					return value as any;
				}
				buffer = "";
				parameters = value.newParameters;
				insideParam = false;
				quotedParam = false;
				currentParam = null;
			}

			if (quotedParam && char === "\"") {
				if (buffer.at(-2) === "\\") {
					// remove the backslash, and add quote
					buffer = `${buffer.slice(0, -2)}"`;
				}
				else {
					// end of quoted param
					const value = parseAndAppendParameter(buffer.slice(0, -1), currentParam!, quotedParam, parameters);
					if (!value.success) {
						return value as any;
					}
					buffer = "";
					parameters = value.newParameters;
					insideParam = false;
					quotedParam = false;
					currentParam = null;
				}
			}
		}
	}

	// Handle the buffer after all characters are read
	if (insideParam) {
		if (quotedParam) {
			return {
				success: false,
				reply: `Unclosed quoted parameter "${currentParam!.name}"!`
			};
		}
		else {
			const value = parseAndAppendParameter(buffer, currentParam!, quotedParam, parameters);
			if (!value.success) {
				return value as any;
			}
			parameters = value.newParameters;
		}
	}
	else if (buffer !== "" && buffer !== ignoreParametersDelimiter) {
		// Ignore the last parameter if its the delimiter
		outputArguments.push(buffer);
	}

	return {
		success: true,
		parameters,
		args: outputArguments
	};
}

// https://github.com/supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/classes/command.js#LL994
function parseAndAppendParameter(value: string, parameterDefinition: Parameter.Descriptor, explicit: boolean, existingParameters: any) {
	const parameters = { ...existingParameters };
	const parsedValue = parseParameter(value, parameterDefinition.type, explicit);
	if (parsedValue === null) {
		return {
			success: false,
			reply: `Could not parse parameter "${parameterDefinition.name}"!`
		};
	}
	else if (parameterDefinition.type === "object") {
		// @edited
		let { key: parsedValue_key, value: parsedValue_value } = (parsedValue as { key: string; value: string; });

		if (typeof parameters[parameterDefinition.name] === "undefined") {
			parameters[parameterDefinition.name] = {};
		}

		if (typeof parameters[parameterDefinition.name][parsedValue_key] !== "undefined") {
			return {
				success: false,
				reply: `Cannot use multiple values for parameter "${parameterDefinition.name}", key ${parsedValue_key}!`
			};
		}

		parameters[parameterDefinition.name][parsedValue_key] = parsedValue_value;
		// @/edited
	}
	else {
		parameters[parameterDefinition.name] = parsedValue;
	}

	return { success: true, newParameters: parameters };
}



function parseParameter(value: string, type: Parameter.Type, explicit: boolean) {
	// Empty implicit string value is always invalid, since that is written as `$command param:` which is a typo/mistake
	if (type === "string" && explicit === false && value === "") {
		return null;
	}
	// Non-string parameters are also always invalid with empty string value, regardless of implicitness
	else if (type !== "string" && value === "") {
		return null;
	}

	if (type === "string") {
		return String(value);
	}
	else if (type === "number") {
		const output = Number(value);
		if (!Number.isFinite(output)) {
			return null;
		}

		return output;
	}
	else if (type === "boolean") {
		if (value === "true") {
			return true;
		}
		else if (value === "false") {
			return false;
		}
	}
	else if (type === "date") {
		const date = new Date(value);
		if (Number.isNaN(date.valueOf())) {
			return null;
		}

		return date;
	}
	else if (type === "object") {
		const [key, outputValue] = value.split("=");
		return { key, value: outputValue };
	}
	else if (type === "regex") {
		return parseRegExp(value);
	}
	else if (type === "language") {
		return languageISO.getLanguage(value);
	}

	return null;
}

// https://github.com/Supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/singletons/utils.js#L1663
/**
 * Creates a regular expression based on a provided string input.
 * @param {string} value
 * @returns {RegExp|null} Returns `null` if the regex creation fails with an error
 */
function parseRegExp(value: string): RegExp | null {
	const string = value.replace(/^\/|\/$/g, "");

	// find last possible forward slash that is not escaped with a backslash
	// this determines the forceful end of a regex, which is then followed by flag characters
	// Regex: find the slash not preceded by backslashes, that is also not ultimately followed by another slash
	const lastSlashIndex = string.match(/(?<!\\)(\/)(?!.*\/)/)?.index ?? -1;

	const regexBody = (lastSlashIndex !== -1) ? string.slice(0, lastSlashIndex) : string;
	const flags = (lastSlashIndex !== -1) ? string.slice(lastSlashIndex + 1) : "";

	let regex;
	try {
		regex = new RegExp(regexBody, flags);
	}
	catch (e) {
		return null;
	}

	return regex;
}
