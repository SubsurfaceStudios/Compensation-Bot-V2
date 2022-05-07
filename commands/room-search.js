const {MessageEmbed, Constants} = require('discord.js');
const client = require('../index');
const fetch = require('node-fetch');

module.exports = {
    command: {
        name: "room-search",
        description: "Search for rooms by name.",
        options: [
            {
                name: "query",
                description: "The search query you want to send to our servers.",
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    run: async (interaction) => {
        const query = interaction.options.getString("query");

        message = await interaction.deferReply({content: "Fetching server status..."});

        const status_response = await fetch("https://api.compensationvr.tk/");

        if(status_response.status != 200) {
            interaction.editReply({content: "Fetching server status...FAILED"});
            await interaction.followUp({content: "Failed to search for room, servers are offline!"});
            return;
        }

        interaction.editReply({content: "Fetching server status...SUCCESS\nSearching for room..."});

        const search_response = await fetch(`https://api.compensationvr.tk/api/rooms/search?mode=search&query=${query}`);

        let embeds = [];
        var rooms = await search_response.json();

        for (let index = 0; index < rooms.length && index < 5; index++) {
            const element = rooms[index];

            const creator_data = await (await fetch(`https://api.compensationvr.tk/api/accounts/${element.creator_id}/public`)).json();

            const embed = new MessageEmbed()
                .setTitle(`'${creator_data.username}/${element.name}'`)
                .setDescription(element.description)
                .addField("ID", element._id);

            embeds.push(embed);
        }

        interaction.editReply({content: "Fetching server status...SUCCESS\nSearching for room...SUCCESS"});
        interaction.followUp({content: embeds.length < 1 ? "No results found!" :"Done!", embeds: embeds});
    }
}