/**
 * Playwright globalTeardown for mocked-backoffice suites.
 * Reverts the external-example support injected by global-setup.mjs, restoring the client
 * source from backups. No-ops if this harness didn't patch (e.g. client already supported it).
 */
import { revertExternalExampleSupport } from './patch-client.mjs';

export default async function globalTeardown() {
	revertExternalExampleSupport(process.env.UMBRACO_CLIENT_PATH);
}
