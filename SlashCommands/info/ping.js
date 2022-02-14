const { Client, CommandInteraction } = require("discord.js");
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    name: "ping",
    description: "returns websocket ping",
    type: 'CHAT_INPUT',
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const GetUserBlacklisted = require('../../dbhelpers/db-helpers.js');
        if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "Command rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});

        interaction.followUp({ content: `${client.ws.ping}ms!` });
    },
};
