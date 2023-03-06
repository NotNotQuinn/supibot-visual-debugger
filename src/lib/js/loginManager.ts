import { browser } from '$app/environment';

/** Private details used to authorize ourselves with the supinic.com API. */
type AuthorizationDetails = {
	/** Supibot user ID */
	userid: string;
	/** API key. */
	api_key: string;
	/** Is there even a user here??? */
	logged_in: boolean;
	/** Username within supibot. */
	username: string;
};

const default_credentials: AuthorizationDetails = {
	api_key: '',
	username: '',
	userid: '',
	logged_in: false,
};

/**
 * Reports if the user is logged in.
 */
export function isLoggedIn(): boolean {
	let auth = loadAuth();
	return auth.logged_in;
}

/**
 * Returns empty strings if not logged in.
 */
export function fetch_user(): { userid: string, username: string; } {
	let auth = loadAuth();
	return { userid: auth.userid, username: auth.username };
};

/**
 * Performs "authed" fetch requests to `https://supinic.com/api/*`.
 * `User-Agent` and `Authorization` headers will be overwritten.
 *
 * @throws If user is not logged in.
 * @throws If not using HTTPS.
 * @throws If the URL does not begin with `https://supinic.com/api/`
 *
 * @param input The URL to request.
 * @param init Equivalent to fetch's second parameter.
 * @returns The fetch Response object.
 */
export function authed_fetch(input: string, init?: RequestInit): Promise<Response> {
	let auth = loadAuth();
	return internal_authed_fetch(auth, input, init);
}

/**
 * Attempts to login to the supinic.com API. Reports true/false.
 *
 * @throws If supinic.com responds with a 5xx status code.
 *
 * @param auth Authorization details to provide to the supinic.com API.
 * @returns true if the user is now logged in, false if the auth details aren't valid.
 */
export async function tryLogin(supibot_user_id: string, supinic_com_api_key: string): Promise<boolean> {
	let auth: AuthorizationDetails = {
		api_key: supinic_com_api_key,
		username: '',
		userid: supibot_user_id,
		logged_in: true,
	};

	// Check credentials
	let testAuthResp = await internal_authed_fetch(auth, 'https://supinic.com/api/test/auth');

	// 5xx
	if (500 <= testAuthResp.status && testAuthResp.status <= 599)
		throw new Error(`Could not verify authorization: HTTP ${testAuthResp.status}: ${testAuthResp.statusText}`, { cause: testAuthResp });

	// non 2xx; likely 401: Unauthorized
	if (!testAuthResp.ok)
		return false;

	// Successfully logged in!

	// Resolve username for display.
	let resolveUserResp = await fetch(`https://supinic.com/api/bot/user/resolve/ID/${encodeURIComponent(auth.userid)}`);
	if (resolveUserResp.status !== 200)
		throw new Error(`Could not fetch username: HTTP ${resolveUserResp.status}: ${resolveUserResp.statusText}`);

	auth.username = (await resolveUserResp.json()).data.name;

	storeAuth(auth);
	return true;
};

/**
 * Deletes auth data from `localStorage`, effectively logging out.
 */
export async function logout() {
	browser && localStorage.removeItem('supinic_com_api_authorization_details');
};

/** Loads auth. Returns data as empty strings if not logged in. */
function loadAuth(): AuthorizationDetails {
	if (!browser) return default_credentials;
	return JSON.parse(
		localStorage.getItem('supinic_com_api_authorization_details') ?? '""'
	) || default_credentials;
}

/** Stores auth. Will clobber. */
function storeAuth(auth: AuthorizationDetails) {
	browser && localStorage.setItem('supinic_com_api_authorization_details', JSON.stringify(auth));
}

/**
 * Equivalent to `authed_fetch` (which is equivalent to `fetch`) except allows explicitly setting auth details.
 */
async function internal_authed_fetch(auth: AuthorizationDetails, input: string, init?: RequestInit): Promise<Response> {
	if (!auth.logged_in)
		throw new Error('Cannot perform authed fetch: not logged in');

	let url = new URL(input);

	if (url.origin !== "https://supinic.com")
		throw new Error(`Cannot perform authed fetch: only "https://supinic.com" is allowed: ${url.origin}`);

	url.searchParams.set('auth_user', auth.userid);
	url.searchParams.set('auth_key', auth.api_key);

	// CORS doesn't allow User-Agent OR Authorization headers.
	// Possibly ask supinic to add user-agent to access-control-allow-headers,
	// however the authorization one isn't possible.
	// Must use access-control-allow-credentials
	// and that doesn't allow '*' as an allowed origin. :(
	return fetch(url, init);
}
