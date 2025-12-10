const { cmd } = require("../command");
// ඔබගේ functions.js වෙතින් sleep function එක නිවැරදිව ලබා ගනී
const { sleep } = require("../lib/functions"); 

// --- Core Helper: Animated Message Edit Function ---
async function sendAnimatedText(zanta, from, mek, messages, finalReact) {
    // 1. Initial Message එක යවන්න
    let initialMessage = await zanta.sendMessage(
        from, 
        { text: messages[0] }, 
        { quoted: mek }
    );

    const messageKey = initialMessage.key;

    // 2. Messages එකින් එක Edit කරන්න
    for (let i = 1; i < messages.length; i++) {
        const delay = i === 2 ? 1500 : 700; // සමහර Messages සඳහා වැඩි කාලයක් දෙන්න
        await sleep(delay); 

        // zanta.sendMessage(id, { text: 'text', edit: key }) මඟින් Message එක Edit කරයි
        await zanta.sendMessage(
            from,
            { text: messages[i], edit: messageKey }
        );
    }

    // 3. අවසාන Message එකට Reaction එකක් එකතු කරන්න 
    if (finalReact) {
        await zanta.sendMessage(from, { react: { text: finalReact, key: messageKey } });
    }
}


// 💖 LOVE Command
cmd(
    {
        pattern: "love",
        react: "💖",
        desc: "Sends animated message(Love)",
        category: "fun",
        filename: __filename,
    },
    async (zanta, mek, m, { from, reply, q }) => {
        try {
            const targetUser = q.trim() || m.pushName || "User";

            const messages = [
                `Typing... 💭`,
                `Thinking about ${targetUser}... ❤️`,
                `I love you! 💖`,
                `Always and forever. ✨`,
                `You are myeverythin, ${targetUser}! 😊`
            ];

            await sendAnimatedText(zanta, from, mek, messages, "😘");

        } catch (e) {
            console.error("Love Command Error:", e);
            reply(`*Error:* Failed to perform the animated text. 😔`);
        }
    }
);

// 🔥 FIRE Command
cmd(
    {
        pattern: "fire",
        react: "🔥",
        desc: "Sends animated message (fire)",
        category: "fun",
        filename: __filename,
    },
    async (zanta, mek, m, { from, reply, q }) => {
        try {
            const targetMessage = q.trim() || "ZANTA-MD ON FIRE!";

            const messages = [
                `Initiating... 🧨`,
                `[WARNING] System Overload...`,
                `🚨 ${targetMessage} 🚨`,
                `🔥🔥🔥 DANGER! 🔥🔥🔥`,
                `🤯 Mission Accomplished! 💥`
            ];

            await sendAnimatedText(zanta, from, mek, messages, "😎");

        } catch (e) {
            console.error("Fire Command Error:", e);
            reply(`*Error:* Failed to perform the animated text. 😔`);
        }
    }
);

// 😔 SAD Command
cmd(
    {
        pattern: "sad",
        react: "😔",
        desc: "Sends animated message (sad)",
        category: "fun",
        filename: __filename,
    },
    async (zanta, mek, m, { from, reply, q }) => {
        try {
            const messages = [
                `*Huh...* 💨`,
                `Feeling empty today. 🌫️`,
                `Why does it feel so heavy? 💔`,
                `I just need a moment alone... 🌧️`,
                `Today is verry Sad. 😔`
            ];

            await sendAnimatedText(zanta, from, mek, messages, "😥");

        } catch (e) {
            console.error("Sad Command Error:", e);
            reply(`*Error:* Failed to perform the animated text. 😔`);
        }
    }
);

// 😠 ANGRY Command
cmd(
    {
        pattern: "angry",
        react: "😡",
        desc: "Sends animated message (angry)",
        category: "fun",
        filename: __filename,
    },
    async (zanta, mek, m, { from, reply, q }) => {
        try {
            const target = q.trim() || "YOU";

            const messages = [
                `Checking the logs... 🤨`,
                `I don't like this at all! 🤬`,
                `HEY ${target.toUpperCase()}! 🗣️`,
                `DON'T PUSH MY LIMITS! 💣`,
                `*Deep breath*... Calming down now. 😤`
            ];

            await sendAnimatedText(zanta, from, mek, messages, "💢");

        } catch (e) {
            console.error("Angry Command Error:", e);
            reply(`*Error:* Failed to perform the animated text. 😔`);
        }
    }
);

cmd(
    {
        pattern: "loading",
        react: "⏭",
        desc: "Loading effect",
        category: "fun",
        filename: __filename,
    },
    async (zanta, mek, m, { from, reply, q }) => {
        try {
            const targetUser = q.trim() || m.pushName || "User";

            const messages = [
                `🔍 Initializing ${targetUser}...`,
                `█▒▒▒▒▒▒▒▒▒ 10%`,
                `███▒▒▒▒▒▒▒ 30%`,
                `█████▒▒▒▒▒ 50%`,
                `███████▒▒▒ 70%`,
                `█████████▒ 90%`,
                `✅ ${targetUser} Complete! (100%)`
            ];

            await sendAnimatedText(zanta, from, mek, messages, "💢");

        } catch (e) {
            console.error("Angry Command Error:", e);
            reply(`*Error:* Failed to perform the animated text. 😔`);
        }
    }
);

