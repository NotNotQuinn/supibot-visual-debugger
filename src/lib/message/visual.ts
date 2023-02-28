import type { MessagePart } from '$lib/message';

/**
 * Represents a visual part of a message.
 *
 * That is to say, this part of the message is purely visual.
 *
 * All possible values here start with `"visual:"` to distinguish them from possible future message parts.
 */
export type VisualMessagePart = NonNullable<typeof ValidVisualMessageParts[number]>;

/** All valid VisualMessagePart values. */
export const ValidVisualMessageParts = [
	// solid-horizontal-line
	"visual:solid-horizontal-line",
	"visual:solid-horizontal-line wide",
	// dotted-horizontal-line
	"visual:dotted-horizontal-line",
	"visual:dotted-horizontal-line wide",
	// dashed-horizontal-line
	"visual:dashed-horizontal-line",
	"visual:dashed-horizontal-line wide",
] as const;

export function isVisualMessage(part: MessagePart): part is VisualMessagePart {
	return typeof part == "string" && ValidVisualMessageParts.includes(part);
}
