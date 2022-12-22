import { Interaction } from "discord.js";
import { ofetch } from "ofetch";
import { client } from "..";
import { Item } from "../def";

export let items: Map<number, Item>;

export default async function itemAutocompleteHandler() {
  const res: {[index: string]: Item} = await ofetch("https://api.compensationvr.tk/api/econ/item/all");
  items = new Map<number, Item>(Object.entries(res).map(([idStr, item]) => [parseInt(idStr), item]));

  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isAutocomplete() || interaction.commandName !== "item") return;
    const focusedValue = interaction.options.getFocused();

    const potentialId = parseInt(focusedValue);
    if (!isNaN) {
      const potentialItem = items.get(potentialId);
      if (potentialItem !== undefined)
        return await interaction.respond([{ name: `${potentialItem.name} [#${potentialId}]`, value: potentialId }]);
    }

    await interaction.respond(
      [...items]
        .filter(([_, item]) => item.name.toLowerCase().includes(focusedValue.toLowerCase()))
        .slice(0, 25)
        .map(([_, item]) => ({ name: `${item.name} [#${item.id}]`, value: item.id }))
    );
  });
}
