const {MessageEmbed, Constants} = require('discord.js');
const client = require('../index');
const fetch = require('node-fetch');

module.exports = {
    command: {
        name: "website",
        description: "Gives information about the Compensation VR website.",
        options: [
            {
                name: "status",
                description: "Whether or not to display the up/down status of the website.",
                required: false,
                type: Constants.ApplicationCommandOptionTypes.BOOLEAN
            }
        ]
    },
    run: async (interaction) => {
        const status = interaction.options.getBoolean("status");

        if(status) {
            interaction.deferReply({content: "Fetching website status, please wait!"});

            var response = await fetch("https://compensationvr.tk");

            var embed = new MessageEmbed()
                .setTitle("Compensation VR Official Website")
                .addField("Address", "The Compensation VR website can be found at https://compensationvr.tk.")
                .addField("Status", response.status == 200 ? "The Compensation VR website is currently ✅ ONLINE." : "The Compensation VR website is currently ❌ OFFLINE!");

            interaction.followUp({content: "Done!", embeds: [embed]});
            return;
        }

        var embed = new MessageEmbed()
                .setTitle("Compensation VR Official Website")
                .addField("Address", "The Compensation VR website can be found at https://compensationvr.tk.");
        
        interaction.reply({content: "Done!", embeds: [embed]});
    }
}