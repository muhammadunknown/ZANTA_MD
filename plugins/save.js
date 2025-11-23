const { cmd } = require("../command");
const { downloadContentFromMessage } = require('@whiskeysockets/baileys'); // Baileys core function

// Helper function to convert Media Stream to a Buffer
async function streamToBuffer (stream) {
    return new Promise((resolve, reject) => {
        const buffers = [];
        stream.on('error', reject)
              .on('data', (data) => buffers.push(data))
              .on('end', () => resolve(Buffer.concat(buffers)))
    })
}

cmd(
    {
        pattern: "save",
        react: "✅", 
        desc: "Resend Status or One-Time View Media (Stream Download Fix)",
        category: "general",
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
            if (!quoted) {
                return reply("*කරුණාකර Status/Media Message එකකට reply කරන්න!* 🧐");
            }

            // 1. Media Object එක ලබා ගැනීම (Log එක අනුව quoted.quoted හෝ quoted.fakeObj)
            const mediaObject = quoted.quoted || quoted.fakeObj;
            let saveCaption = "*💾 Saved and Resent!*";
            
            if (!mediaObject) {
                return reply("*⚠️ Media Content එක හඳුනාගැනීමට අසමත් විය.*");
            }
            
            // 2. Media Type එක තීරණය කිරීම (Baileys downloadContentFromMessage සඳහා අවශ්‍යයි)
            const messageType = Object.keys(mediaObject)[0];
            
            if (!['imageMessage', 'videoMessage', 'documentMessage'].includes(messageType)) {
                return reply("*⚠️ යැවීමට සහය නොදක්වයි (Image, Video, Document පමණි).*");
            }
            
            // 3. Media File Download (Baileys' native function භාවිතයෙන්)
            reply("*Status Media File එක Download කරමින් (Decryption)...* ⏳");
            
            // Message Content එක download කිරීම සඳහා Baileys primitive එක ලබා ගැනීම.
            // This relies on the Baileys library being initialized correctly in ZANTA_MD.
            const stream = await downloadContentFromMessage(
                mediaObject, // The inner media message object (e.g., videoMessage)
                messageType.replace('Message', '') // The correct media type (image, video, document)
            );
            
            // Stream එක Buffer එකක් බවට පරිවර්තනය කිරීම
            const mediaBuffer = await streamToBuffer(stream);
            
            // 4. Message Options සැකසීම (Buffer භාවිතයෙන්)
            let messageOptions = {};
            
            if (messageType === 'imageMessage') {
                messageOptions = { image: mediaBuffer, caption: saveCaption };
            } else if (messageType === 'videoMessage') {
                messageOptions = { video: mediaBuffer, caption: saveCaption };
            } else if (messageType === 'documentMessage') {
                // Document සඳහා mime type සහ file name අවශ්‍ය වේ.
                const mediaData = mediaObject[messageType];
                messageOptions = { 
                    document: mediaBuffer, 
                    fileName: mediaData.fileName || 'saved_media', 
                    mimetype: mediaData.mimetype, 
                    caption: saveCaption 
                };
            }

            // 5. Message යැවීම
            await zanta.sendMessage(from, messageOptions, { quoted: mek });

            return reply("*වැඩේ හරි 🙃✅*");

        } catch (e) {
            // Debugging සඳහා error එක console එකේ පෙන්වීම අත්‍යවශ්‍යයි
            console.error("--- FINAL MEDIA DOWNLOAD ERROR ---", e);
            reply(`*Error downloading or sending media:* ${e.message || e}`);
        }
    }
);
