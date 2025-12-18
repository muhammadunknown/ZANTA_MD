const { cmd } = require("../command");

// --- 🛡️ Group Admin Check Logic ---
// මචං, මෙතනදී index.js එකේ වගේම සරලව Admin ද නැද්ද කියලා බලනවා.
async function checkAdmins(zanta, m, from, isGroup) {
    if (!isGroup) return false;
    const groupMetadata = await zanta.groupMetadata(from);
    const participants = groupMetadata.participants;
    const groupAdmins = participants.filter(p => p.admin !== null).map(p => p.id);
    const botNumber = zanta.user.id.split(':')[0] + '@s.whatsapp.net';
    
    return {
        isBotAdmin: groupAdmins.includes(botNumber),
        isUserAdmin: groupAdmins.includes(m.sender),
    };
}

// --- MUTE COMMAND ---
cmd({
    pattern: "mute",
    alias: ["close"],
    react: "🔒",
    desc: "Closes the group messages.",
    category: "group",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup }) => {
    try {
        if (!isGroup) return reply("❌ This is not a group!");
        
        const check = await checkAdmins(zanta, m, from, isGroup);
        if (!check.isBotAdmin) return reply("❌ I need to be an **Admin** first!");
        if (!check.isUserAdmin) return reply("❌ **You** must be an Admin to use this!");

        await zanta.groupSettingUpdate(from, 'announcement');
        return reply("✅ *Group Muted! Only Admins can send messages.*");
    } catch (e) {
        reply("❌ Error: " + e.message);
    }
});

// --- UNMUTE COMMAND ---
cmd({
    pattern: "unmute",
    alias: ["open"],
    react: "🔓",
    desc: "Opens the group messages.",
    category: "group",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup }) => {
    try {
        if (!isGroup) return reply("❌ This is not a group!");
        
        const check = await checkAdmins(zanta, m, from, isGroup);
        if (!check.isBotAdmin) return reply("❌ I need to be an **Admin** first!");
        if (!check.isUserAdmin) return reply("❌ **You** must be an Admin to use this!");

        await zanta.groupSettingUpdate(from, 'not_announcement');
        return reply("✅ *Group Unmuted! Everyone can send messages.*");
    } catch (e) {
        reply("❌ Error: " + e.message);
    }
});

// --- INVITE LINK COMMAND ---
cmd({
    pattern: "invite",
    alias: ["link"],
    react: "🔗",
    desc: "Get group invite link.",
    category: "group",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup }) => {
    try {
        if (!isGroup) return reply("❌ This is not a group!");
        
        const check = await checkAdmins(zanta, m, from, isGroup);
        if (!check.isBotAdmin) return reply("❌ I need to be an **Admin** to get the link!");

        const code = await zanta.groupInviteCode(from);
        return reply(`*🔗 Group Invite Link:*\nhttps://chat.whatsapp.com/${code}`);
    } catch (e) {
        reply("❌ Error: " + e.message);
    }
});

// --- TAGALL COMMAND ---
cmd({
    pattern: "tagall",
    alias: ["all"],
    react: "🔔",
    desc: "Tags all members.",
    category: "group",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, q }) => {
    try {
        if (!isGroup) return reply("❌ This is not a group!");
        
        const groupMeta = await zanta.groupMetadata(from);
        const participants = groupMeta.participants.map(p => p.id);
        
        let messageText = `*📢 Tag All Members*\n\n*Message:* ${q || 'No Message'}\n\n`;
        for (let mem of participants) {
            messageText += ` @${mem.split('@')[0]}`;
        }

        await zanta.sendMessage(from, { 
            text: messageText, 
            mentions: participants 
        }, { quoted: mek });
        
    } catch (e) {
        reply("❌ Error: " + e.message);
    }
});
