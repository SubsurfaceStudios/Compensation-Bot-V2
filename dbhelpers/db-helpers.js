const fs = require("node:fs");
const request = require('request');
const dbhelpers = require("./db-helpers.js");

module.exports = {
     GetUserBlacklisted: function (userid) {
          return userid in JSON.parse(fs.readFileSync("db/blacklist.json"))
     },
     GetUserRank: function (userid) {
          const rankdb = JSON.parse(fs.readFileSync("db/rankdb.json"));
          if(!userid in rankdb) return null;
          else return rankdb[userid];
     },
     GetUserLinkedAccountId: function (userid) {
          const usernamedb = JSON.parse(fs.readFileSync("db/usernamedb.json"));

          if(!userid in usernamedb) return null;
          else if(usernamedb[userid].toString().includes("=")) return null;
          else return usernamedb[userid];
     },
     GetO11Status: function (userid) {
          const rankdb = JSON.parse(fs.readFileSync("db/rankdb.json"));

          if(!userid in rankdb) return false;
          else return rankdb[userid].toString().includes("O11");
     },
     GetDiscordUserFromRecRoomId: function (id) {
          var usernamedb = JSON.parse(fs.readFileSync("db/usernamedb.json"));

          for (let index = 0; index < Object.keys(usernamedb).length; index++) {
               const element = usernamedb[Object.keys(usernamedb)[index]];
               if(element.includes(id) || element.includes(id.toString())) return Object.keys(usernamedb)[index];
          }

          return null;
     },
     GetUserIntelWhitelist: function (id) {
          return JSON.parse(fs.readFileSync("db/intelSubmissionWhitelist.json")).includes(id);
     }
};




