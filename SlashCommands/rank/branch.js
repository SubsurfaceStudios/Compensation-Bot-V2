const { Client, CommandInteraction, MessageEmbed, IntegrationApplication } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    ...new SlashCommandBuilder()
          .setName("branch")
          .setDescription("Set the branch of a user")
          .addUserOption((option) => 
               option
                    .setName("user")
                    .setDescription("The user to perform the operation upon.")
                    .setRequired(true)
          )
          .addStringOption((option) =>
               option
                    .setName("branch")
                    .setDescription("The branch of the user to set.")
                    .setRequired(false)
          ),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "Command rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});


          const user = interaction.options.getUser("user");
          const type = interaction.options.getString("type");
          var branch = interaction.options.getString("branch")

          if(dbhelpers.GetUserBlacklisted(user.id)) return interaction.followUp({content: "You cannot set this user's branch as they are blacklisted from LC. Contact the O11-1 to appeal or for more information."});

          const rankdb = JSON.parse(await fs.readFileSync("db/rankdb.json"));

          if(user.id == interaction.user.id) return interaction.followUp({content: "You cannot set your own branch."});
          var runningUserRank = dbhelpers.GetUserRank(interaction.user.id);
          if(dbhelpers.GetO11Status(interaction.user.id)) runningUserRank = 9999;
          else if(parseInt(runningUserRank.toString().substring(1)) == NaN) return interaction.followUp({content: `Unknown error parsing your rank, contact the O11-1 immediately to have it resolved..`});

          if(branch != "O" && branch != "E") return interaction.followUp({content: "Invalid branch!"});

          if(runningUserRank < 5) return interaction.followUp({content: "You are not high enough ranked to set branches! Minimum required rank is O5!"});

          var targetUserRank = dbhelpers.GetUserRank(user.id);
          if(targetUserRank == null || typeof(targetUserRank) == 'undefined') targetUserRank = "E0";
          var targetUserBranch = targetUserRank.toString().substring(0, 1);
          if(targetUserRank.includes("O11")) return interaction.followUp({content: "You cannot set the branch of an O11."});
          targetUserRank = parseInt(targetUserRank.substring(1));
          if(targetUserRank >= runningUserRank) return interaction.followUp({content: "You cannot change the branch of someone with an equal or higher rank than yours. Contact an O11 or higher-up if you believe this to be necessary."});

          rankdb[user.id] = `${branch}${targetUserRank}`;

          fs.writeFileSync("db/rankdb.json", JSON.stringify(rankdb, null, "     "));

          return interaction.followUp({content: "Operation completed."});
     },
};
