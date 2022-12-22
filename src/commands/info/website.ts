import { Command } from "../../def";
import { createStatusEmbed } from "../../lib/embeds";

export default new Command({
  name: "website",
  description: "Get a link to our website",
  async handler(interaction) {
    // it's on fucking gh pages, why would it ever go down
    const online = await fetch("https://compensationvr.tk", {
      method: "HEAD",
    }).then((r) => r.status === 200);

    await interaction.editReply({
      embeds: [
        createStatusEmbed({
          type: online ? "success" : "error",
          title: "Compensation VR website",
          description: "You can find our website at https://compensationvr.tk",
        }),
      ],
    });
  },
});
