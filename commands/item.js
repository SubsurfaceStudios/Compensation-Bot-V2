const {MessageEmbed, Constants} = require('discord.js');
const client = require('../index');
const fetch = require('node-fetch');

module.exports = {
    command: {
        name: "item",
        description: "Get information about an item from it's ID.",
        options: [
            {
                name: "item-id",
                description: "The item ID you want to fetch info about.",
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
            interaction.followUp({content: "Failed to fetch item data, servers are offline!"});
            return;
        }

        interaction.editReply({content: "Checking API status...SUCCESS\nFetching item data..."});
        
        const data_response = await fetch(`https://api.compensationvr.tk/api/econ/item/${interaction.options.getString('item-id')}/info`);

        if(data_response.status != 200) {
            interaction.editReply({content: "Checking API status...SUCCESS\nFetching item data...FAILED"});
            interaction.followUp({content: `Failed to fetch item data, unknown error. Code: ${data_response.status}`});
            return;
        }

        const obj = await data_response.json();

        const embed = new MessageEmbed()
            .setTitle(obj.name)
            .setDescription(`Item #${obj.id}\nUUID: \`${obj.clothing_item_uuid}\`\nEquip Slot: \`${obj.use_slot}\``)
            .addField("Purchasable", obj.is_purchasable.toString(), true)
            .addField("Transferrable", obj.is_transferrable.toString(), true)
            .addField("Refundable", obj.is_refundable.toString(), true)
            .addField("Giftable", obj.is_giftable.toString(), true)
            .addField("Equippable", obj.equippable.toString(), true)
            .addField("Listed In Store", obj.listed_in_store.toString(), true)
            .addField("Buy Price", obj.buy_price.toString(), false)
            .addField("Refund Price", obj.refund_price.toString(), false)
            .addField("Gift Price", obj.gift_price.toString())
            .addField("Rarity", `${obj.rarity}/5`);

        interaction.editReply({content: "Checking API status...SUCCESS\nFetching item data...SUCCESS"});
        interaction.followUp({content: "Done!", embeds: [embed]});
    }
}