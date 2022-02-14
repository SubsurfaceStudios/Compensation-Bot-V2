const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    ...new SlashCommandBuilder()
          .setName("unblacklist")
          .setDescription("Remove a user's LC service blacklist status and restore their previous rank.")
          .addUserOption((option) => 
               option
                    .setName("user")
                    .setDescription("The user to perform the operation upon.")
                    .setRequired(true)
          ),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "O11 command rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});

          const user = interaction.options.getUser("user");
          const author = interaction.user;

          let rankdb = JSON.parse(fs.readFileSync("db/rankdb.json"))
          let blacklist = JSON.parse(fs.readFileSync("db/blacklist.json"))

          if(typeof(rankdb[author.id]) == 'undefined' || rankdb[author.id] == null) return interaction.followUp({content: "Your rank is not present in the LC database!"});
          if(rankdb[author.id].split("-")[0] !== "O11") return interaction.followUp({ content: "Access denied.", ephemeral: true });
          if(typeof(blacklist[user.id]) == 'undefined' || blacklist[user.id] == null) return interaction.followUp({content: "User is not blacklisted. Operation canceled."});

          let formerRank = blacklist[user.id].split(";")[0];
          rankdb[user.id] = `${formerRank}`;
          delete blacklist[user.id];

          fs.writeFileSync("db/blacklist.json", JSON.stringify(blacklist, null, "    "));
          fs.writeFileSync("db/rankdb.json", JSON.stringify(rankdb, null, "     "));
          interaction.followUp({content: "**Operation complete.**"});
     },
};
