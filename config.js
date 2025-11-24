const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "tFkwgDDA#tju3k6YR4QPcQICPzirVFHh4xqndTgKmNdzpszk3wws",
ALIVE_IMG: process.env.ALIVE_IMG || "https://github.com/Akashkavindu/ZANTA_MD/blob/main/images/ChatGPT%20Image%20Nov%2020,%202025,%2009_47_50%20PM.png?raw=true",
ALIVE_MSG: process.env.ALIVE_MSG || "*Hello👋...ZANTA-MD Is Alive Now😍*\n\n*You can contact me using this link*\n\nhttp://wa.me/+94743404814?text=*Hey__ZANTA*\n\n*You can join my whatsapp group*\n\n*https://chat.whatsapp.com/EChgJJtPHbY8IvrHApocWc*\n\n*You can join Our Whatsapp Chanel*\n\n*https://whatsapp.com/channel/0029VbBc42s84OmJ3V1RKd2B*\n\n> ZANTA MD WA BOT",
BOT_OWNER: '94771810698',  // Replace with the owner's phone number



};
