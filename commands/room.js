const {MessageEmbed, Constants} = require('discord.js');
const client = require('../index');
const fetch = require('node-fetch');

module.exports = {
    command: {
        name: "room",
        description: "Get information about a room from it's ID.",
        options: [
            {
                name: "room-id",
                description: "The room ID you want to fetch info about.",
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    run: async (interaction) => {
        await interaction.deferReply({content: "Checking API status..."});

        const status_response = await fetch("https://api.compensationvr.tk/");

        if(status_response.status != 200) {
            interaction.editReply({content: "Checking API status...FAILED"});
            interaction.followUp({content: "Failed to fetch room data, servers are offline!"});
            return;
        }

        interaction.editReply({content: "Checking API status...SUCCESS\nFetching room data..."});

        const data_response = await fetch(`https://api.compensationvr.tk/api/rooms/room/${interaction.options.getString("room-id")}/info`);

        if(data_response.status != 200) {
            interaction.editReply({content: "Checking API status...SUCCESS\nFetching room data...FAILED"});
            switch(data_response.status) {
                case 404:
                    return interaction.followUp({content: "Failed to fetch room data, room does not exist!"});
                case 403:
                    return interaction.followUp({content: "Failed to fetch room data, missing permissions!"});
                default:
                    return interaction.followUp({content: `Failed to fetch room data, unknown error. Code: ${response.status}`});
            }
        }

        const room_obj = await data_response.json();
        const pub_data = await (await fetch(`https://api.compensationvr.tk/api/accounts/${room_obj.creator_id}/public`)).json();

        const embed = new MessageEmbed()
            .setTitle(`${pub_data.username}/${room_obj.name}`)
            .setDescription(room_obj.description)
            .addField("ID", room_obj._id);
        
        interaction.editReply({content: "Checking API status...SUCCESS\nFetching room data...SUCCESS"});
        interaction.followUp({content: "Done!", embeds: [embed]});
    }
}