/**
 * Playwright globalSetup for mocked-backoffice suites.
 * Injects external-example support into the client at $UMBRACO_CLIENT_PATH before the dev
 * server starts. No-ops if the client already supports it. Paired with global-teardown.mjs.
 */
import { applyExternalExampleSupport } from './patch-client.mjs';

export default async function globalSetup() {
	applyExternalExampleSupport(process.env.UMBRACO_CLIENT_PATH);
}
