const { cmd, commands } = require("../command");

// --- 🛡️ Core Admin Check Helper Function ---
const checkAdminStatus = async (zanta, from, reply, isGroup, m, requireUserAdmin = true) => {
    if (!isGroup) {
        reply("*This command can only be used in a Group!* 🙁");
        return false;
    }

    try {
        // 1. Group Metadata නැවත Fetch කරයි (Cache එක නොසලකා හැරීමට)
        let groupMeta = await zanta.groupMetadata(from);
        const botJid = zanta.user.id;
        const senderJid = m.sender; 
        
        // 2. Admin ලැයිස්තුව සොයා ගනියි
        const admins = groupMeta.participants.filter(p => p.admin !== null).map(p => p.id);
        const isBotAdminNew = admins.includes(botJid);
        const isUserAdminNew = admins.includes(senderJid);

        if (!isBotAdminNew) {
            reply("*I need to be an Admin in this group to use this command!* 🤖❌");
            return false;
        }
        
        // 3. User Admin අවශ්‍ය නම් පරීක්ෂා කරයි
        if (requireUserAdmin && !isUserAdminNew) {
            reply("*You must be an Admin to use this command!* 👮‍♂️❌");
            return false;
        }

        return true; // සියල්ල සාර්ථකයි
        
    } catch (e) {
        console.error("Error fetching Group Metadata for Admin check:", e);
        reply("*Error:* Failed to check admin status. Please try again. 😔");
        return false;
    }
};

const getTargetJid = (mentionedJid, quoted) => {
    let targetJid = null;
    if (mentionedJid && mentionedJid.length > 0) {
        targetJid = mentionedJid[0];
    } else if (quoted) {
        targetJid = quoted.sender;
    }
    return targetJid;
};

// --- KICK COMMAND ---
cmd(
  {
    pattern: "kick",
    alias: ["remove"],
    react: "👋",
    desc: "Kicks a mentioned/replied user from the group.",
    category: "group",
    filename: __filename,
  },
  async (zanta, mek, m, { from, reply, isGroup, isAdmins, mentionedJid, quoted }) => {
    // User Admin අවශ්‍යයි (requireUserAdmin default = true)
    if (!await checkAdminStatus(zanta, from, reply, isGroup, m)) return;

    try {
      const targetJid = getTargetJid(mentionedJid, quoted);

      if (!targetJid) {
        return reply("*Please mention or reply to the user you want to kick.* 🧑‍💻");
      }
      
      reply("*Kicking user... 👋*");
      
      const response = await zanta.groupParticipantsUpdate(from, [targetJid], "remove");
      
      if (response && response[0] && response[0].status === '403') {
          return reply("*Failed to kick. The target is likely an owner or a higher-level admin.* 😔");
      }
      
      return reply(`*User successfully kicked! 🫡✅*`);
      
    } catch (e) {
      console.error(e);
      reply(`*Error:* Failed to perform the kick operation. ${e.message || e}`);
    }
  }
);

// --- PROMOTE COMMAND ---
cmd(
  {
    pattern: "promote",
    react: "👑",
    desc: "Promotes a mentioned/replied user to Group Admin.",
    category: "group",
    filename: __filename,
  },
  async (zanta, mek, m, { from, reply, isGroup, isAdmins, mentionedJid, quoted }) => {
    if (!await checkAdminStatus(zanta, from, reply, isGroup, m)) return;

    try {
      const targetJid = getTargetJid(mentionedJid, quoted);

      if (!targetJid) {
        return reply("*Please mention or reply to the user you want to promote.* 👑");
      }
      
      reply("*Promoting user... ⬆️*");
      
      await zanta.groupParticipantsUpdate(from, [targetJid], "promote");
      
      return reply(`*User successfully promoted to Admin! 👑✅*`);
      
    } catch (e) {
      console.error(e);
      reply(`*Error:* Failed to perform the promote operation. ${e.message || e}`);
    }
  }
);

// --- DEMOTE COMMAND ---
cmd(
  {
    pattern: "demote",
    react: "🔻",
    desc: "Demotes a mentioned/replied Group Admin to a regular member.",
    category: "group",
    filename: __filename,
  },
  async (zanta, mek, m, { from, reply, isGroup, isAdmins, mentionedJid, quoted }) => {
    if (!await checkAdminStatus(zanta, from, reply, isGroup, m)) return;

    try {
      const targetJid = getTargetJid(mentionedJid, quoted);

      if (!targetJid) {
        return reply("*Please mention or reply to the Admin you want to demote.* 🔻");
      }
      
      reply("*Demoting user... ⬇️*");
      
      await zanta.groupParticipantsUpdate(from, [targetJid], "demote");
      
      return reply(`*Admin successfully demoted! 🧑‍💻✅*`);
      
    } catch (e) {
      console.error(e);
      reply(`*Error:* Failed to perform the demote operation. ${e.message || e}`);
    }
  }
);
