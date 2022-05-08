require('dotenv').config();
const {Client, Intents, MessageEmbed} = require('discord.js');
const fs = require('node:fs');
const {w3cwebsocket: WebSocket} = require('websocket');
const fetch = require('node-fetch');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.DIRECT_MESSAGES], partials: ["CHANNEL"]});

client.once('ready', main);

client.on('interactionCreate', async (interaction) => {
    if(interaction.isCommand()) {
        return require(`./commands/${interaction.commandName}`).run(interaction);
    }
});

module.exports = client;

client.login(process.env.TOKEN);

process.on('uncaughtException', exception => console.error(exception));

const messaging_config = require('./messaging_config.json');



///////////////////////////////////////////////////////////////////////

var socket;

async function main() {
    console.log("ready");
    const commands = fs.readdirSync('./commands').map(item => require(`./commands/${item}`).command);

    const debug_server = client.guilds.cache.get(process.env.SERVER_ID);
    if(typeof debug_server == 'undefined') {
        await client.application.commands.set(commands);
    } else {
        await debug_server.commands.set(commands);
    }

    console.log("commands set");

    client.on('messageCreate', async (message) => {
        if(message.author.bot) return;
        if(message.channel.type == 'DM') return;
        if(message.guildId != process.env.SERVER_ID) return;

        
        var store = await getStore();
        var inverted = invertObject(messaging_config);
        
        if(!Object.keys(inverted).includes(message.channelId)) return;

        const url = `https://api.compensationvr.tk/api/messaging/channels/${inverted[message.channelId]}/messages`;
        const content = {
            content: `Message from Discord: '${message.author.username}#${message.author.discriminator}': ${message.content}`
        };

        const response = await fetch(url, {
            method: 'put',
            body: JSON.stringify(content, null, 5),
            headers: {
                'Content-Type': "application/json",
                'Authorization': `Bearer ${process.env.BOT_ACCOUNT_PERMANENT_TOKEN}`
            }
        });

        if(response.status != 200) return;

        const json = await response.json();
        store[message.id] = json.message_id;
        await setStore(store);

        await message.react("📡");
    });

    client.on('messageUpdate', async (message) => {
        if(message.author.bot) return;
        if(message.channel.type == 'DM') return;
        if(message.guildId != process.env.SERVER_ID) return;

        var store = await getStore();

        if(!Object.keys(store).includes(message.id)) return;

        const url = `https://api.compensationvr.tk/api/messaging/messages/${store[message.id]}`;
        const content = {
            content: `Message from Discord (edited): '${message.author.username}#${message.author.discriminator}': ${message.content}`
        };

        const response = await fetch(url, {
            method: 'patch',
            body: JSON.stringify(content, null, 5),
            headers: {
                'Content-Type': "application/json",
                'Authorization': `Bearer ${process.env.BOT_ACCOUNT_PERMANENT_TOKEN}`
            }
        });
    });

    client.on('messageDelete', async (message) => {
        if(message.channel.type == 'DM') return;
        if(message.guildId != process.env.SERVER_ID) return;

        var store = await getStore();

        if(!Object.keys(store).includes(message.id)) return;

        const url = `https://api.compensationvr.tk/api/messaging/messages/${store[message.id]}`;
        await fetch(url, { method: 'delete', headers: {"Authorization": `Bearer ${process.env.BOT_ACCOUNT_PERMANENT_TOKEN}`}});
    });




    // messaging handling

    await ws_setup();
}
async function ws_setup() {
    socket = new WebSocket("ws://api.compensationvr.tk/messaging-gateway");
    socket.onopen = onopen;
    socket.onclose = e => {
        if(e.wasClean) return;
        console.log("reconnecting");
        ws_setup();
    };
}

async function onopen() {
    var packet = {
        code: "authenticate",
        data: {
            token: process.env.BOT_ACCOUNT_PERMANENT_TOKEN
        }
    };

    socket.send(JSON.stringify(packet, null, 5));

    socket.onmessage = async (event) => {
        console.log(event.data);

        const parsed = JSON.parse(event.data);
        var store = await getStore();

        switch(parsed.code) {
            case "message_sent":
                if(parsed.data.message_content.author == messaging_config.bot_id) return;
                if(!Object.keys(messaging_config).includes(parsed.data.channel_id) || parsed.data.server_id != process.env.MESSAGE_SYNC_SERVER || Object.keys(store).includes(parsed.data.message_id)) return console.log("got message but too lazy to send");

                var channel = client.channels.cache.get(messaging_config[parsed.data.channel_id]);
                await channel.sendTyping();

                var author = await (await fetch(`https://api.compensationvr.tk/api/accounts/${parsed.data.message_content.author}/public`)).json();

                var embed = new MessageEmbed()
                    .setTitle("In-Game message from official server")
                    .setDescription(`Sent in the Compensation VR official in-game messaging server by "${author.nickname}" (@${author.username}), with the tag "${author.tag}".`)
                    .addField("Message", parsed.data.message_content.content)
                    .addField("Message ID", parsed.data.message_id);

                var message = await channel.send({embeds: [embed]});

                store[parsed.data.message_id] = message.id;
                setStore(store);
                break;
            case "message_edited":
                if(parsed.data.message_content.author == process.env.BOT_ACCOUNT_ID) return;
                if(!Object.keys(messaging_config).includes(parsed.data.channel_id) || parsed.data.server_id != process.env.MESSAGE_SYNC_SERVER || !Object.keys(store).includes(parsed.data.message_id)) return console.log("got message but too lazy to edit");

                var channel = client.channels.cache.get(messaging_config[parsed.data.channel_id]);

                var author = await (await fetch(`https://api.compensationvr.tk/api/accounts/${parsed.data.message_content.author}/public`)).json();
                
                var embed = new MessageEmbed()
                    .setTitle("In-Game message from official server")
                    .setDescription(`Sent in the Compensation VR official in-game messaging server by "${author.nickname}" (@${author.username}), with the tag "${author.tag}".`)
                    .addField("Message", parsed.data.message_content.content)
                    .addField("Message ID", parsed.data.message_id);
                var message = await channel.messages.fetch(store[parsed.data.message_id]);

                await message.edit({embeds: [embed]});
                break;
            case "message_deleted":
                if(parsed.data.message_content.author == process.env.BOT_ACCOUNT_ID) return;
                if(!Object.keys(messaging_config).includes(parsed.data.channel_id) || parsed.data.server_id != process.env.MESSAGE_SYNC_SERVER || !Object.keys(store).includes(parsed.data.message_id)) return console.log("got message but too lazy to edit");

                var channel = await client.channels.fetch(messaging_config[parsed.data.channel_id]);
                var message = channel.messages.cache.get(store[parsed.data.message_id]);

                await message.delete();

                delete store[parsed.data.message_id];
                setStore(store);
                break;
        }
    };
}

async function getStore() {
    return JSON.parse(fs.readFileSync('./messaging_store.json'));
}

async function setStore(store_object) {
    fs.writeFileSync('./messaging_store.json', JSON.stringify(store_object, null, 5));
}

function invertObject(obj) {
    var new_obj = {};

    for(let i = 0; i < Object.keys(obj).length; i++) {
        const key = Object.keys(obj)[i];
        const value = obj[key];
        new_obj[value] = key;
    }

    return new_obj;
}