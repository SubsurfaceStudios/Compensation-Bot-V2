const { Client, CommandInteraction, MessageEmbed, IntegrationApplication } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const request = require("request");
const { link } = require("node:fs");
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    ...new SlashCommandBuilder()
          .setName("remindme")
          .setDescription("Tell the bot to remind you of something at a later date.")
          .addIntegerOption(option =>
               option
                    .setName("delay")
                    .setDescription("The time in seconds before the bot should remind you.")
                    .setRequired(true)
          )
          .addStringOption(option =>
               option
                    .setName("title")
                    .setDescription("The name of the reminder to send you.")
                    .setRequired(true)
          )
          .addStringOption(option =>
               option
                    .setName("body")
                    .setDescription("The optional contents of the reminder for the bot to send you.")
                    .setRequired(false)
          ),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "Command rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});
          const delay = interaction.options.getInteger("delay");
          const title = interaction.options.getString("title");
          var body = interaction.options.getString("body");
          if(body == null || typeof(body) == 'undefined') body = "No body.";

          var reminderdb = JSON.parse(fs.readFileSync("db/reminderdb.json"));

          const reminder = {
               userid: interaction.user.id,
               timestamp: (Date.now() + (delay * 1000)),
               title: title,
               body: body
          };

          reminderdb.push(reminder);

          fs.writeFileSync("db/reminderdb.json", JSON.stringify(reminderdb, null, "  "));

          const embed = new MessageEmbed()
               .setTitle("LC Bot Scheduled Reminder")
               .addField(title, body);
          interaction.followUp({content: `Understood. I will remind you in ${delay} seconds with the following message.`, embeds: [embed]});
     },
};
