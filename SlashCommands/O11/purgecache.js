const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    ...new SlashCommandBuilder()
          .setName("forcecachepurge")
          .setDescription("Completely clear the bot's file cache folder."),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "O11 command rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});

          if(!dbhelpers.GetO11Status(interaction.user.id)) return interaction.followUp({content: "You are not an O11! Access denied to cache folder."});

          const files = fs.readdirSync("cache");

          for (let index = 0; index < files.length; index++) {
               const element = files[index];
               
               fs.rmSync(`cache/${element}`, {recursive: true, force: true});
          }

          return interaction.followUp({content: "Operation successful. Cache cleared."});
     },
};
