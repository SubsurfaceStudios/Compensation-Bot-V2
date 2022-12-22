  ______   _______
 / ___/ | / / ___/
/ /__ | |/ / /    
\___/ |___/_/     
      bot v3      

A bot for Compensation VR (found at https://compensationvr.tk)

======== Usage ========
1. Fill out data/config.json (see Configuration)
2. Install dependencies: pnpm i
3. Build: pnpm build
4. Start the bot with: pnpm start

==== Configuration ====
The configuration file (data/config.json) has the following properties:
 - "token" The bot's Discord token.
 - "sudoers" A list of user ids permitted to use sudo commands.
 - "log" A channel to log errors that occur in.
 - "messaging" Message bridge configuration:
    - "token" A CVR token to authenticate with (must be permament)
    - "channel" Which channels to sync:
       - "discord" The discord channel to sync
       - "ingame" The CVR channel to sync
    - "webhook" Credentials for the webhook used to display in-game messages.
                Can be left out, in which case the bot generates it automatically.