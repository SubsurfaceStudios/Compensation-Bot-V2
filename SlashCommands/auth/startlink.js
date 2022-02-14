const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const request = require("request");
const dbhelpers = require('../../dbhelpers/db-helpers.js');

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 * 
 * CREDIT to lonut G. Stan and meagar on StackOverflow for this function.
 */
 function getRandomInt(min, max) {
     min = Math.ceil(min);
     max = Math.floor(max);
     return Math.floor(Math.random() * (max - min + 1)) + min;
 }

module.exports = {
    ...new SlashCommandBuilder()
          .setName("startlink")
          .setDescription("Link your discord ID to a rank & Rec Room ID.")
          .addStringOption((option) =>
               option
                    .setName("ingameusername")
                    .setDescription("The username of the user to link. NOT INCLUDING @")
                    .setRequired(true)
          ),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "Account link rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});

          var db = JSON.parse(fs.readFileSync("db/usernamedb.json"));

          const user = interaction.user;
          const rrUser = interaction.options.getString("ingameusername");

          var linkcodedb = JSON.parse(fs.readFileSync("db/linkcodedb.json"));
          
          var options = {
               'method': 'GET',
               'url': `https://accounts.rec.net/account?username=${rrUser}`,
               'headers': {
               }
          };
          
          request(options, function (error, response) {
               if(!response.body.toString()) return interaction.followUp({content: "Rec Room user with that username does not exist!"})
               const body = JSON.parse(response.body);
               const authString = `LCVERIFY:${getRandomInt(100000, 999999)}`;

               linkcodedb[user.id] = `${body["accountId"]}=${authString}`;
               fs.writeFileSync("db/linkcodedb.json", `${JSON.stringify(linkcodedb, null, "    ")}`);

               const embed = new MessageEmbed()
                    .setTitle("LC Authorization Code")
                    .addField("Paste this code into your bio using https://rec.net.", `\`\`\`${authString}\`\`\``)
                    .addField("After completing that step, run the following command to complete the verification process.", "```/link```");
               
               
               interaction.followUp({content: "Copy and paste the codeblock below into your rec room bio EXACTLY within 5 minutes and run /link after you have saved & applied it.", embeds: [embed]});
          });
     },
};
