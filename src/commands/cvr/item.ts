import { ApplicationCommandOptionType, EmbedField, inlineCode } from "discord.js";
import { Command } from "../../def";
import { items } from "../../handlers/item";
import { createStatusEmbed } from "../../lib/embeds";

export default new Command({
  name: "item",
  description: "Display information about a given item",
  options: [
    {
      name: "item",
      description: "The item to get info for",
      type: ApplicationCommandOptionType.Integer,
      autocomplete: true,
      required: true,
    },
  ],
  async handler(interaction) {
    const id = interaction.options.getInteger("item", true);
    const item = items.get(id);

    if (!item)
      return void (await interaction.editReply({
        embeds: [
          createStatusEmbed({
            type: "error",
            description: "That item does not exist",
          }),
        ],
      }));

    const fields: EmbedField[] = [
      { name: "UUID", value: inlineCode(item.clothing_item_uuid), inline: false },
      { name: "Slot", value: inlineCode(item.use_slot), inline: false },
      { name: "Transferrable", value: item.is_transferrable ? "Yes" : "No", inline: true },
      { name: "Listed in store", value: item.listed_in_store ? "Yes" : "No", inline: true },
      { name: "\u200B", value: "\u200B", inline: true }, // kill yourself discord
    ];

    if (item.buy_price !== 0)
      fields.push({ name: "Buy price", value: "" + item.buy_price, inline: true });
    if (item.refund_price !== 0)
      fields.push({ name: "Refund price", value: "" + item.refund_price, inline: true });
    if (item.gift_price !== 0)
      fields.push({ name: "Gift price", value: "" + item.gift_price, inline: true });

    fields.push({ name: "Rarity", value: `${item.rarity}/5`, inline: false });

    const embed = createStatusEmbed({
      type: "success",
      title: item.name + ` [#${item.id}]`,
      fields,
      footer: {
        text: `Tags: ${item.tags.join(", ")}`,
      },
    });

    await interaction.editReply({ embeds: [embed] });
  },
});
