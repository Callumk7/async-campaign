import { defineSchema } from "convex/server";

import { campaignMembersSchema } from "./schemas/campaignMembers";
import { campaignSchema } from "./schemas/campaigns";
import { charactersSchema } from "./schemas/characters";
import {
	decisionNodesSchema,
	decisionOptionAvailabilitiesSchema,
	decisionOptionsSchema,
	decisionOptionSelectionsSchema,
	decisionTreesSchema,
} from "./schemas/decisions";
import { messagesSchema } from "./schemas/messages";
import { notesSchema } from "./schemas/notes";
import { roomsSchema } from "./schemas/rooms";
import { usersSchema } from "./schemas/users";
import { factionMembersSchema, factionsSchema, locationsSchema } from "./schemas/world";

export default defineSchema({
	messages: messagesSchema,
	rooms: roomsSchema,
	users: usersSchema,
	campaigns: campaignSchema,
	campaignMembers: campaignMembersSchema,
	decisionNodes: decisionNodesSchema,
	decisionOptions: decisionOptionsSchema,
	decisionOptionAvailabilities: decisionOptionAvailabilitiesSchema,
	decisionOptionSelections: decisionOptionSelectionsSchema,
	decisionTrees: decisionTreesSchema,
	characters: charactersSchema,
	factions: factionsSchema,
	factionMembers: factionMembersSchema,
	notes: notesSchema,
	locations: locationsSchema,
});
