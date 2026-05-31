/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as campaignMembers from "../campaignMembers.js";
import type * as campaigns from "../campaigns.js";
import type * as characters from "../characters.js";
import type * as chat from "../chat.js";
import type * as decisionNodes from "../decisionNodes.js";
import type * as factionMembers from "../factionMembers.js";
import type * as factions from "../factions.js";
import type * as locations from "../locations.js";
import type * as messages from "../messages.js";
import type * as notes from "../notes.js";
import type * as trees from "../trees.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  campaignMembers: typeof campaignMembers;
  campaigns: typeof campaigns;
  characters: typeof characters;
  chat: typeof chat;
  decisionNodes: typeof decisionNodes;
  factionMembers: typeof factionMembers;
  factions: typeof factions;
  locations: typeof locations;
  messages: typeof messages;
  notes: typeof notes;
  trees: typeof trees;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
