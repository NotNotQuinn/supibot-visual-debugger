import type { MessagePart } from '$lib/message';
/**
 * Represents a textual part of a message.
 *
 * That is to say, this part of the message is purely textual.
 */
export type TextualMessagePart = {
	/** The text of the message. */
	message: string;
	/** The style of notice, if any. A value of `undefined` is identical to setting to `"none"`. */
	notice?: "error" | "warning" | "info" | "success" | "notice" | "none";
	/** An emphasized notice has a large coloured border. */
	emphasis?: boolean;
	/** Use this string in place of the notice name. */
	noticeLabel?: string;
} | TextualMessagePart_HTML_UNCHECKED;

/** Represents raw HTML injection, :) a classic. */
export type TextualMessagePart_HTML_UNCHECKED = {
	/** HTML message text. */
	HTML_UNCHECKED: string;
};

export function isTextualMessage(part: MessagePart): part is TextualMessagePart {
	return typeof part === "object" && (
		typeof (part as any)?.message === "string"
		|| isTextualMessage_HTML_UNCHECKED(part)
	);
}

export function isTextualMessage_HTML_UNCHECKED(part: MessagePart): part is TextualMessagePart_HTML_UNCHECKED {
	return typeof part === "object" && typeof (part as any)?.HTML_UNCHECKED === "string";
};
