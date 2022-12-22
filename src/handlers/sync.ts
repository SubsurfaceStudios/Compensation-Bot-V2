import { client } from "..";
import { TokenData, WebSocketMessage } from "../def";
import { TextChannel, Webhook } from "discord.js";
import WebSocket from "ws";
import { getUser } from "./user";
import { ofetch } from "ofetch";

async function createWebhook() {
  // i'm just gonna trust you to pass me the right type of channel
  const channel = (await client.channels.fetch(
    client.config.messaging.channel.discord,
  )) as TextChannel;
  const webhook = await channel.createWebhook({
    name: "CVR Message Bridge",
    reason: "Automatically generated webhook for syncing messages between CVR and Discord",
  });

  client.config.messaging.webhook.id = webhook.id;
  client.config.messaging.webhook.token = webhook.token!;

  return webhook;
}

export default async function messageSyncHandler() {
  const payload = client.config.messaging.token.split(".")[1];
  const decoded = Buffer.from(payload, "base64").toString("utf8");
  const me: TokenData = JSON.parse(decoded);

  const webhook =
    client.config.messaging.webhook.id === ""
      ? await createWebhook()
      : await client
          .fetchWebhook(client.config.messaging.webhook.id, client.config.messaging.webhook.token)
          .then((wh) => wh)
          .catch(async () => await createWebhook());

  const webhookMapping = new Map<string, string>();
  (function connectWebsocket() {
    const ws = new WebSocket("wss://api.compensationvr.tk/messaging-gateway");

    ws.on("open", () => {
      ws.send(
        JSON.stringify({
          code: "authenticate",
          data: {
            token: client.config.messaging.token,
          },
        }),
      );
    });

    ws.on("message", async (rawMessage) => {
      const { code, data }: WebSocketMessage = JSON.parse(rawMessage.toString("utf8"));

      switch (code) {
        case "message_sent":
          // if (data.message_content.author === me.id) return;
          const user = await getUser(parseInt(data.message_content.author));
          if (!user) return;

          const message = await webhook.send({
            username: `${user.nickname} (@${user.username})`,
            avatarURL: `https://api.compensationvr.tk/img/${user.profile_picture_id}`,
            content: data.message_content.content,
          });
          webhookMapping.set(data.message_id, message.id);
          break;
        case "message_edited":
          // if (data.message_content.author === me.id) return;
          const editId = webhookMapping.get(data.message_id);
          if (!editId) return;

          await webhook.editMessage(editId, data.message_content);
          break;
        case "message_deleted":
          // the switch statement all counts as one big scope so these have to be different names, yet another reason to hate js switches
          const deleteId = webhookMapping.get(data.message_id);
          if (!deleteId) return;

          await webhook.deleteMessage(deleteId);
          break;
      }
    });

    ws.on("close", () => connectWebsocket());
  })();

  const userMapping = new Map<string, string>();
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channelId !== client.config.messaging.channel.discord) return;

    const res: {
      message_id: string;
    } = await ofetch(
      `https://api.compensationvr.tk/api/messaging/channels/${client.config.messaging.channel.ingame}/messages`,
      {
        method: "PUT",
        body: {
          content: `${message.author.tag}: ${message.content}`,
        },
        headers: {
          Authorization: `Bearer ${client.config.messaging.token}`,
        },
      },
    );

    userMapping.set(message.id, res.message_id);
  });

  client.on("messageUpdate", async (_, message) => {
    if (!message.author || message.author.bot) return;
    if (message.channelId !== client.config.messaging.channel.discord) return;

    const id = userMapping.get(message.id);
    if (!id) return;

    await ofetch(`https://api.compensationvr.tk/api/messaging/messages/${id}`, {
      method: "PATCH",
      body: {
        content: `${message.author.tag}: ${message.content}`,
      },
      headers: {
        Authorization: `Bearer ${client.config.messaging.token}`,
      },
    });
  });

  client.on("messageDelete", async (message) => {
    if (!message.author || message.author.bot) return;
    if (message.channelId !== client.config.messaging.channel.discord) return;

    const id = userMapping.get(message.id);
    if (!id) return;

    await ofetch(`https://api.compensationvr.tk/api/messaging/messages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${client.config.messaging.token}`,
      },
    });
  });
}
