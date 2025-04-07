const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const prefix = '!';

client.on('messageCreate', message => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Command trigger for '!username'
    if (message.content.startsWith(`${prefix}username`)) {
        const args = message.content.split(' ');

        // Check if the username is provided
        if (args.length < 2) {
            return message.reply('Please provide a username!');
        }

        const username = args.slice(1).join(' ').trim();  // Handle multi-word usernames
        const filePath = './users.txt';

        // Read the txt file asynchronously
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return message.reply('Sorry, there was an error reading the file!');
            }

            // Log the raw file content to check for any hidden characters or issues
            console.log("Raw file content:", data);

            // Strip any carriage returns or extra spaces that might be in the file
            const cleanedData = data.replace(/\r/g, '').trim();

            // Split the file content into blocks (each block represents a user)
            const users = cleanedData.split('\n\n');
            let found = false;

            console.log("Looking for username:", username); // Debugging log

            // Search for the username in the file
            for (const userBlock of users) {
                const lines = userBlock.split('\n');
                const userNameLine = lines.find(line => line.startsWith('Username:'));
                const ipLine = lines.find(line => line.startsWith('IP:'));

                if (userNameLine && ipLine) {
                    const userName = userNameLine.replace('Username: ', '').trim();
                    const ip = ipLine.replace('IP: ', '').trim();

                    // Debugging: Log username lengths and actual content to compare
                    console.log(`Comparing '${userName}' (length: ${userName.length}) with '${username}' (length: ${username.length})`);

                    // Case-insensitive comparison
                    if (userName.toLowerCase() === username.toLowerCase()) {  
                        found = true;

                        // Create the embed with a description (without XUID)
                        const embed = new EmbedBuilder()
                            .setColor(0x0099FF) // Blue color
                            .setTitle('User Information')
                            .setDescription(`
                                Here is the information for the username **${username}**:

                                **IP**: ${ip}
                                **User**: ${userName}
                            `)
                            .addFields(
                                { name: '[1] Username', value: userName, inline: true },
                                { name: '[2] IP', value: ip, inline: true }
                            )
                            .setFooter({ text: 'Data from user.txt' });

                        // Send the embed as a reply
                        return message.reply({ embeds: [embed] });
                    } else {
                        console.log(`Usernames don't match: ${userName} !== ${username}`); // Debugging log for mismatch
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
client.login('YOUR_TOKEN');
