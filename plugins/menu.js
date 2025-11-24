const { cmd, commands } = require("../command");

// 🖼️ MENU Image URL එක (මෙයම තබා ගන්න)
const MENU_IMAGE_URL = "https://github.com/Akashkavindu/ZANTA_MD/blob/main/images/ChatGPT%20Image%20Nov%2021,%202025,%2001_49_53%20AM.png?raw=true";

// 📚 Commands ගබඩා කරන වස්තුව (Global Cache)
const categoryMap = {}; 
const commandCategories = {};

// 🔄 Commands Load කර Category අනුව කාණ්ඩගත කිරීමේ (Grouping) ශ්‍රිතය
function loadCommands() {
    // 1. සියලු Commands, ඒවායේ Category අනුව වර්ග කිරීම
    for (let cmdName in commands) {
        const cmdData = commands[cmdName];
        const cat = cmdData.category?.toLowerCase() || "other";
        
        if (!categoryMap[cat]) categoryMap[cat] = [];
        categoryMap[cat].push({
            pattern: cmdData.pattern,
            desc: cmdData.desc || "No description"
        });
    }

    // 2. ඔබ ඉල්ලූ Manual Groups සකස් කිරීම
    // **ඔබගේ Bot එකේ ඇති Commands අනුව මේවා වෙනස් විය හැක.**
    commandCategories['1'] = { 
        name: "Owner Menu", 
        cats: ['owner', 'private'], 
        emoji: '👑' 
    };
    commandCategories['2'] = { 
        name: "Group Menu", 
        cats: ['group', 'admin'], 
        emoji: '👥' 
    };
    commandCategories['3'] = { 
        name: "Download Menu", 
        cats: ['download', 'media', 'converter'], 
        emoji: '📥' 
    };
    commandCategories['4'] = { 
        name: "Search & Tools", 
        cats: ['search', 'tools', 'misc'], 
        emoji: '🔍' 
    };
    commandCategories['5'] = { 
        name: "General & Other", 
        cats: ['main', 'misc', 'other', 'all'], 
        emoji: '📝' 
    };
}

// Commands Load කරන්නේ Bot එක ආරම්භයේදී පමණයි.
loadCommands();


// -----------------------------------------------------------

cmd(
    {
        pattern: "menu",
        react: "📜",
        desc: "Displays all available commands or a specific category.",
        category: "main",
        filename: __filename,
    },
    async (
        zanta,
        mek,
        m,
        {
            from,
            reply
        }
    ) => {
        try {
            // Check for Reply to the Menu Message (Interactive Logic)
            if (m.isReply && m.quoted.text) {
                const quotedText = m.quoted.text;
                const replyNumber = m.q?.trim(); // User's reply (e.g., '1', '2')

                // 1. Reply එක Menu එකටදැයි පරීක්ෂා කිරීම
                if (quotedText.includes("Reply to this message with the number to select a category")) {

                    if (commandCategories[replyNumber]) {
                        const selectedCat = commandCategories[replyNumber];
                        let categoryText = `*${selectedCat.emoji} ${selectedCat.name} Commands*\n\n`;
                        let count = 0;

                        // 2. අදාළ Categories වල commands එකතු කිරීම
                        selectedCat.cats.forEach(catKey => {
                            if (categoryMap[catKey]) {
                                categoryText += `\n*-- ${catKey.toUpperCase()} --*\n`;
                                categoryMap[catKey].forEach(c => {
                                    categoryText += `*◻ .${c.pattern}* : ${c.desc}\n`;
                                    count++;
                                });
                            }
                        });

                        if (count === 0) {
                             categoryText += "*⚠️ මෙම කාණ්ඩයේ කිසිදු Command එකක් සොයා ගැනීමට නොහැකි විය.*";
                        }
                        
                        // 3. Category Commands Send කිරීම
                        return await reply(categoryText.trim());

                    } else {
                        // වැරදි අංකයක් ලබා දුන් විට
                        return await reply("*❌ වැරදි අංකයක්!* කරුණාකර Menu එකේ ඇති අංකයක් Reply කරන්න.");
                    }
                }
            }


            // ----------------------------------------------------
            // Main Menu Message Generation (Custom Formatted Text)
            // ----------------------------------------------------

            let menuText = "╭━─━─━─━─━─━─━─━─━─━╮\n";
            menuText += "┃ 👑 *𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐙𝐀𝐍𝐓𝐀-𝐌𝐃* 🤖\n";
            menuText += "┃   _The Most Powerful WhatsApp Bot_\n";
            menuText += "╰━─━─━─━─━─━─━─━─━─━╯\n\n";

            menuText += "*📋 Available Categories:*\n";
            menuText += "Reply number:\n\n";
            
            // Manual Groups Add කිරීම (අංක සහ Category නාම)
            for (const [key, data] of Object.entries(commandCategories)) {
                menuText += `${key}. ${data.emoji} *${data.name}*\n`;
            }

            menuText += "\n\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n";
            menuText += "💡Reply with the number \n";
            menuText += "> © 𝟐𝟎𝟐𝟓 | 𝐀𝐤𝐚𝐬𝐡 𝐊𝐚𝐯𝐢𝐧𝐝𝐮\n"; 
            
            // SEND IMAGE + MENU TEXT
            await zanta.sendMessage(
                from,
                {
                    image: { url: MENU_IMAGE_URL },
                    caption: menuText.trim(),
                },
                { quoted: mek }
            );

        } catch (err) {
            console.error(err);
            reply("❌ Error generating menu.");
        }
    }
);
