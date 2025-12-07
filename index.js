const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
jidNormalizedUser,
getContentType,
fetchLatestBaileysVersion,
Browsers,
WAMessageStubType 
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const express = require('express');
const axios = require('axios');
const path = require('path');
const qrcode = require('qrcode-terminal');

const config = require('./config');
const { sms } = require('./lib/msg');
const {
getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson
} = require('./lib/functions');
const { File } = require('megajs');
const { commands, replyHandlers } = require('./command');

const app = express();
const port = process.env.PORT || 8000;

const prefix = '.';
const ownerNumber = ['94743404814'];
const authPath = path.join(__dirname, '/auth_info_baileys/');
const credsPath = path.join(authPath, 'creds.json');


async function ensureSessionFile() {
if (!fs.existsSync(credsPath)) {
if (!config.SESSION_ID) {
console.error('❌ SESSION_ID env variable is missing. Cannot restore session.');
process.exit(1);
}

console.log("🔄 creds.json not found. Downloading session from MEGA...");

const sessdata = config.SESSION_ID;

// MEGA download promise/async ක්‍රමයට වෙනස් කර ඇත (Non-blocking)
try {
const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
const data = await new Promise((resolve, reject) => {
filer.download((err, data) => {
if (err) reject(err);
resolve(data);
});
});

fs.mkdirSync(authPath, { recursive: true });
fs.writeFileSync(credsPath, data);
console.log("✅ Session downloaded and saved. Connecting...");
connectToWA();
} catch (err) {
console.error("❌ Failed to download/save session file from MEGA:", err);
process.exit(1);
}
} else {
connectToWA();
}
}

async function connectToWA() {
console.log("Connecting ZANTA-MD 🧬...");
const { state, saveCreds } = await useMultiFileAuthState(authPath);
const { version } = await fetchLatestBaileysVersion();

const zanta = makeWASocket({
logger: P({ level: 'silent' }),
printQRInTerminal: true, // 💡 QR Code Terminal එකේ Print කරන්න
browser: Browsers.macOS("Firefox"),
auth: state,
version,
syncFullHistory: true,
markOnlineOnConnect: true,
generateHighQualityLinkPreview: true,
});

zanta.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect, qr } = update;

if (qr) {
console.log('🤖 Scan this QR code:');
qrcode.generate(qr, { small: true });
}

if (connection === 'close') {
const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
console.log('Connection closed. Reconnect:', shouldReconnect);
if (shouldReconnect) {
connectToWA();
} else {
console.log('❌ Connection logged out. Please delete auth_info_baileys and restart.');
}
} else if (connection === 'open') {
console.log('✅ ZANTA-MD connected to WhatsApp');

const up = `ZANTA-MD connected ✅\n\nPREFIX: ${prefix}`;
await zanta.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
image: { url: `https://github.com/Akashkavindu/ZANTA_MD/blob/main/images/ChatGPT%20Image%20Nov%2021,%202025,%2001_21_32%20AM.png?raw=true` },
caption: up
});

fs.readdirSync("./plugins/").forEach((plugin) => {
if (path.extname(plugin).toLowerCase() === ".js") {
try {
require(`./plugins/${plugin}`);
} catch (e) {
console.error(`Error loading plugin ${plugin}:`, e);
}
}
});
}
});

zanta.ev.on('creds.update', saveCreds);

zanta.ev.on('messages.upsert', async ({ messages }) => {

// 💡 Fix: System Message Logic (mek.messageStubType එකක් තිබේ නම් Ignore කරන්න)
const mek = messages[0];

if (mek.messageStubType) {
console.log(`Ignoring System Message Stub Type: ${mek.messageStubType}`);
return; 
}

if (!mek || !mek.message) return;

// Ephemeral Message Handling
mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;
if (mek.key.remoteJid === 'status@broadcast') return;

const m = sms(zanta, mek); // Simplified message object
const type = getContentType(mek.message);
const from = mek.key.remoteJid;
const body = type === 'conversation' ? mek.message.conversation : mek.message[type]?.text || mek.message[type]?.caption || '';
const isCmd = body.startsWith(prefix);

// 💡 Debug Log: Command Detection Check
console.log(`[DEBUG] Prefix: ${prefix}, Message Body (Start): ${body.slice(0, 30)}, Is Command: ${isCmd}`);

const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
const args = body.trim().split(/ +/).slice(1);
const q = args.join(' ');

const sender = mek.key.fromMe ? zanta.user.id : (mek.key.participant || mek.key.remoteJid);
const senderNumber = sender.split('@')[0];
const isGroup = from.endsWith('@g.us');
const botNumber = zanta.user.id.split(':')[0];
const pushname = mek.pushName || 'Sin Nombre';
const isMe = botNumber.includes(senderNumber);

// Owner Check: ownerNumber Array එකේ ඇති අංක senderNumber සමඟ සැසඳීම
const isOwner = ownerNumber.includes(senderNumber) || isMe;

const botNumber2 = await jidNormalizedUser(zanta.user.id);

// 💡 Fix: Group Metadata Retrieval (Error Handling & Direct Admin Check)
let groupMetadata = null;
let participants = [];
let groupAdmins = [];
let isBotAdmins = false; // 💡 මෙහිදී අගය වෙනස් කරයි
let isAdmins = false;
let groupName = '';

if (isGroup) {
groupMetadata = await zanta.groupMetadata(from).catch((e) => {
console.error("Error fetching group metadata:", e.message);
return null; 
});

if (groupMetadata) {
groupName = groupMetadata.subject;
participants = groupMetadata.participants;
groupAdmins = getGroupAdmins(participants); 

// 🚀 ALTERNATIVE BOT ADMIN CHECK (ප්‍රධාන වෙනස මෙන්න)
// Participants List එකේ Bot ගේ JID එකට අදාළ object එක සොයා Admin property එක පරීක්ෂා කරයි.
const botParticipant = participants.find(p => p.id === botNumber2);
isBotAdmins = botParticipant?.admin !== null && botParticipant?.admin !== undefined;

// Sender Admin Check
isAdmins = groupAdmins.includes(sender);
}
}

const reply = (text) => zanta.sendMessage(from, { text }, { quoted: mek });
const quotedMessage = m.quoted; // m object එකේ quoted message එක
const mentionedJid = mek.message.extendedTextMessage?.contextInfo?.mentionedJid || []; 

if (isCmd) {
console.log(`[CMD DETECTED] Name: ${commandName}, Sender: ${pushname}, Group: ${isGroup ? 'Yes' : 'No'}`);

const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
if (cmd) {
if (cmd.react) zanta.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
try {
cmd.function(zanta, mek, m, {
from, quoted: quotedMessage, mentionedJid, body, isCmd, command: commandName, args, q,
isGroup, sender, senderNumber, botNumber2, botNumber, pushname,
isMe, isOwner, groupMetadata, groupName, participants, groupAdmins,
isBotAdmins, isAdmins, reply,
});
} catch (e) {
console.error("[PLUGIN EXECUTION ERROR]", e);
reply(`❌ Command එක ක්‍රියාත්මක කිරීමේදී දෝෂයක් ඇතිවිය: ${e.message || 'Unknown Error'}`);
}
}
}

const replyText = body;
for (const handler of replyHandlers) {
if (handler.filter(replyText, { sender, message: mek })) {
try {
await handler.function(zanta, mek, m, {
from, quoted: quotedMessage, body: replyText, sender, reply,
});
break;
} catch (e) {
console.log("Reply handler error:", e);
}
}
}
});
}

ensureSessionFile();

app.get("/", (req, res) => {
res.send("Hey, ZANTA-MD started✅");
});

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
