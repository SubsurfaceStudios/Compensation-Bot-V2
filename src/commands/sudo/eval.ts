import { ref } from "@vue/reactivity";
import { ApplicationCommandOptionType, codeBlock } from "discord.js";
import { inspect, InspectOptionsStylized } from "util";
import { client } from "../..";
import { Command } from "../../def";
import { createStatusEmbed } from "../../lib/embeds";

const AsyncFunction = async function () {}.constructor;
const tokenRegex = /(mfa\.[a-z0-9_-]{20,})|([a-z0-9_-]{23,28}\.[a-z0-9_-]{6,7}\.[a-z0-9_-]{27})/i;

ref().constructor.prototype[inspect.custom] = function (depth: number, options: InspectOptionsStylized) {
  if (depth < 0) return options.stylize("[VueRef]", "special");
  const inner = inspect(this.value, {
    ...options,
    depth: options.depth ? options.depth - 1 : null,
  });
  return `${options.stylize("VueRef", "special")}<${inner}>`;
}

// taken from hut
export default new Command({
  name: "eval",
  description: "Run JS in the bot context - developer only!",
  su: true,
  noAck: true,
  options: [
    {
      name: "code",
      description: "The code to run (as a function!)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "silent",
      description: "Don't send the output to the channel",
      type: ApplicationCommandOptionType.Boolean,
    },
  ],
  async handler(interaction) {
    let code = interaction.options.getString("code", true);
    const silent = interaction.options.getBoolean("silent") ?? false;

    await interaction.deferReply({ ephemeral: silent });

    const before = Date.now();

    let took;
    let result;
    let embed;

    try {
      // somewhat adapted from kyzas implicit return
      code = code.trim();
      if (code.endsWith(";")) code = code.slice(0, -1);
      const semicolon = code.lastIndexOf(";");
      let lastExpr = "";
      if (semicolon > -1) { // multiple statements
        lastExpr = code.slice(semicolon + 1);
        code = code.slice(0, semicolon + 1);
      } else {
        lastExpr = code;
        if (lastExpr.startsWith("return ")) lastExpr = lastExpr.slice(7);
        code = "";
      }
      code = `${code}${lastExpr && `return ${lastExpr.trim()}`};`;

      result = await AsyncFunction(
        "client",
        "interaction",
        "require",
        code,
      )(client, interaction, require);
      took = Date.now() - before;

      embed = createStatusEmbed({
        type: "success",
        fields: [
          { name: "Time", value: `${took}ms`, inline: true },
          { name: "Type", value: typeof result, inline: true },
          { name: "Evaluated", value: codeBlock("js", code.substring(0, 1000)), inline: false },
        ],
      });

      if (result !== undefined) {
        embed.addFields([
          {
            name: "Result",
            value: codeBlock("ansi", inspect(result, {
              colors: true,
            }).substring(0, 1000)),
            inline: false,
          },
        ]);
      }
    } catch (error) {
      const typedError = error as Error;

      embed = createStatusEmbed({
        type: "error",
        fields: [
          { name: "Evaluated", value: codeBlock("js", code.substring(0, 1000)), inline: false },
          {
            name: "Error",
            value: codeBlock(
              "js",
              (typedError.stack || typedError.message || typedError.toString()).substring(0, 1000),
            ),
            inline: false,
          },
        ],
      });
    }

    if (!silent && tokenRegex.test(inspect(result))) {
      await interaction.editReply({
        embeds: [
          createStatusEmbed({
            type: "warn",
            description: "The evaluation result was hidden because it contains a token.",
          }),
        ],
      });
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.editReply({ embeds: [embed] });
    }
  },
});