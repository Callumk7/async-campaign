import { defineSchema } from "convex/server";

import { campaignMembersSchema } from "./schemas/campaignMembers";
import { boardPostSchema, campaignDiscussionBoardSchema, campaignSchema } from "./schemas/campaigns";
import { characterResourcesSchema, charactersSchema } from "./schemas/characters";
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
import { questsSchema } from "./schemas/quests";

export default defineSchema({
	messages: messagesSchema,
	rooms: roomsSchema,
	users: usersSchema,
	campaigns: campaignSchema,
	boards: campaignDiscussionBoardSchema,
	boardPosts: boardPostSchema,
	campaignMembers: campaignMembersSchema,
	decisionNodes: decisionNodesSchema,
	decisionOptions: decisionOptionsSchema,
	decisionOptionAvailabilities: decisionOptionAvailabilitiesSchema,
	decisionOptionSelections: decisionOptionSelectionsSchema,
	decisionTrees: decisionTreesSchema,
	characters: charactersSchema,
	characterResources: characterResourcesSchema,
	factions: factionsSchema,
	factionMembers: factionMembersSchema,
	notes: notesSchema,
	locations: locationsSchema,
	quests: questsSchema
});
