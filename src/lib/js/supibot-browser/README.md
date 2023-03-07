# supi-core-browser

This folder holds potentially modified copy-pasted code form
[`supi-core`](https://github.com/supinic/supi-core), and
[`supibot`](https://github.com/supinic/supibot) repositories
that is needed to parse supibot commands properly.

## Documenting source

This is needed because if in the future this project goes untouched for some time,
it is important to be able to update the copied code and perform the same modifications again.

***Less modification = better!*** If something isn't strictly needed, cut it.
Its a whole lot easier in the future to update it if we simply copy an entire function stand-alone.

Each file in this folder should start with a comment listing where the code is from,
a permalink to the commit, and what _specifically_ was changed about the code, if anything.

Example: `Command.ts`
```ts
/*
source: https://github.com/supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/classes/command.js
source: https://github.com/Supinic/supi-core/blob/c0a400a6eb64556c153db955e468e35fd7f59908/%40types/classes/command.d.ts
source: ... the more links the better

Changes:

- Merged/Converted to typescript file.
- Cherry-picked functions required (foo, bar)
	- Changes to `bar` function: none, works fine.
	- Changes to `foo` function:
		- Changed references to `node-abc` to browser equivalents.
*/
```

## License information

`supi-core` and `supibot` are licensed under AGPL.
This project is also under the same license.

* `supi-core` license: https://github.com/Supinic/supi-core/blob/master/LICENSE
* `supibot` license: https://github.com/Supinic/supibot/blob/master/LICENSE