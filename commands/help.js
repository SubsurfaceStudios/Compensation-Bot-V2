const {MessageEmbed, Constants} = require('discord.js');
const client = require('../index');

module.exports = {
    command: {
        name: "help",
        description: "Gives a list of commands for the Compensation Bot.",
        options: []
    },
    run: async (interaction) => {
        const embed = new MessageEmbed()
            .setTitle("Compensation VR Bot Help")
            .addField("/help", "This command is used to list all commands for the Compensation Bot. You just used it!")
            .addField("/test", "This command tests out a variety of features of the Compensation Bot, primarily for the bot developers.");
        interaction.reply({embeds: [embed], content: "Done!"});
    }
}