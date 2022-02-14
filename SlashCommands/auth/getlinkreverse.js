const { Client, CommandInteraction, MessageEmbed, IntegrationApplication } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const request = require("request");
const { link } = require("node:fs");
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    ...new SlashCommandBuilder()
          .setName("getlinkreverse")
          .setDescription("Get the discord account of a linked user from their rec room username.")
          .addStringOption(option =>
               option
                    .setRequired(true)
                    .setName("user")
                    .setDescription("The @username of the user to locate.")
          )
          .addBooleanOption(option =>
               option
                    .setRequired(true)
                    .setName("ping")
                    .setDescription("Whether to ping the user found (true) or to simply send their ID (false).")   
          ),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "Command rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});

          const username = interaction.options.getString("user");
          const ping = interaction.options.getBoolean("ping")

          var options = {
               'method': 'GET',
               'url': `https://accounts.rec.net/account?username=${username}`,
               'headers': {
               }
          };
          request(options, function (error, response) {
               if(error) throw new Error(error);

               if(response.statusCode != 200) return interaction.followUp({content: "No user with that username exists on Rec Room!"});
               const id = JSON.parse(response.body)["accountId"];

               var userid = dbhelpers.GetDiscordUserFromRecRoomId(id);

               if(userid === null) return interaction.followUp({content: "The specified username could not be found in the LC username database."});

               if(ping) return interaction.followUp({content: `The user associated with the Rec Room username of ${username} is: <@${userid}>`, ephemeral: true});
               return interaction.followUp({content: `The user id associated with the Rec Room username of ${username} is: ${userid}`});
          })
     },
};
