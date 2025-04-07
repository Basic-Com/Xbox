const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const prefix = '!';

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content.startsWith(`${prefix}username`)) {
        const args = message.content.split(' ');

        if (args.length < 2) {
            return message.reply('Please provide a username!');
        }

        const username = args.slice(1).join(' ').trim();
        const filePath = './users.txt';

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return message.reply('Sorry, there was an error reading the file!');
            }

            const cleanedData = data.replace(/\r/g, '').trim();
            const users = cleanedData.split('\n\n');
            let found = false;

            for (const userBlock of users) {
                const lines = userBlock.split('\n');
                const userNameLine = lines.find(line => line.startsWith('Username:'));
                const ipLine = lines.find(line => line.startsWith('IP:'));

                if (userNameLine && ipLine) {
                    const userName = userNameLine.replace('Username: ', '').trim();
                    const ip = ipLine.replace('IP: ', '').trim();

                    if (userName.toLowerCase() === username.toLowerCase()) {
                        found = true;

                        // Check for other users with same IP
                        const sameIPUsers = [];
                        for (const block of users) {
                            const innerLines = block.split('\n');
                            const otherUserLine = innerLines.find(line => line.startsWith('Username:'));
                            const otherIPLine = innerLines.find(line => line.startsWith('IP:'));

                            if (otherUserLine && otherIPLine) {
                                const otherUser = otherUserLine.replace('Username: ', '').trim();
                                const otherIP = otherIPLine.replace('IP: ', '').trim();

                                if (otherIP === ip && otherUser.toLowerCase() !== username.toLowerCase()) {
                                    sameIPUsers.push(otherUser);
                                }
                            }
                        }

                const embed = new EmbedBuilder()
                    .setColor(0x1E90FF) // DodgerBlue color
                    .setTitle(`🕵️ IP Intelligence Report`)
                    .setDescription(
                        `**IP Report for User:** \`${username}\`\n` +
                        `**IP Address Queried:** \`${ip}\`\n\n` 
                    )
                    .setThumbnail('https://www.svgrepo.com/show/51244/ip-address.svg') // Optional icon for IP
                    .setImage('https://www.svgrepo.com/show/51733/earth-globe.svg') // Optional image for the background (Earth/World map)
                    .addFields(
                        {
                            name: '🧍 **User Information**',
                            value: `**Username:** \`${userName}\`\n` +
                                   `**IP Address:** \`${ip}\`\n` +
                                   `**Gamertag:** \`${username}\`\n` +
                                   `**Found at:** <t:${Math.floor(Date.now() / 1000)}:f>`, // Real timestamp of the action
                            inline: true
                        },
                        {
                            name: '📁 **Other Users with this IP**',
                            value: sameIPUsers.length > 0
                                ? sameIPUsers.map(u => `• \`${u}\``).join('\n') // List of users with the same IP
                                : '_No other users found._',
                            inline: true
                        },
                        {
                            name: '📅 **Timestamp**',
                            value: `<t:${Math.floor(Date.now() / 1000)}:F>`, // Automatically updates the timestamp
                            inline: true
                        },
                        {
                            name: '🌐 **Advanced IP Lookup**',
                            value: `For deeper insights, use [this link](https://www.ip-tracker.org/lookup.php?ip=${ip}) to access detailed IP information, including location, ISP, and more.`,
                            inline: false
                        }
                    )
                    .setFooter({
                        text: 'Xbox Intelligence Bot - All rights reserved',
                        iconURL: 'https://img.icons8.com/ios-filled/50/monitor.png' // Optional footer icon
                    })
                    .setTimestamp(); // Automatically adds timestamp of the embed creation

                return message.reply({ embeds: [embed] });


                    }
                }
            }

            if (!found) {
                message.reply(`No information found for username: ${username}`);
            }
        });
    }
});

client.once('ready', () => {
    console.log('Bot is ready!');
});
// Replace with your bot's token

client.login('YOUR_DISCORD_TOKEN');
