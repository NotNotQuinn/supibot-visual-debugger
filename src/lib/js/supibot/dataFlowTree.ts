import type {
	AnyCommand
} from './commandTypes';

/**
 * Represents a command in the sense of where it's output goes.
 *
 * Whenever possible, nothing is left unresolved, however
 * sometimes the command parsing can ONLY be done at run time.
 *
 * Any nested pipe which isn't the first command in a pipe is
 * an unresolved pipe, because we can't resolve which commands will run.
 *
 * In some contexts, pipes into alias are also unresolved for a similar reason,
 * we can't resolve which alias will be run.
 *
 * Example of unresolved pipe:
 * - `$pipe js importGist:... function:main() | pipe`
 * - `$pipe _char:| -- $ get_code | pipe _char:> -- ping >`
 * - `$pipe -- $ get_code | pipe _force:true --`
 *
 * Examples of unresolved aliases:
 * - `$pipe randomword | $`
 * - `$pipe randomword | alias`
 * - `$pipe randomword | alias run`
 * - `$pipe randomword | alias try brin____`
 *
 * Examples of resolved aliases:
 * - `$pipe ... | alias run foo`
 * - `$pipe ... | alias try quinndt foo`
 * - `$pipe ... | $ foo`
 */
export type DataFlowNode = {
	readonly source: AnyCommand;
	/**
	 * If there is an unresolved lexing/parsing step left to do here,
	 * then this will let us know.
	 */
	lexing_fully_resolved: boolean;
	/** String to execute, OR the start of the unresolved command string. */
	command: string;
	/**
	 * The output of this node will be piped to the next node,
	 * specified here.
	 *
	 * If null, this output will not be piped anywhere.
	 */
	next: DataFlowNode | null;
};

/************************************************ /

WAIT A HOT SEC!
PIPING ANYTHING INTO ALIAS CAUSES IT TO NEED TO BE RE-PARSED
THE INPUT ARGUMENTS CHANGE
!!!

/ ************************************************/
