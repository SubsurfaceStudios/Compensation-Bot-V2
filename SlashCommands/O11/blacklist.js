const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    ...new SlashCommandBuilder()
          .setName("blacklist")
          .setDescription("Blacklist a user from all LC services.")
          .addUserOption((option) => 
               option
                    .setName("user")
                    .setDescription("The user to perform the operation upon.")
                    .setRequired(true)
          )
          .addStringOption((option) =>
               option
                    .setName("reason")
                    .setDescription("The reason for which the user is blacklisted.")
                    .setRequired(true)
          ),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "O11 command rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});

          const user = interaction.options.getUser("user");
          const author = interaction.user;

          const reason = interaction.options.getString("reason");

          let rankdb = JSON.parse(fs.readFileSync("db/rankdb.json"))
          let blacklist = JSON.parse(fs.readFileSync("db/blacklist.json"))

          if(typeof(rankdb[author.id]) == 'undefined' || rankdb[author.id] == null) return interaction.followUp({content: "Your rank is not present in the LC database!"});
          if(rankdb[author.id].split("-")[0] !== "O11") return interaction.followUp({ content: "Access denied.", ephemeral: true });
          if(!(rankdb[user.id] == null || typeof(rankdb[user.id]) == 'undefined')) {
               if(rankdb[user.id].split("-")[0] == "O11") {
                    interaction.followUp({ content: "You cannot blacklist a fellow O11. The O11-1 has been notified of your attempt.", ephemeral: true });
                    console.warn(`O11 ${author.username} has attempted to blacklist a fellow O11 council member!`);
                    return;
               }
          }
          rankdb[user.id] = `***BLACKLISTED*** formerly ;${rankdb[user.id]}`;
          blacklist[user.id] = `${reason}`;

          fs.writeFileSync("db/blacklist.json", JSON.stringify(blacklist, null, "    "));
          fs.writeFileSync("db/rankdb.json", JSON.stringify(rankdb, null, "     "));
          console.warn(`O11 ${author.username} has blacklisted ${user.username} for the reason of ${reason}`);
          interaction.followUp({content: "**Operation complete.**"});
     },
};
