require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Events } = require('discord.js');

// Initialize the Discord client with required gateway intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Tribunal outcome pools
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

// Simple in-memory storage for judgments
// Key = subject.toLowerCase(), value = verdict data
const judgmentHistory = new Map();

// Helper: return a random item from an array
function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Event: Fired once the bot successfully connects to Discord
client.once(Events.ClientReady, (readyClient) => {
    console.log(`⚖️  The Judge is online as ${readyClient.user.tag}!`);
});

// Event: Listen for messages sent in the server
client.on(Events.MessageCreate, async (message) => {
    // Ignore bot messages or messages without the command prefix
    if (message.author.bot || !message.content.startsWith('!')) return;

    // Parse command name and subject from the message
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const subjectRaw = args.join(' ').trim();
    const subject = subjectRaw.toLowerCase();

    // !judge command
    if (command === 'judge') {
        // Ensure the user provided something to judge
        if (!subjectRaw) {
            return message.reply("Who is on trial? Provide a subject! (e.g., `!judge Camping`) ");
        }

        const existing = judgmentHistory.get(subject);

        // Check if the subject has already been judged
        if (existing) {
            if (existing.appealed) {
                return message.reply(`**${subjectRaw}** has already been judged **and appealed**. Case closed.`);
            } else {
                return message.reply(`**${subjectRaw}** has already been judged. Use \`!appeal ${subjectRaw}\` if you disagree.`);
            }
        }

        const randomVerdict = getRandom(verdicts);
        const randomAction = getRandom(actions);
        const randomColor = getRandom(colors);

        // Construct the Discord Embed
        const tribunalEmbed = new EmbedBuilder()
            .setColor(randomColor)
            .setTitle('⚖️ TRIBUNAL FINAL VERDICT')
            .setDescription(`The case regarding **${subjectRaw}** has been closed.`)
            .addFields(
                { name: 'Verdict', value: `\`${randomVerdict}\``, inline: true },
                { name: 'Sentence', value: randomAction, inline: true }
            )
            .setTimestamp()
            .setFooter({
                text: 'Gaming Judicial System',
                iconURL: client.user.displayAvatarURL()
            });

        try {
            await message.channel.send({ embeds: [tribunalEmbed] });

            // Remember this judgment for possible appeal (one time only)
            judgmentHistory.set(subject, {
                verdict: randomVerdict,
                action: randomAction,
                appealed: false
            });

        } catch (error) {
            console.error("Error sending embed:", error);
        }
    }

    // !appeal command
    else if (command === 'appeal') {
        // Ensure the user provided something to appeal
        if (!subjectRaw) {
            return message.reply("What are you appealing? Provide a subject! (e.g., `!appeal Camping`) ");
        }

        const previous = judgmentHistory.get(subject);

        // Ensure a prior judgment exists for this subject
        if (!previous) {
            return message.reply(`No previous judgment found for "${subjectRaw}". Judge it first!`);
        }

        // Check if subject have already been appealed
        if (previous.appealed) {
            return message.reply(`**${subjectRaw}** has already been appealed. Case is now final.`);
        }

        const appealOutcomes = ["GRANTED", "DENIED"];
        // Select random outcome
        const appealResult = getRandom(appealOutcomes);

        let finalAction = previous.action;
        let appealNote = '';

        if (appealResult === "GRANTED") {
            finalAction = "Sentence overturned! Enjoy your freedom.";
            appealNote = "Full pardon granted.";
        } else {
            appealNote = "Appeal denied. Original sentence stands.";
        }

        // Construct the Discord Embed
        const appealEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('⚖️ APPEAL VERDICT')
            .setDescription(`Appeal regarding **${subjectRaw}** has been reviewed.\nOriginal: \`${previous.verdict}\``)
            .addFields(
                { name: 'Appeal Result', value: `\`${appealResult}\``, inline: true },
                { name: 'Final Sentence', value: finalAction, inline: true }
            )
            .setTimestamp()
            .setFooter({
                text: 'Gaming Appellate Court',
                iconURL: client.user.displayAvatarURL()
            });

        try {
            await message.channel.send({ embeds: [appealEmbed] });

            // Mark case as appealed (one-time only) and update final outcome
            judgmentHistory.set(subject, {
                verdict: appealResult,
                action: finalAction,
                appealed: true
            });

        } catch (error) {
            console.error("Error sending appeal embed:", error);
        }
    }

    // !cases command
    else if (command === 'cases') {
        // Ensure court has cases
        if (judgmentHistory.size === 0) {
            return message.reply("The court is empty — no active cases right now! ⚖️");
        }

        const lines = [];

        for (const [subject, data] of judgmentHistory) {
            const status = data.appealed ? 'final (appealed)' : 'open for appeal';
            lines.push(`**${subject}** → \`${data.verdict}\` — ${status}`);
        }

        // Construct the Discord Embed
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('⚖️ Active Judgments')
            .setDescription(lines.join('\n'))
            .setTimestamp();

        message.channel.send({ embeds: [embed] }).catch(err => {
            console.error(err);
        });
    }
});

// Authenticate with Discord using the token from .env
client.login(process.env.TOKEN);
