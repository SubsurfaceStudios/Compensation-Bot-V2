require('dotenv').config();
const {Client, Intents} = require('discord.js');
const fs = require('node:fs');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.DIRECT_MESSAGES], partials: ["CHANNEL"]});

client.once('ready', () => {
    console.log("ready");
    const commands = fs.readdirSync('./commands').map(item => require(`./commands/${item}`).command);

    const debug_server = client.guilds.cache.get(process.env.SERVER_ID);
    if(typeof debug_server == 'undefined') {
        client.application.commands.set(commands);
    } else {
        debug_server.commands.set(commands);
    }

    console.log("commands set");
});

client.on('interactionCreate', async (interaction) => {
    if(interaction.isCommand()) {
        return require(`./commands/${interaction.commandName}`).run(interaction);
    }
});

module.exports = client;

client.login(process.env.TOKEN);

process.on('uncaughtException', exception => console.error(exception));