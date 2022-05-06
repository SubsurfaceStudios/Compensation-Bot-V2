const {MessageEmbed, Constants} = require('discord.js');
const client = require('../index');

module.exports = {
    command: {
        name: "test",
        description: "Test command for the Compensation Bot.",
        options: []
    },
    run: async (interaction) => {
        interaction.reply("this is so true");
    }
}