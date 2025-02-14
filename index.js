const { Client, IntentsBitField } = require('discord.js');
const { token, channelid } = require("./config.json")
const chalk = require("chalk");
const axios = require('axios');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(chalk.red`[START]` + ` Bot Aktif`);
  client.user.setActivity(`Cexha | Deepseek`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== channelid) return;
  if (message.content.startsWith('!')) return;

  let conversationLog = [{ role: 'system', content: 'tatlış bot.' }];

  try {
    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
      if (message.content.startsWith('!')) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id !== message.author.id) return;

      conversationLog.push({
        role: 'user',
        content: msg.content,
      });
    });

    const url = 'https://api.blackbox.ai/api/chat';
    const data = {
      messages: conversationLog,
      model: 'deepseek-ai/DeepSeek-R1',
      max_tokens: '1024'
    };

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post(url, data, config);
    console.log("API Response:", response.data);

    if (!response.data || typeof response.data !== 'string') {
      console.log("Geçersiz yanıt formatı:", response.data);
      return message.reply("Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.");
    }

    message.reply(response.data);
  } catch (error) {
    console.log(`ERR: ${error}`);
    message.reply("Bir hata oluştu. Lütfen tekrar deneyin.");
  }
});

client.login(token);
