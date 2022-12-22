import { Interaction } from "discord.js";
import { ofetch } from "ofetch";
import { client } from "..";
import { Room } from "../def";

const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
const rooms = new Map<string, Room>();

export async function getRoom(id: string) {
  if (rooms.has(id)) return rooms.get(id)!;
  else {
    const room: Room | undefined = await ofetch(`https://api.compensationvr.tk/api/rooms/room/${id}/info`).catch(
      () => {},
    );
    if (room) rooms.set(id, room);
    return room;
  }
}

export default async function roomAutocompleteHandler() {
  // these are only popular rooms, not all of them
  const res: Room[] = await ofetch("https://api.compensationvr.tk/api/rooms/search", {
    query: { mode: "most-visited" },
  });
  res.map((r) => rooms.set(r._id, r));

  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isAutocomplete() || interaction.commandName !== "room") return;
    const focusedValue = interaction.options.getFocused();

    if (uuidRegex.test(focusedValue)) {
      const potentialRoom = await getRoom(focusedValue);
      if (potentialRoom !== undefined)
        return await interaction.respond([{ name: `${potentialRoom.name} [${focusedValue}]`, value: focusedValue }]);
    }

    await interaction.respond(
      [...rooms]
        .filter(([_, item]) => item.name.toLowerCase().includes(focusedValue.toLowerCase()))
        .slice(0, 25)
        .map(([_, item]) => ({ name: `${item.name} [${item._id}]`, value: item._id })),
    );
  });
}
