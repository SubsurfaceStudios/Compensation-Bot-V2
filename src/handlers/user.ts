import { Interaction } from "discord.js";
import { ofetch } from "ofetch";
import { client } from "..";
import { User } from "../def";

const userCache = new Map<number, User>();
export async function getUser(id: number) {
  if (userCache.has(id)) return userCache.get(id)!;
  else {
    const user: User | undefined = await ofetch(
      `https://api.compensationvr.tk/api/accounts/${id}/public`,
    ).catch(() => {});
    if (user) userCache.set(id, user);
    return user;
  }
}

type UserWithId = User & { id: number; };

// this is a mix of old and new code so expect a lot of weird shit
// if the rate limits were to be lightened somewhat i could make this a lot nicer
export default async function userAutocompleteHandler() {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isAutocomplete() || interaction.commandName !== "user") return;
    const focusedValue = interaction.options.getFocused();

    const potentialId = parseInt(focusedValue);
    if (!isNaN(potentialId)) {
      const potentialUser = await getUser(potentialId);
      if (potentialUser !== undefined)
        return await interaction.respond([{ name: `${potentialUser.nickname} (${potentialUser.username}) [#${potentialId}]`, value: potentialId }]);
    }

    const userIds: string[] = await ofetch("https://api.compensationvr.tk/api/accounts/search", {
      params: {
        query: focusedValue,
      },
    }).catch(() => {});

    let users: UserWithId[];

    if (userIds && userIds.length) {
      users = (
        await Promise.all(
          userIds.map(async (i: string) => {
            const id = parseInt(i);
            if (isNaN(id)) return;
            return { id, ...(await getUser(id)) };
          }),
        )
      ).filter((u) => u !== undefined) as UserWithId[];
    } else {
      users = [...userCache.entries()]
        .filter(([_, user]) => user.username.toLowerCase().includes(focusedValue.toLowerCase()))
        .map(([id, user]) => ({ id, ...user }));
    }

    await interaction.respond(
      users
        .slice(0, 25)
        .map((user) => ({ name: `${user.nickname} (${user.username}) [#${user.id}]`, value: user.id })),
    );
  });
}
