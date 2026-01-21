require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Events } = require('discord.js');

// Initialize the client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const verdicts = ["BANNED", "GG WP", "REPORTED", "CARRIED", "LAGGING", "HARDSTUCK", "CRITICAL HIT"];
const actions = [
    "Sent to the low-priority queue for 24 hours.",
    "Force-fed a 999ms ping for the next match.",
    "Account reset to Level 1 Tutorial.",
    "Awarded a 'Carry' badge and 500 XP.",
    "Sentenced to 10 matches of Bronze-tier lobbies.",
    "Keyboard lights set to a distracting strobe mode."
];
const colors = [0xFF0000, 0x00FF00, 0xFFFF00, 0x0000FF, 0x9B59B6];

// Event: Once the bot successfully connects to Discord
client.once(Events.ClientReady, (readyClient) => {
    console.log(`⚖️  The Judge is online as ${readyClient.user.tag}!`);
});

// Event: Listen for messages sent in the server
client.on(Events.MessageCreate, async (message) => {
    // Ignore messages from other bots or messages that don't start with !judge
    if (message.author.bot || !message.content.startsWith('!judge')) return;

    // Extract the subject being judged (everything after the command)
    const subject = message.content.replace('!judge', '').trim();

    // Ensure the user provided something to judge
    if (!subject) {
        return message.reply("Who is on trial? Provide a subject! (e.g., `!judge Camping`) ");
    }

    // Select random outcomes from our arrays
    const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Construct the Discord Embed
    const tribunalEmbed = new EmbedBuilder()
        .setColor(randomColor)
        .setTitle('⚖️ TRIBUNAL FINAL VERDICT')
        .setDescription(`The case regarding **${subject}** has been closed.`)
        .addFields(
            { name: 'Verdict', value: `\`${randomVerdict}\``, inline: true },
            { name: 'Sentence', value: randomAction, inline: true }
        )
        .setTimestamp()
        .setFooter({
            text: 'Gaming Judicial System',
            iconURL: client.user.displayAvatarURL()
        });

    // Send the final result back to the channel
    try {
        await message.channel.send({ embeds: [tribunalEmbed] });
    } catch (error) {
        console.error("Error sending embed:", error);
    }
});

// Authenticate with Discord using the token from .env
client.login(process.env.TOKEN);
