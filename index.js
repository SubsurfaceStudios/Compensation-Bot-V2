const { Client, Collection, MessageEmbed } = require("discord.js");
const fs = require("node:fs");

const client = new Client({
    intents: 32767,
});
module.exports = client;

// Global Variables
client.commands = new Collection();
client.slashCommands = new Collection();
client.config = require("./config.json");

// Initializing the project
require("./handler")(client);

client.login(client.config.token);

setInterval(refreshReminders, 5000);

async function refreshReminders() {
    const currentTimeStamp = Date.now();

    var reminderdb = JSON.parse(fs.readFileSync("db/reminderdb.json"));

    if(reminderdb.length < 1) return;

    for (let index = 0; index < reminderdb.length; index++) {
        const reminder = reminderdb[index];
        if(reminder.timestamp < currentTimeStamp) {
            const user = await client.users.fetch(reminder.userid);
            const embed = new MessageEmbed()
                .setTitle("LC Bot Scheduled Reminder")
                .addField(reminder.title, reminder.body);
            user.send({embeds: [embed]});
            reminderdb.splice(index);
        }
    }
    fs.writeFileSync("db/reminderdb.json", JSON.stringify(reminderdb, null, "   "));
}