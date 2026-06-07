/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as boards from "../boards.js";
import type * as campaignMembers from "../campaignMembers.js";
import type * as campaigns from "../campaigns.js";
import type * as characters from "../characters.js";
import type * as decisionNodes from "../decisionNodes.js";
import type * as decisionOptions from "../decisionOptions.js";
import type * as factionMembers from "../factionMembers.js";
import type * as factions from "../factions.js";
import type * as lib_boards from "../lib/boards.js";
import type * as lib_rooms from "../lib/rooms.js";
import type * as locations from "../locations.js";
import type * as messages from "../messages.js";
import type * as notes from "../notes.js";
import type * as rooms from "../rooms.js";
import type * as schemas_campaignMembers from "../schemas/campaignMembers.js";
import type * as schemas_campaigns from "../schemas/campaigns.js";
import type * as schemas_characters from "../schemas/characters.js";
import type * as schemas_decisions from "../schemas/decisions.js";
import type * as schemas_messages from "../schemas/messages.js";
import type * as schemas_notes from "../schemas/notes.js";
import type * as schemas_quests from "../schemas/quests.js";
import type * as schemas_rooms from "../schemas/rooms.js";
import type * as schemas_users from "../schemas/users.js";
import type * as schemas_validators from "../schemas/validators.js";
import type * as schemas_world from "../schemas/world.js";
import type * as trees from "../trees.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  boards: typeof boards;
  campaignMembers: typeof campaignMembers;
  campaigns: typeof campaigns;
  characters: typeof characters;
  decisionNodes: typeof decisionNodes;
  decisionOptions: typeof decisionOptions;
  factionMembers: typeof factionMembers;
  factions: typeof factions;
  "lib/boards": typeof lib_boards;
  "lib/rooms": typeof lib_rooms;
  locations: typeof locations;
  messages: typeof messages;
  notes: typeof notes;
  rooms: typeof rooms;
  "schemas/campaignMembers": typeof schemas_campaignMembers;
  "schemas/campaigns": typeof schemas_campaigns;
  "schemas/characters": typeof schemas_characters;
  "schemas/decisions": typeof schemas_decisions;
  "schemas/messages": typeof schemas_messages;
  "schemas/notes": typeof schemas_notes;
  "schemas/quests": typeof schemas_quests;
  "schemas/rooms": typeof schemas_rooms;
  "schemas/users": typeof schemas_users;
  "schemas/validators": typeof schemas_validators;
  "schemas/world": typeof schemas_world;
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
