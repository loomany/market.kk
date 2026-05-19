/**
 * Registers the local `@/` path-alias resolver for `node --experimental-strip-types`.
 *
 * Used via `node --import=./scripts/lib/registerTsAlias.mjs ...` from test scripts
 * whose dependency chain imports `@/lib/...` modules.
 */
import { register } from "node:module";

register("./tsAliasHook.mjs", import.meta.url);
