const {MessageEmbed, Constants} = require('discord.js');
const client = require('../index');
const fetch = require('node-fetch');

module.exports = {
    command: {
        name: "analytics",
        description: "Check out useful information about the current state of Compensation VR.",
        options: []
    },
    run: async (interaction) => {
        var embed = new MessageEmbed()
            .setTitle("Compensation VR Analytics")
            .setDescription("We're currently fetching analytical information about Compensation VR from the servers. Please check back in a moment to see the full data.")
            .addField("Player Count - Total", "📥", false)
            .addField("Player Count - Online", "📥", false)
            .addField("Open Room Instances", "📥", false);

        await interaction.reply({embeds: [embed]});

        const total = await (await fetch("https://api.compensationvr.tk/api/analytics/account-count")).text();

        embed = new MessageEmbed()
            .setTitle("Compensation VR Analytics")
            .setDescription("We're currently fetching analytical information about Compensation VR from the servers. Please check back in a moment to see the full data.")
            .addField("Player Count - Total", total, false)
            .addField("Player Count - Online", "📥", false)
            .addField("Open Room Instances", "📥", false);

        await interaction.editReply({embeds: [embed]});

        const online = await (await fetch("https://api.compensationvr.tk/api/analytics/online-count")).text();

        embed = new MessageEmbed()
            .setTitle("Compensation VR Analytics")
            .setDescription("We're currently fetching analytical information about Compensation VR from the servers. Please check back in a moment to see the full data.")
            .addField("Player Count - Total", total, false)
            .addField("Player Count - Online", online, false)
            .addField("Open Room Instances", "📥", false);

        await interaction.editReply({embeds: [embed]});

        const open = await (await fetch("https://api.compensationvr.tk/api/analytics/instance-count")).text();

        embed = new MessageEmbed()
            .setTitle("Compensation VR Analytics")
            .setDescription("Finished fetching analytics data from server.")
            .addField("Player Count - Total", total, false)
            .addField("Player Count - Online", online, false)
            .addField("Open Room Instances", open, false);

        await interaction.editReply({embeds: [embed]});
    }
}