import type { MessagePart } from '$lib/message';

/**
 * Logs a message to the Debug Console.
 *
 * @param beginMessage If true, creates a new Message.
 * @param parts The data to log. Shown in array order.
 */
export type logMessagePartsFn = (beginMessage: boolean, ...parts: MessagePart[]) => void;

/**
 * Used as a unique key to get the logging function, in some contexts.
 */
export const logSymbol = Symbol("logMessageParts");
