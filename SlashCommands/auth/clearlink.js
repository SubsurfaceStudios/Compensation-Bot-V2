const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const request = require("request");
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    ...new SlashCommandBuilder()
          .setName("clearlink")
          .setDescription("Clear the link between your discord account and your in-game account.")
          .addUserOption(option =>
               option
                    .setName("user")
                    .setDescription("The user to clear the account link of, leave blank for yourself.")
                    .setRequired(false)
          ),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "Command rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});

          var db = JSON.parse(fs.readFileSync("db/usernamedb.json"));
          const rankdb = JSON.parse(fs.readFileSync("db/rankdb.json"));

          var user = interaction.options.getUser("user");
          if(user == null || typeof(user) == 'undefined') user = interaction.user;
          if(db[user.id] == null || typeof(db[user.id]) == 'undefined') return interaction.followUp({content: "User does not have a linked rec room account."});

          if(rankdb[user.id] == null || typeof(rankdb[user.id]) == 'undefined') return interaction.followUp({content: "You do not have the requisite rank required to run this command."});
          
          var rank = rankdb[user.id].toString();

          if(!rank.includes("O11")) return interaction.followUp({content: "You do not have the requisite rank required to run this command."});

          delete db[user.id];

          fs.writeFileSync("db/usernamedb.json", JSON.stringify(db, null, "     "));

          interaction.followUp({content: "Successfully cleared account link."});
     },
};
