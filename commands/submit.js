const { Message, Client } = require("discord.js");
const request = require('request');
const dbhelpers = require('../dbhelpers/db-helpers.js');
const fs = require('node:fs');

function sleep(ms) {
     return new Promise((resolve) => {
       setTimeout(resolve, ms);
     });
   }

module.exports = {
     name: "intel_submit",
     aliases: ['is'],

     /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
     run: async (client, message, args) => {
          if(dbhelpers.GetUserBlacklisted(message.author.id)) return message.reply({content: "You cannot run this command as you are blacklisted from LC."});
          if(!dbhelpers.GetUserIntelWhitelist(message.author.id)) return message.reply({content: "You are not on the whitelist for this command."});
          if(message.attachments.length < 1) return message.reply({content: "You need to send an image along with your message!"});
          const config = JSON.parse(fs.readFileSync("config.json"));
          if(
               message.attachments.first().contentType !== 'image/png' && 
               message.attachments.first().contentType !== 'image/jpg' && 
               message.attachments.first().contentType !== 'image/jpeg' &&
               message.attachments.first().contentType !== 'image/gif'
          ) return message.reply({content: "pls don't submit viruses ty"});
          if(message.attachments.first().size > 8388608) return message.reply({content: "File is too large! Size limit is 8 mb or 8388608 bytes."});
          request(message.attachments.first().url).pipe(fs.createWriteStream(`cache/${message.attachments.first().name}`));
          await sleep(3000);
          const channel = client.channels.cache.get(config.intelAutoSendChannelId);
          channel.send({content: `SUBMITTED BY: ${message.author.id}, DESCRIPTION/TAGS: ${message.content}`,files: [`cache/${message.attachments.first().name}`]});
          await sleep(3000)
          fs.rmSync(`cache/${message.attachments.first().name}`);
          try {
               message.delete();
          }
          catch(exception) {
               console.error(exception);
          }
     },
};