const { Client, CommandInteraction, MessageEmbed, IntegrationApplication } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders")
const fs = require('node:fs');
const dbhelpers = require('../../dbhelpers/db-helpers.js');

module.exports = {
    ...new SlashCommandBuilder()
          .setName("rank")
          .setDescription("GET or SET the rank of a user.")
          .addUserOption((option) => 
               option
                    .setName("user")
                    .setDescription("The user to perform the operation upon.")
                    .setRequired(true)
          )
          .addStringOption((option) =>
               option
                    .setName("type")
                    .setDescription("The type of operation to perform, either get or set.")
                    .setRequired(true)
                    .addChoice("get", "get")
                    .addChoice("set", "set")
          )
          .addIntegerOption((option) =>
               option
                    .setName("rank")
                    .setDescription("The rank to assign if the operation type is set.")
                    .setRequired(false)
          ),

     run: async (client, interaction, args) => {
          if(dbhelpers.GetUserBlacklisted(interaction.user.id)) return interaction.followUp({content: "Command rejected, you are currently blacklisted from LC. Contact the O11-1 for more information and have a nice day."});


          const user = interaction.options.getUser("user");
          const type = interaction.options.getString("type");
          var rank = interaction.options.getInteger("rank")

          if(dbhelpers.GetUserBlacklisted(user.id)) return interaction.followUp({content: "You cannot set this user's rank as they are blacklisted from LC. Contact the O11-1 to appeal or for more information."});

          const rankdb = JSON.parse(await fs.readFileSync("db/rankdb.json"));

          if(type == "get") {
               return interaction.followUp({content: `${dbhelpers.GetUserRank(user.id)}`});
          }
          else if(type == "set")
          {
               if(user.id == interaction.user.id) return interaction.followUp({content: "You cannot set your own rank."});
               var runningUserRank = dbhelpers.GetUserRank(interaction.user.id);
               if(dbhelpers.GetO11Status(interaction.user.id)) runningUserRank = 9999;
               else if(parseInt(runningUserRank.toString().substring(1)) == NaN) return interaction.followUp({content: `Unknown error parsing your rank, contact the O11-1 immediately to have it resolved..`});

               if(rank > 10 || rank < 1) return interaction.followUp({content: "Invalid rank!"});
               if(rank > runningUserRank) return interaction.followUp({content: "You cannot promote a user to higher than your own rank!"});

               if(runningUserRank < 5) return interaction.followUp({content: "You are not high enough ranked to set ranks! Minimum required rank is O5!"});

               var targetUserRank = dbhelpers.GetUserRank(user.id);
               if(targetUserRank == null || typeof(targetUserRank) == 'undefined') targetUserRank = "E0";
               var targetUserBranch = targetUserRank.toString().substring(0, 1);
               if(targetUserRank.includes("O11")) return interaction.followUp({content: "You cannot set the rank of an O11."});
               targetUserRank = parseInt(targetUserRank);
               if(targetUserRank >= runningUserRank) return interaction.followUp({content: "You cannot change the rank of someone with an equal or higher rank than yours. Contact an O11 or higher-up if you believe this to be necessary."});

               rankdb[user.id] = `${targetUserBranch}${rank}`;

               fs.writeFileSync("db/rankdb.json", JSON.stringify(rankdb, null, "     "));

               return interaction.followUp({content: "Operation completed."});
          }
     },
};
