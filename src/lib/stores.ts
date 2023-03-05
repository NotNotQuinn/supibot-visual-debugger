import { type Readable, writable } from "svelte/store";

/**
 * Used only to bind the supibot command to the input.
 * Use `supibotCommand` instead, for almost all cases.
 */
export const _supibotCommandWritable = writable<string>('');

/**
 * Stores the current supibot command text - raw from the input.
 */
export const supibotCommand: Readable<string> = {
	subscribe: _supibotCommandWritable.subscribe,
};
