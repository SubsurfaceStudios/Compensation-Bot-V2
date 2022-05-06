const {MessageEmbed, Constants, Message} = require('discord.js');
const client = require('../index');

module.exports = {
    command: {
        name: "mod-applications",
        description: "Information about becoming a Compensation VR Moderator.",
        options: []
    },
    run: async (interaction) => {
        const embed = new MessageEmbed()
            .setTitle("Compensation VR Moderator Applications")
            .setDescription("Compensation VR moderators are chosen manually by the staff and development teams after they apply. Applications are not currently open, however you can check #announcements periodically for an application form.");
        
        interaction.reply({embeds: [embed], content: "Done!"});
    }
}