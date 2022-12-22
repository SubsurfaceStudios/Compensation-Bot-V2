import { ApplicationCommandOptionType, EmbedField, inlineCode } from "discord.js";
import { Command } from "../../def";
import { getRoom } from "../../handlers/room";
import { getUser } from "../../handlers/user";
import { createStatusEmbed } from "../../lib/embeds";

export default new Command({
  name: "room",
  description: "Display information about a given room",
  options: [
    {
      name: "room",
      description: "The room to get info for",
      type: ApplicationCommandOptionType.String,
      autocomplete: true,
      required: true,
    },
  ],
  async handler(interaction) {
    const id = interaction.options.getString("room", true);
    const room = await getRoom(id);

    if (!room)
      return void await interaction.editReply({
        embeds: [createStatusEmbed({
          type: "error",
          description: "That room does not exist",
        })],
      });

    const creator = await getUser(parseInt(room.creator_id));

    const embed = createStatusEmbed({
      type: "success",
      title: `${creator ? creator.username + "/" : ""}${room.name}`,
      description: room.description,
      footer: {
        text: `ID: ${room._id}`,
      },
    });

    embed.setThumbnail(`https://api.compensationvr.tk/img/${room.cover_image_id}`);

    await interaction.editReply({ embeds: [embed] });
  }
});
