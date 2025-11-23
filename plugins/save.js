const { cmd, commands } = require("../command");

cmd(
  {
    pattern: "save",
    alias: ["resend"],
    react: "💾",
    desc: "Saves (Resends) a quoted Status or View Once media.",
    category: "utility",
    filename: __filename,
  },
  async (
    zanta,
    mek,
    m,
    {
      from,
      quoted,
      reply,
    }
  ) => {
    try {
      // Check if a message is quoted
      if (!quoted) {
        return reply("*Please reply to the Status/View Once Photo/Video you want to save.* 💾");
      }

      // Check if the quoted message is a view once message
      const isViewOnce = quoted.msg && quoted.msg.viewOnce;
      
      // Check if the quoted message is from a status (key.fromMe and a remote JID in key.participant/key.remoteJid)
      // Note: Status messages are often hard to reliably detect without checking the message key itself 
      // or using a dedicated status reading method. For this structure, we'll primarily focus on media type.
      
      const quotedMessageType = quoted.mtype;

      let mediaType = "";
      let mediaData = null;
      let caption = quoted.caption || "";
      
      // Determine the type of media and extract data
      if (isViewOnce) {
        // For view once messages, the content is inside quoted.msg.message
        const viewOnceMessage = quoted.msg.message;
        
        if (viewOnceMessage.imageMessage) {
          mediaType = "image";
          mediaData = viewOnceMessage.imageMessage;
          caption = mediaData.caption || caption;
        } else if (viewOnceMessage.videoMessage) {
          mediaType = "video";
          mediaData = viewOnceMessage.videoMessage;
          caption = mediaData.caption || caption;
        }
      } else if (quotedMessageType === 'imageMessage') {
        mediaType = "image";
        mediaData = quoted.msg;
      } else if (quotedMessageType === 'videoMessage') {
        mediaType = "video";
        mediaData = quoted.msg;
      }

      if (!mediaData || !mediaType) {
        return reply("*The quoted message is not a recognizable Photo, Video, or View Once media.* ☹️");
      }
      
      // Prepare the message options
      let messageOptions = {
        caption: `*💾 Saved Media:*\n${caption}`,
      };
      
      // Get buffer/stream/url from mediaData (assuming the quoted object structure handles it)
      // In a typical environment, quoted.download() would be used, but since we are simulating the structure, 
      // we'll rely on the existing properties in quoted.msg.
      
      const mediaBuffer = await zanta.downloadMediaMessage(quoted);
      
      if (!mediaBuffer) {
          return reply("*Could not download media from the quoted message.* 🙁");
      }

      // Resend the media
      if (mediaType === "image") {
        await zanta.sendMessage(from, { image: mediaBuffer, ...messageOptions }, { quoted: mek });
      } else if (mediaType === "video") {
        await zanta.sendMessage(from, { video: mediaBuffer, ...messageOptions }, { quoted: mek });
      } else {
        return reply("*Could not determine the media type for resending.* 🙁");
      }
      
      return reply("*> වැඩේ හරි 🙃✅*");
      
    } catch (e) {
      console.error(e);
      reply(`*Error:* ${e.message || e}`);
    }
  }
);
