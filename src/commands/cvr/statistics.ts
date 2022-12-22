import { ofetch } from "ofetch";
import { Command } from "../../def";
import { createStatusEmbed } from "../../lib/embeds";

// extracted and adapted from hut
export default new Command({
  name: "statistics",
  description: "Display statistics",
  async handler(interaction) {
    const statistics = await Promise.all(
      ["account", "online", "instance"].map((s) => ofetch(`https://api.compensationvr.tk/api/analytics/${s}-count`)),
    ).catch(() => {});
    let embed;

    if (statistics) {
      const [accounts, online, instances] = statistics;

      embed = createStatusEmbed({
        type: "success",
        title: "Compensation VR statistics",
        description: [`**Accounts:** ${accounts}`, `**Online:** ${online}`, `**Instances:** ${instances}`].join("\n"),
        color: "Green",
      });
    } else {
      embed = createStatusEmbed({
        type: "error",
        description: "Could not connect to the CompensationVR API, try again later.",
      });
    }

    await interaction.editReply({ embeds: [embed] });
  },
});
