import type { TextualMessagePart } from '$lib/message/textual.js';
import type { VisualMessagePart } from '$lib/message/visual.js';

/**
 * Represents a single part of a message.
 *
 * Messages are made up of a series of parts, and rendered in order.
 */
export type MessagePart =
	| TextualMessagePart
	| VisualMessagePart
	// | CommandMessagePart
	;
