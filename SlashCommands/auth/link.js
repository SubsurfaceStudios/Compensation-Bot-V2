const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const request = require("request");
const { link } = require("node:fs");
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    ...new SlashCommandBuilder()
          .setName("link")
          .setDescription("Link your discord ID to a rank & Rec Room ID."),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "Account link rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});

          const user = interaction.user;
          var db = JSON.parse(fs.readFileSync("db/usernamedb.json"));
          var linkcodedb = JSON.parse(fs.readFileSync("db/linkcodedb.json"));

          if(linkcodedb[user.id] == null || typeof(linkcodedb[user.id]) == 'undefined') return interaction.followUp({content: "You need to run ```/startlink``` before you can use this command!"});

          const rrUserId = linkcodedb[user.id].split('=')[0];
          const authString = linkcodedb[user.id].split('=')[1];

          


          var options = {
               'method': 'GET',
               'url': `https://accounts.rec.net/account/${rrUserId}/bio`,
               'headers': {
               }
          };

          request(options, function (error, response) {
               if (error) throw new Error(error);

               const body = JSON.parse(response.body);

               if(!body.bio.includes(authString)) {
                    delete linkcodedb[user.id];
                    fs.writeFileSync("db/linkcodedb.json", JSON.stringify(linkcodedb, null, "  "));
                    interaction.followUp({content: "The account you tried to link with does not contain the authentication string, are you sure you have access to it? Run ```/startlink``` again with the correct username for a new code."});
                    return;
               }
               
               delete linkcodedb[user.id];
               fs.writeFileSync("db/linkcodedb.json", JSON.stringify(linkcodedb, null, "     "));
               if(typeof(db[user.id]) != "undefined") db[user.id].push(rrUserId);
               else db[user.id] = [rrUserId];
               fs.writeFileSync("db/usernamedb.json", JSON.stringify(db, null, "     "));
               return interaction.followUp({content: "Account successfully linked!"});
          });
     },
};
