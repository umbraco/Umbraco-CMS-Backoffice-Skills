/**
 * Notes Entry Point
 *
 * Runs when the Notes extension loads.
 * Configures the OpenAPI client with authentication from Umbraco's auth context.
 *
 * Skills used: umbraco-entry-point
 */

import type { UmbEntryPointOnInit, UmbEntryPointOnUnload } from "@umbraco-cms/backoffice/extension-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { client } from "../api/client.gen.js";

export const onInit: UmbEntryPointOnInit = (host, _extensionRegistry) => {
  console.log("Notes Wiki extension initialized");

  // Configure the OpenAPI client with authentication from Umbraco's auth context
  // This is required for the hey-api client to send bearer tokens with requests
  host.consumeContext(UMB_AUTH_CONTEXT, (authContext) => {
    if (!authContext) return;

    const config = authContext.getOpenApiConfiguration();

    // Configure the client with auth token resolver
    client.setConfig({
      baseUrl: config.base,
      credentials: config.credentials,
      auth: config.token,
    });

    console.log("Notes Wiki API client configured with auth");
  });
};

export const onUnload: UmbEntryPointOnUnload = (_host, _extensionRegistry) => {
  console.log("Notes Wiki extension unloaded");
};
