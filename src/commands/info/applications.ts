import { Command } from "../../def";
import { createStatusEmbed } from "../../lib/embeds";

export default new Command({
  name: "applications",
  description: "Want to become a CVR staff member? Here's how!",
  noAck: true,
  handler: async (interaction) =>
    void interaction.reply({
      embeds: [
        createStatusEmbed({
          type: "info",
          fields: [
            {
              name: "Staff",
              value:
                "Compensation VR staff are hand-picked by the developers of Compensation VR and applications are not currently available. If you'd like to become staff, we'd recommend engaging yourself in the community and showing your skills in <#813037526981017600> and <#854539284144586752>, within reason.",
              inline: false,
            },
            {
              name: "Moderators",
              value:
                "Compensation VR moderators are chosen manually by the staff and development teams after they apply. Applications are not currently open, however you can check <#814646019588751421> periodically for an application form.",
              inline: false,
            },
          ],
        }),
      ],
    }),
});
