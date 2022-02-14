const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    ...new SlashCommandBuilder()
          .setName("uptime")
          .setDescription("Get the bot's uptime in HH:MM:SS."),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "Command rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});

          function format(seconds){
               function pad(s){
                    return (s < 10 ? '0' : '') + s;
               }
               var hours = Math.floor(seconds / (60*60));
               var minutes = Math.floor(seconds % (60*60) / 60);
               var seconds = Math.floor(seconds % 60);
             
               return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
          }
          interaction.followUp({content: `Bot uptime is ${format(process.uptime())}`})
     },
};
