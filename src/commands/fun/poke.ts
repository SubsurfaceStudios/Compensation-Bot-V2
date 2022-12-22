import { Command } from "../../def";
import { createStatusEmbed } from "../../lib/embeds";

/*
  Sources say that this is a replacement for "Opabina From Wikipedia, the free encyclopedia Opabinia regalis is an extinct, stem group arthr",
  whatever that may mean.
*/

export default new Command({
  name: "poke",
  description: "What could this possibly be...",
  noAck: true,
  async handler(interaction) {
    const embed = createStatusEmbed({
      type: "info",
      title: "Thou hast poketh the owle",
    });
    embed.setImage(`https://media.discordapp.net/attachments/804707289223004194/908718259266781205/owlpoke.gif`);
    await interaction.reply({
      embeds: [embed],
    });
  }
});
