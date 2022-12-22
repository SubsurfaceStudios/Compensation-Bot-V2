import { ApplicationCommandData, ApplicationCommandType } from "discord.js";
import { readdir } from "fs/promises";
import { join } from "path";
import { client } from "..";
import { Command } from "../def";

export const convertToDiscordCommands = (commands: Command[]): ApplicationCommandData[] =>
  commands.map((cmd) => ({
    name: cmd.name,
    description: cmd.description,
    options: cmd.options,
    dmPermission: cmd.dm,
    type: ApplicationCommandType.ChatInput,
  }));

export const commands = new Array<Command>();

export default async function commandHandler() {
  const rootDir = join(__dirname, "..", "commands").trim();
  const subDirs = await readdir(rootDir);

  for (const subDir of subDirs) {
    const commandFiles = (await readdir(join(rootDir, subDir))).filter((i) => i.endsWith(".js"));
    for (const commandFile of commandFiles) {
      const command = (await import(join(rootDir, subDir, commandFile))).default;
      commands.push(command);
    }
  }

  client.application?.commands.set(convertToDiscordCommands(commands));
}
