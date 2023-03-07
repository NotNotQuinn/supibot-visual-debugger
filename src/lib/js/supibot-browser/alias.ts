/*
source: https://github.com/Supinic/supibot/blob/master/commands/alias/index.js

Changes:

 - Modified to not refer to supibot specific context, but rather string arguments.
 - Changes denoted with @edited in comments

*/

// https://github.com/Supinic/supibot/blob/master/commands/alias/index.js#L18
//
// @edited first 'context' argument -> split into two string arguments
export function applyParameters(executorString: string, channelString: string | undefined, aliasArguments: string[], commandArguments: string[]) {
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
					// @edited
					throw new Error('Cannot combine both the "range" and "rest" argument identifiers!');
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
				// @edited
				return executorString;
			}
			else if (match === "channel") {
				// @edited
				return channelString ?? "[private messages]";
			}
			else {
				return total;
			}
		});

		resultArguments.push(...parsed.split(" "));
	}

	// @edited doesn't return object anymore
	return resultArguments;
}
