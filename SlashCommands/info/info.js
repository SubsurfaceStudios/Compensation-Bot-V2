const { Client, CommandInteraction } = require("discord.js");

module.exports = {
    name: "info",
    description: "Gives information about the bot.",
    type: 'CHAT_INPUT',
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        interaction.followUp({ content: "The Leviathan Corporation Discord bot is a multi-function discord bot designed for management of the LC discord. It is written in discord.js v13 and is optimized to work with Slash Commands for an optimal user experience."});
    },
};
