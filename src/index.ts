import { GatewayIntentBits } from "discord.js";
import { CustomClient } from "./def";
import commandHandler from "./handlers/command";
import userAutocompleteHandler from "./handlers/user";
import interactionHandler from "./handlers/interaction";
import { setupReactiveData } from "./lib/data";
import itemAutocompleteHandler from "./handlers/item";
import roomAutocompleteHandler from "./handlers/room";
import messageSyncHandler from "./handlers/sync";

export const client = new CustomClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  config: setupReactiveData("config"),
});

client.once("ready", async () => {
  await commandHandler();
  await interactionHandler();

  await userAutocompleteHandler();
  await itemAutocompleteHandler();
  await roomAutocompleteHandler();

  await messageSyncHandler();

  console.log("cvr bot is ready.");
});

client.login(client.config.token);
