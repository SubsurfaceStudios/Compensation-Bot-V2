const {MessageEmbed, Constants} = require('discord.js');
const client = require('../index');

module.exports = {
    command: {
        name: "kickmyballs",
        description: "Opabina From Wikipedia, the free encyclopedia Opabinia regalis is an extinct, stem group arthr",
        options: []
    },
    run: async (interaction) => {
        interaction.reply({ 'content': "🎊🦶" });
    }
}