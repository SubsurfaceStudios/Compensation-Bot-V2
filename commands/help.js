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
            .addField("/test", "This command tests out a variety of features of the Compensation Bot, primarily for the bot developers.")
            .addField("/item", "Fetches information about a CVR in-game item from the servers. Please note this uses the item ID not the item name.")
            .addField("/user", "Returns information about a user from their username.")
            .addField("/room-search", "Searches for a list of rooms by name. Maximum number of results is 5.")
            .addField("/staff-applications", "Posts information about becoming staff.")
            .addField("/mod-applications", "Posts information about becoming a CVR moderator.")
            .addField("/room", "Returns information about a room from it's ID.")
            .addField("/website", "Returns a link to the Compensation VR website. Use `status:true` to display whether the site is online or not.")
            .addField("/analytics", "Returns analytical information about the Compensation VR servers.");
        interaction.reply({embeds: [embed], content: "Done!"});
    }
}