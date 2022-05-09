const {MessageEmbed, Constants} = require('discord.js');
const client = require('../index');
const fetch = require('node-fetch');

module.exports = {
    command: {
        name: "user",
        description: "Get information about a user.",
        options: [
            {
                name: 'username',
                description: 'The username of the user you want to find information about.',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    run: async (interaction) => {
        const username = interaction.options.getString('username');
        await interaction.deferReply({content: "Fetching server status..."});

        const status_response = await fetch("https://api.compensationvr.tk");

        if(status_response.status != 200) return await interaction.editReply({content: "Fetching server status...FAILED"});

        await interaction.editReply({content: "Fetching server status...SUCCESS\nFetching user ID..."});

        const id_response = await fetch(`https://api.compensationvr.tk/api/accounts/${username}/id`);

        if(id_response.status != 200) return await interaction.editReply({content: "Fetching server status...SUCCESS\nFetching user ID...FAILED"});

        await interaction.editReply({content: "Fetching server status...SUCCESS\nFetching user ID...SUCCESS\nFetching user public data..."});

        const id_obj = await id_response.json();

        const public_response = await fetch(`https://api.compensationvr.tk/api/accounts/${id_obj.id}/public`);

        if(public_response.status != 200) return await interaction.editReply({content: "Fetching server status...SUCCESS\nFetching user ID...SUCCESS\nFetching user public data...FAILED"});

        const public_data = await public_response.json();

        const embed = new MessageEmbed()
            .setTitle(`'${public_data.nickname}' - @${public_data.username}`)
            .setDescription(public_data.bio == "" ? "No bio set." : public_data.bio)
            .addField("Tag", public_data.tag == "" ? "No tag set." : public_data.tag)
            .addField("Pronouns", public_data.pronouns == "" ? "No pronouns set." : public_data.pronouns)
            .addField("ID", id_obj.id);

        await interaction.editReply({content: "Done!"});

        return await interaction.followUp({embeds: [embed]});
    }
}