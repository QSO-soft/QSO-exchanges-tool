# Telegram Message Sender

A module for sending messages to Telegram using the Telegram Bot API. This module enables sending messages to specified chats using the Telegram Bot API.

# Creating a Telegram Bot

To create a Telegram bot, follow these steps:

1. **Find BotFather** :
   Open Telegram and search for "BotFather" or follow this [BotFather link](https://t.me/BotFather).
2. **Start a Conversation with BotFather** :
   Press the "Start" button or send the command /start to initiate a conversation with BotFather.
3. **Create a New Bot** :
   Send the command /newbot to create a new bot.
4. **Give Your Bot a Name** :
   BotFather will prompt you to enter a name for your bot. This name will be displayed in chats and contact lists.
5. **Provide a Unique Username for Your Bot** :
   BotFather will ask you for a unique username for your bot. The username should end with "bot", for example, "my_cool_bot".
6. **Get TELEGRAM_BOT_TOKEN** :
   After successfully creating the bot, BotFather will provide you with an access token. This is an important and secret key that allows you to manage your bot.
6. **Start Your Bot** :
   It's also important to run the bot you've created because without it, you won't be able to receive messages.

## Token

```
Use this token to access the HTTP API:
298328190:AAF4gEplkksKGFHNucC5M0W0H5OhjhYRKvK1zMJE
Keep your token secure and store it safely, it can be used by anyone to control your bot.
```

Put it to into `global.js ` -> `TELEGRAM`  -> `token` and save smwhere to restore in case you would loose it.

## Chat ids

`Chat Ids` can be defined in `global.js` file to send messages to defined list of users ONLY. In case we not define it in `global.js` it would be taken from chat itself. It will take all users, which write smth into your chatBot.

In case you don't know how to get chatId, just run script, which is using `sendMsgToTG `  with logger and find in logs next line

```
SUCCESS | [Telegram] [sendMsgToTG] [succeeded] - We retrieved next chat IDs: [8724422346,82386190]
```

Pick this part `[8724422346,82386190]` and put it into `global.js ` -> `TELEGRAM`  -> `IDs`. It will prevent updating list of subscribers.

## Function Description

### `sendMsgToTG({ message, logger, logTemplate })`

Sends a message to the specified Telegram chats.

* `message`: The text message to send.
* `logger` (optional): A logger object for recording logs.
* `logTemplate` (optional): A logging template for formatting the message.

Example:

```
sendMsgToTG({
message: 'It works 444!!!',
// NOTE to send massages silently, just not pass logger
logger,
// NOTE logTemplate prettify, not only logs, but messages, which we send to TG as well
logTemplate: { id: '0001 ID', status: 'succeeded', action: 'depositToOkx', moduleName: 'OKX deposit' },
});
```
