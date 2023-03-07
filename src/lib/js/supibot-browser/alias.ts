/*
source: https://github.com/Supinic/supibot/blob/0a1192a0a8aecd3b13a257fa71e2d10eea0528aa/commands/alias/index.js

Changes:

 - Modified to not refer to supibot specific context, but rather string arguments.
 - Changes denoted with @edited (for begin edit) and @/edited (for end edit) in comments

*/

/** Result of applying parameters for an alias. */
type ApplyParametersResult = { success: false, reply: string; } | { success: true, resultArguments: string[]; };
// https://github.com/Supinic/supibot/blob/0a1192a0a8aecd3b13a257fa71e2d10eea0528aa/commands/alias/index.js#L18
//
// @edited first 'context' argument -> split into 2 arguments
export function applyParameters(executorString: string, channelString: string | undefined, aliasArguments: string[], commandArguments: string[]): ApplyParametersResult {
	// @edited Add typings and default value
	let errorReason: string | undefined = undefined;
	// @/edited
	const resultArguments = [];
	const numberRegex = /(?<order>-?\d+)(\.\.(?<range>-?\d+))?(?<rest>\+?)/;
	const strictNumberRegex = /^[\d-.+]+$/;

	for (let i = 0; i < aliasArguments.length; i++) {
		const parsed = aliasArguments[i].replace(/\${(.+?)}/g, (total, match) => {
			const numberMatch = match.match(numberRegex);
			if (numberMatch && strictNumberRegex.test(match)) {
				let order = Number(numberMatch.groups.order);
				if (order < 0) {
					order = commandArguments.length + order;
				}

				let range = (numberMatch.groups.range) ? Number(numberMatch.groups.range) : null;
				if (typeof range === "number") {
					if (range < 0) {
						range = commandArguments.length + range + 1;
					}

					if (range < order) {
						const temp = range;
						range = order;
						order = temp;
					}
				}

				const useRest = (numberMatch.groups.rest === "+");
				if (useRest && range) {
					errorReason = `Cannot combine both the "range" (..) and "rest" (+) argument symbols!`;
					// @edited Typescript doesn't like that {undefined} is returned here.
					return '';
					// @/edited
				}
				else if (useRest) {
					return commandArguments.slice(order).join(" ");
				}
				else if (range) {
					return commandArguments.slice(order, range).join(" ");
				}
				else {
					return commandArguments[order] ?? "";
				}
			}
			else if (match === "executor") {
				// @edited Use passed value
				return executorString;
				// @/edited
			}
			else if (match === "channel") {
				// @edited Use passed value
				return channelString ?? "[private messages]";
				// @/edited
			}
			else {
				return total;
			}
		});

		if (errorReason) {
			return {
				success: false,
				reply: errorReason
			};
		}

		resultArguments.push(...parsed.split(" "));
	}

	return {
		success: true,
		resultArguments
	};
}
