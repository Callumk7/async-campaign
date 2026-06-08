import { BoardPanel } from "~/components/boards/board-panel";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Doc } from "../../../convex/_generated/dataModel";

export type CampaignMessageBoardProps = {
	boards: Doc<"boards">[];
};

export function CampaignMessageBoard({ boards }: CampaignMessageBoardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Message Board</CardTitle>
				<CardDescription>Discuss the campaign here.</CardDescription>
			</CardHeader>
			<CardContent>
				{boards.length > 0 ? (
					<Tabs defaultValue={boards[0]?._id}>
						<TabsList className="mb-4 flex h-auto flex-wrap justify-start">
							{boards.map((board) => (
								<TabsTrigger key={board._id} value={board._id}>
									{board.name}
								</TabsTrigger>
							))}
						</TabsList>
						{boards.map((board) => (
							<TabsContent key={board._id} value={board._id}>
								<BoardPanel board={board} />
							</TabsContent>
						))}
					</Tabs>
				) : (
					<div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
						No boards have been created for this campaign yet.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
