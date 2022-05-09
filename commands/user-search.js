const {MessageEmbed, Constants} = require('discord.js');
const client = require('../index');
const fetch = require('node-fetch');

module.exports = {
    command: {
        name: "user-search",
        description: "Search for users by the selected .",
        options: [
            {
                name: "query",
                description: "The search query you want to send to our servers.",
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: "mode",
                description: "The method you want to search with.",
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING,
                choices: [
                    {name: "username", value: "username"},
                    {name: "nickname", value: "nickname"},
                    {name: "bio", value: "bio"}
                ]
            }
        ]
    },
    run: async (interaction) => {
        const query = interaction.options.getString("query");
        const mode = interaction.options.getString("mode");

        message = await interaction.deferReply({content: "Fetching server status..."});

        const status_response = await fetch("https://api.compensationvr.tk/");

        if(status_response.status != 200) {
            interaction.editReply({content: "Fetching server status...FAILED"});
            await interaction.followUp({content: "Failed to search for room, servers are offline!"});
            return;
        }

        interaction.editReply({content: "Fetching server status...SUCCESS\nSearching for user..."});

        const search_response = await fetch(`https://api.compensationvr.tk/api/accounts/search?mode=${mode}&query=${query}`);

        let embeds = [];
        var users = await search_response.json();

        for (let index = 0; index < users.length && index < 5; index++) {
            const element = await (await fetch(`https://api.compensationvr.tk/api/accounts/${users[index]}/public`)).json();
            
            const embed = new MessageEmbed()
                .setTitle(`'${element.nickname}' - @${element.username}`)
                .setDescription(element.bio == "" ? "No bio set." : element.bio)
                .addField("Tag", element.tag == "" ? "None" : element.tag)
                .addField("Pronouns", element.pronouns == "" ? "No pronouns set." : element.pronouns);

            embeds.push(embed);
        }

        interaction.editReply({content: "Fetching server status...SUCCESS\nSearching for user...SUCCESS"});
        interaction.followUp({content: embeds.length < 1 ? "No results found!" :"Done!", embeds: embeds});
    }
}