const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const request = require("request");
const { link } = require("node:fs");
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    ...new SlashCommandBuilder()
          .setName("getlink")
          .setDescription("Get the linked account of a user on the LC discord.")
          .addUserOption(option =>
               option
                    .setRequired(false)
                    .setName("user")
                    .setDescription("The user to get the linked account of, leave blank for yourself.")
          ),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "Command rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});

          const db = JSON.parse(fs.readFileSync("db/usernamedb.json"));

          var user = interaction.options.getUser("user");
          if(user == null || typeof(user) == 'undefined') user = interaction.user;
                if(db[user.id] == null || typeof(db[user.id]) == 'undefined') return interaction.followUp({content: "User is not present in database."});
          if(db[user.id][0] == null || typeof(db[user.id]) == 'undefined') return interaction.followUp({content: "User is not linked with a Rec Room account!"});
          if(db[user.id][0].toString().includes("=")) return interaction.followUp({content: "User is not completely done with the /link process!"});

          var options = {
               'method': 'GET',
               'url': `https://accounts.rec.net/account/${db[user.id][0]}`,
               'headers': {
               }
          };

          request(options, function(error, response) {
               if(error) throw new Error(error);

               const body = JSON.parse(response.body);

               return interaction.followUp({content: `The user associated with the account specified can be found at \n https://rec.net/user/${body["username"]}`});
          });
     },
};









