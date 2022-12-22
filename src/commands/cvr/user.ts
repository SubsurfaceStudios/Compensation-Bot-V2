import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../def";
import { getUser } from "../../handlers/user";
import { createStatusEmbed } from "../../lib/embeds";

// extracted and adapted from hut
export default new Command({
  name: "user",
  description: "Display information about a given user",
  options: [
    {
      name: "user",
      description: "The user to get info for",
      type: ApplicationCommandOptionType.Integer,
      autocomplete: true,
      required: true,
    },
  ],
  async handler(interaction) {
    const id = interaction.options.getInteger("user", true);
    const user = await getUser(id);

    if (!user)
      return void await interaction.editReply({
        embeds: [createStatusEmbed({
          type: "error",
          description: "That user does not exist",
        })],
      });

    const fields = [];

    if (user.tag) fields.push({ name: "Tag", value: user.tag, inline: true });
    if (user.pronouns) fields.push({ name: "Pronouns", value: user.pronouns, inline: true });

    const embed = createStatusEmbed({
      type: "success",
      title: `${user.nickname} - @${user.username}`,
      description: user.bio,
      fields,
      footer: {
        text: `ID: ${id}`,
      },
      color: "Blurple",
    });

    embed.setThumbnail(`https://api.compensationvr.tk/img/${user.profile_picture_id}`);

    await interaction.editReply({ embeds: [embed] });
  }
});
