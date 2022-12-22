import { ApplicationCommandOptionData, ChatInputCommandInteraction, Client, ClientOptions, ColorResolvable, EmbedField, EmbedFooterOptions } from "discord.js";

export interface CommandOptions {
  name: string;
  description: string;
  options?: ApplicationCommandOptionData[];
  dm?: boolean;
  su?: boolean;
  noAck?: boolean;
  ephemeral?: boolean;
  handler: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export class Command {
  public name: string;
  public description: string;
  public options?: ApplicationCommandOptionData[];
  public dm?: boolean = true;
  public su?: boolean;
  public noAck?: boolean = false;
  public ephemeral?: boolean = false;
  public handler: (interaction: ChatInputCommandInteraction) => Promise<void>;

  public constructor(co: CommandOptions) {
    this.name = co.name;
    this.description = co.description;
    this.options = co.options;
    this.dm = co.dm;
    this.su = co.su;
    this.noAck = co.noAck;
    this.ephemeral = co.ephemeral;
    this.handler = co.handler;
  }
}

// this is not at all complete, just everything i need
export interface User {
  username: string;
  nickname: string;
  tag: string;
  bio: string;
  pronouns: string;
  profile_picture_id: string;
}

export interface Item {
  _id: string;
  id: string;
  name: string;
  tags: string[];
  clothing_item_uuid:	string;
  rarity:	string;
  is_purchasable: boolean;
  is_transferrable: boolean;
  is_refundable: boolean;
  is_giftable: boolean;
  equippable: boolean;
  use_slot: string;
  buy_price: number
  refund_price: number
  gift_price: number
  listed_in_store: boolean
  resources_pic_id: string;
}

export interface Room {
  _id: string;
  name: string;
  description: string;
  creator_id: string;
  tags: string[];
  visits: number;
  created_at: number;
  cover_image_id: string;
  contentFlags: unknown; // i don't care about this really
}

export interface TokenData {
  username: string;
  id: string;
  developer: boolean;
}

interface MessageContent {
  _id: string;
  author: string;
  content: string;
  server: string;
  channel: string;
  posted_at: number;
}

interface WebSocketMessageSent {
  code: "message_sent";
  data: {
    server_id: string;
    channel_id: string;
    message_id: string;
    message_content: MessageContent;
  };
}

// export type WebSocketMessageEdited = Omit<WebSocketMessageSent, "code"> & { code: "message_edited" };
interface WebSocketMessageEdited {
  code: "message_edited";
  data: {
    server_id: string;
    channel_id: string;
    message_id: string;
    message_content: MessageContent;
  };
}

interface WebSocketMessageDeleted {
  code: "message_deleted";
  data: {
    server_id: string;
    channel_id: string;
    message_id: string;
  };
}

export type WebSocketMessage = WebSocketMessageSent | WebSocketMessageEdited | WebSocketMessageDeleted;

export type StatusEmbedType = "info" | "success" | "warn" | "error";

export interface StatusEmbedOptions {
  type: StatusEmbedType;
  title?: string;
  description?: string;
  fields?: EmbedField[];
  footer?: EmbedFooterOptions;
  color?: ColorResolvable;
}

export interface Config {
  token: string;
  sudoers: string[];
  log: string;
  messaging: {
    token: string;
    channel: {
      discord: string;
      ingame: string;
    };
    webhook: {
      id: string;
      token: string;
    }
  };
}

export interface CustomClientOptions extends ClientOptions {
  config: Config;
}

export class CustomClient extends Client {
  config: Config;

  public constructor(options: CustomClientOptions) {
    super(options);

    this.config = options.config;
  }
}