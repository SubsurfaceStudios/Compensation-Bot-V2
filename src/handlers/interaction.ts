import { ChatInputCommandInteraction, InteractionReplyOptions } from "discord.js";
import { client } from "..";
import { Command } from "../def";
import { createStatusEmbed } from "../lib/embeds";
import { logCommandError } from "../lib/errors";
import { commands } from "./command";

export const safeReply = async (
  command: Command,
  interaction: ChatInputCommandInteraction,
  reply: InteractionReplyOptions,
) => await interaction[command.noAck ? "reply" : "editReply"](reply);

export default async function interactionHandler() {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.find((i) => i.name === interaction.commandName);
    if (!command) return;

    if (!command.noAck) await interaction.deferReply({ ephemeral: command.ephemeral });

    if (command.su && !client.config.sudoers.includes(interaction.user.id))
      return void (await safeReply(command, interaction, {
        embeds: [
          createStatusEmbed({
            type: "error",
            description: `${interaction.user.username} is not in the sudoers file. This incident will be reported.`,
          }),
        ],
        ephemeral: command.ephemeral,
      }));

    try {
      await command.handler(interaction);
    } catch (error) {
      const typedError = error as Error;
      if (typedError.message.toLowerCase().includes("unknown interaction")) return;

      await logCommandError(interaction, typedError);
      await safeReply(command, interaction, {
        embeds: [
          createStatusEmbed({
            type: "error",
            description: "I ran into an error running that command! I've reported it, and it should be fixed soon.",
          }),
        ],
      });
    }
  });
}
