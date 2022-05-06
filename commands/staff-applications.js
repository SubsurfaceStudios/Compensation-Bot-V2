const {MessageEmbed, Constants} = require('discord.js');
const client = require('../index');

module.exports = {
    command: {
        name: "staff-applications",
        description: "Information about becoming a Compensation VR Staff Member.",
        options: []
    },
    run: async (interaction) => {
        const embed = new MessageEmbed()
            .setTitle("Compensation VR Staff Selection")
            .setDescription("Compensation VR Staff are hand-picked by the Developers of Compensation VR, and applications are not currently available. If you want to become staff, we'd recommend engaging yourself in the community and showing your skills in #offtopic and #self-promo, within reason.");
        
        interaction.reply({embeds: [embed], content: "Done!"});
    }
}