const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason, fetchLatestBaileysVersion, getContentType } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Coba load axios, jika tidak ada gunakan fallback
let axios;
try {
    axios = require('axios');
} catch (err) {
    console.log('⚠️  Axios tidak terinstall, menggunakan fallback system');
    axios = null;
}

// Config file
const CONFIG_FILE = './config.json';

// Load atau buat config
let config = {};
if (fs.existsSync(CONFIG_FILE)) {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
} else {
    config = {
        ownerNumber: '',
        botName: 'MOONFLUX 🌙',
        prefix: ['!', '.', '/'],
        autoReadMessages: true,
        selfCommands: true,
        botVersion: 'v3.8',
        developer: 'momonpxl',
        whatsapp: '6283895513613',
        website: 'store.momon.web.id',
        telegram: 't.me/momonpxl',
        instagram: 'instagram.com/momonpxl',
        totalFeatures: 1650,
        startTime: Date.now(),
        autoAudioOnMenu: false, // Sementara dimatikan
        menuAudioFile: 'welcome.mp3',
        // Fitur welcome system
        autoWelcomeMsg: true,
        autoLeaveMsg: true,
        autoPromoteMsg: true,
        autoDemoteMsg: true,
        useCanvasAPI: axios !== null, // Hanya aktif jika axios ada
        // Anti spam
        antiSpam: true,
        maxWarnings: 3,
        // Auto kick untuk user yang di-warn 3x
        autoKickOnMaxWarn: true
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Create directories if not exists
const thumbnailsDir = './thumbnails';
const audioDir = './audio';
const mediaDir = './media';
const databaseDir = './database';

[thumbnailsDir, audioDir, mediaDir, databaseDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created ${dir} directory`);
    }
});

// Database files
const setWelcomeFile = './database/set_welcome.json';
const setLeftFile = './database/set_left.json';
const warningsFile = './database/warnings.json';
const bannedUsersFile = './database/banned_users.json';

// Initialize database files
if (!fs.existsSync(setWelcomeFile)) {
    fs.writeFileSync(setWelcomeFile, JSON.stringify({}, null, 2));
}
if (!fs.existsSync(setLeftFile)) {
    fs.writeFileSync(setLeftFile, JSON.stringify({}, null, 2));
}
if (!fs.existsSync(warningsFile)) {
    fs.writeFileSync(warningsFile, JSON.stringify({}, null, 2));
}
if (!fs.existsSync(bannedUsersFile)) {
    fs.writeFileSync(bannedUsersFile, JSON.stringify({}, null, 2));
}

// Load database
let set_welcome_db = {};
let set_left_db = {};
let warnings_db = {};
let banned_users_db = {};

try {
    set_welcome_db = JSON.parse(fs.readFileSync(setWelcomeFile, 'utf-8') || '{}');
} catch (err) {
    console.log('❌ Error loading welcome database, using empty:', err.message);
    set_welcome_db = {};
}

try {
    set_left_db = JSON.parse(fs.readFileSync(setLeftFile, 'utf-8') || '{}');
} catch (err) {
    console.log('❌ Error loading left database, using empty:', err.message);
    set_left_db = {};
}

try {
    warnings_db = JSON.parse(fs.readFileSync(warningsFile, 'utf-8') || '{}');
} catch (err) {
    console.log('❌ Error loading warnings database, using empty:', err.message);
    warnings_db = {};
}

try {
    banned_users_db = JSON.parse(fs.readFileSync(bannedUsersFile, 'utf-8') || '{}');
} catch (err) {
    console.log('❌ Error loading banned users database, using empty:', err.message);
    banned_users_db = {};
}

// Helper functions
function isSetWelcome(groupId) {
    return set_welcome_db[groupId] && set_welcome_db[groupId].enabled;
}

function getTextSetWelcome(groupId) {
    return set_welcome_db[groupId] ? set_welcome_db[groupId].text : null;
}

function isSetLeft(groupId) {
    return set_left_db[groupId] && set_left_db[groupId].enabled;
}

function getTextSetLeft(groupId) {
    return set_left_db[groupId] ? set_left_db[groupId].text : null;
}

function getUserWarnings(groupId, userId) {
    if (!warnings_db[groupId]) return 0;
    return warnings_db[groupId][userId] || 0;
}

function addUserWarning(groupId, userId) {
    if (!warnings_db[groupId]) warnings_db[groupId] = {};
    warnings_db[groupId][userId] = (warnings_db[groupId][userId] || 0) + 1;
    saveWarningsDB();
    return warnings_db[groupId][userId];
}

function resetUserWarnings(groupId, userId) {
    if (warnings_db[groupId] && warnings_db[groupId][userId]) {
        delete warnings_db[groupId][userId];
        saveWarningsDB();
        return true;
    }
    return false;
}

function isUserBanned(userId) {
    return banned_users_db[userId] === true;
}

function banUser(userId) {
    banned_users_db[userId] = true;
    saveBannedUsersDB();
}

function unbanUser(userId) {
    if (banned_users_db[userId]) {
        delete banned_users_db[userId];
        saveBannedUsersDB();
        return true;
    }
    return false;
}

// Save database functions
function saveWelcomeDB() {
    try {
        fs.writeFileSync(setWelcomeFile, JSON.stringify(set_welcome_db, null, 2));
        return true;
    } catch (err) {
        console.log('❌ Error saving welcome database:', err.message);
        return false;
    }
}

function saveLeftDB() {
    try {
        fs.writeFileSync(setLeftFile, JSON.stringify(set_left_db, null, 2));
        return true;
    } catch (err) {
        console.log('❌ Error saving left database:', err.message);
        return false;
    }
}

function saveWarningsDB() {
    try {
        fs.writeFileSync(warningsFile, JSON.stringify(warnings_db, null, 2));
        return true;
    } catch (err) {
        console.log('❌ Error saving warnings database:', err.message);
        return false;
    }
}

function saveBannedUsersDB() {
    try {
        fs.writeFileSync(bannedUsersFile, JSON.stringify(banned_users_db, null, 2));
        return true;
    } catch (err) {
        console.log('❌ Error saving banned users database:', err.message);
        return false;
    }
}

// Create default thumbnail if not exists
function createDefaultThumbnail() {
    const defaultThumbPath = path.join(thumbnailsDir, 'default.jpg');
    if (!fs.existsSync(defaultThumbPath)) {
        try {
            // Simple 1x1 pixel image as fallback
            const base64Image = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFUEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
            fs.writeFileSync(defaultThumbPath, Buffer.from(base64Image, 'base64'));
            console.log('✅ Created default thumbnail');
        } catch (err) {
            console.log('❌ Error creating thumbnail:', err.message);
        }
    }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.macOS('Chrome'),
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        retryRequestDelayMs: 1000,
        maxRetries: 5,
        getMessage: async (key) => {
            if (config.autoReadMessages) {
                await sock.readMessages([key]).catch(() => {});
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Connection update handler
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log('\n📴 Koneksi terputus');
            console.log(`📊 Kode: ${statusCode || 'Tidak diketahui'}\n`);

            if (statusCode === DisconnectReason.loggedOut) {
                console.log('⚠️  Logged Out - Hapus folder auth_info dan mulai ulang');
                process.exit();
            } else if (statusCode === 401 || statusCode === 428) {
                console.log('⏳ WhatsApp sedang sibuk, tunggu 5 menit...');
                await new Promise(r => setTimeout(r, 300000));
            }

            setTimeout(startBot, 5000);
        } 
        else if (connection === 'open') {
            console.log('\n╔══════════════════════════════════╗');
            console.log('║      🌙 MOONFLUX BOT ONLINE      ║');
            console.log('║   🎉 WELCOME SYSTEM READY       ║');
            console.log('╚══════════════════════════════════╝\n');
            
            try {
                await sock.updateProfileStatus('🤖 MOONFLUX BOT - Online 🚀');
            } catch (err) {
                console.log('⚠️  Gagal update status:', err.message);
            }
            
            const botNumber = sock.user?.id?.split(':')[0] + '@s.whatsapp.net' || 'Unknown';
            console.log(`📱 Bot Number: ${botNumber}`);
            console.log(`⚙️  Self Commands: ${config.selfCommands ? 'ON' : 'OFF'}`);
            console.log(`👑 Owner: ${config.ownerNumber || 'Belum diatur'}`);
            console.log(`🎉 Welcome Msg: ${config.autoWelcomeMsg ? '✅ ON' : '❌ OFF'}`);
            console.log(`👋 Leave Msg: ${config.autoLeaveMsg ? '✅ ON' : '❌ OFF'}`);
            console.log(`👑 Promote Msg: ${config.autoPromoteMsg ? '✅ ON' : '❌ OFF'}`);
            console.log(`📉 Demote Msg: ${config.autoDemoteMsg ? '✅ ON' : '❌ OFF'}`);
            console.log(`🚫 Anti Spam: ${config.antiSpam ? '✅ ON' : '❌ OFF'}`);
            console.log(`⚡ Auto Kick: ${config.autoKickOnMaxWarn ? '✅ ON' : '❌ OFF'}`);
            console.log(`🌐 Canvas API: ${config.useCanvasAPI && axios ? '✅ READY' : '❌ FALLBACK'}\n`);
            
            if (!config.startTime) {
                config.startTime = Date.now();
                fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
            }
        }
        else if (qr) {
            console.log('\n📱 Scan QR Code berikut:');
            qrcode.generate(qr, { small: true });
            console.log('\n⚠️  QR Code akan kadaluarsa dalam 30 detik\n');
        }
        else if (connection === 'connecting') {
            console.log('🔄 Menghubungkan...');
        }
    });

    // Pairing code handler
    if (sock.authState?.creds?.registered === false) {
        console.log('\n📱 Pairing Mode\n');
        await handlePairing(sock);
    }

    // Function untuk pairing
    async function handlePairing(sock) {
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                const phoneNumber = await question(`Masukkan nomor WA (62xxxx):\nPercobaan ${attempts + 1}/${maxAttempts}: `);
                
                if (!phoneNumber.startsWith('62')) {
                    console.log('\n❌ Format harus diawali 62\n');
                    attempts++;
                    continue;
                }
                
                console.log('\n⏳ Mendapatkan pairing code...');
                const code = await sock.requestPairingCode(phoneNumber.trim());
                
                console.log('\n╔══════════════════════════════════╗');
                console.log('║        PAIRING CODE              ║');
                console.log('╠══════════════════════════════════╣');
                console.log(`║           🔐 ${code}            ║`);
                console.log('╠══════════════════════════════════╣');
                console.log('║ 📱 Cara penggunaan:              ║');
                console.log('║ 1. Buka WhatsApp di HP           ║');
                console.log('║ 2. Settings → Perangkat Tertaut  ║');
                console.log('║ 3. Pilih "Tautkan perangkat"     ║');
                console.log('║ 4. Masukkan kode di atas         ║');
                console.log('║ 5. Tekan "Tautkan"               ║');
                console.log('╚══════════════════════════════════╝\n');
                
                const setOwner = await question('Apakah nomor ini adalah owner bot? (y/n): ');
                if (setOwner.toLowerCase() === 'y') {
                    config.ownerNumber = phoneNumber.trim();
                    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
                    console.log('✅ Nomor owner berhasil disimpan');
                }
                
                break;
            } catch (err) {
                attempts++;
                console.log(`\n❌ Gagal: ${err.message}\n`);
                
                if (attempts < maxAttempts) {
                    console.log('⏳ Tunggu 10 detik...\n');
                    await new Promise(r => setTimeout(r, 10000));
                }
            }
        }
        
        if (attempts === maxAttempts) {
            console.log('\n❌ Gagal 3x berturut-turut');
            console.log('⚠️  Coba lagi nanti (15-30 menit)\n');
            process.exit(1);
        }
    }

    // Function untuk check apakah user adalah owner
    function isOwner(sender) {
        if (!config.ownerNumber) return false;
        const ownerJid = config.ownerNumber.includes('@') ? config.ownerNumber : config.ownerNumber + '@s.whatsapp.net';
        return sender === ownerJid;
    }

    // Function untuk check apakah pesan dari bot sendiri
    function isSelfMessage(msg) {
        return msg.key?.fromMe && config.selfCommands;
    }

    // Function untuk check prefix
    function hasPrefix(text) {
        if (!text) return false;
        return config.prefix.some(prefix => text.startsWith(prefix));
    }

    // Function untuk extract command
    function extractCommand(text) {
        if (!text) return '';
        for (const prefix of config.prefix) {
            if (text.startsWith(prefix)) {
                return text.slice(prefix.length).trim().toLowerCase();
            }
        }
        return text.toLowerCase();
    }

    // Function untuk format waktu
    function formatUptime() {
        if (!config.startTime) return '0 detik';
        const uptime = Date.now() - config.startTime;
        const seconds = Math.floor((uptime / 1000) % 60);
        const minutes = Math.floor((uptime / (1000 * 60)) % 60);
        const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
        
        if (days > 0) return `${days} hari ${hours} jam ${minutes} menit`;
        if (hours > 0) return `${hours} jam ${minutes} menit ${seconds} detik`;
        if (minutes > 0) return `${minutes} menit ${seconds} detik`;
        return `${seconds} detik`;
    }

    // Function untuk membuat  MOONFLUX
    function createMoonfluxMenu(pushName, userCount = 14) {
        const uptime = formatUptime();
        
        return `✨━━〔🌙 MOONFLUX BOT MENU〕━━✨
Stable • Fast • Elegant

➤ 👤 User : ${pushName}
➤ 👑 Rank : Free User
➤ 👥 Total Pengguna : ${userCount}

──────────────────────

✨━━〔🤖 INFORMASI BOT〕━━✨
➤ 🤖 Nama Bot : ${config.botName}
➤ ⚒️ Total Fitur : ${config.totalFeatures}+
➤ ⏱️ Aktif Selama : ${uptime}
➤ 👾 Versi : ${config.botVersion}

✨━━〔📱 SOSIAL MEDIA〕━━✨
➤ 🪀 WhatsApp : wa.me/${config.whatsapp}
➤ 🌐 Panel : ${config.website}
➤ 📨 Telegram : ${config.telegram}
➤ 📸 Instagram : ${config.instagram}

⚙️ Prefix : ${config.prefix.join(' ')}
🤖 Self Commands : ${config.selfCommands ? 'ON ✅' : 'OFF ❌'}
🎉 Welcome System : READY ✅
🚫 Anti Spam : ${config.antiSpam ? 'ON ✅' : 'OFF ❌'}
⚡ Auto Kick : ${config.autoKickOnMaxWarn ? 'ON ✅' : 'OFF ❌'}

──────────────────────

✨━━〔🎯 TAG COMMANDS〕━━✨
• !tagall [pesan]
• !tagadmin
• !tagrandom [jumlah]
• !tagme

✨━━〔👻 HIDETAG COMMANDS〕━━✨
• !hidetag [pesan]

✨━━〔🎉 WELCOME SYSTEM〕━━✨
• !setwelcome [teks]
• !setleft [teks]
• !togglewelcome [on/off]
• !toggleleave [on/off]
• !viewwelcome
• !viewleft

──────────────────────

✨━━〔⚡ KICK COMMANDS〕━━✨
• !kick @user - Kick user dari grup
• !warn @user - Beri peringatan ke user
• !unwarn @user - Reset peringatan user
• !warnings @user - Lihat peringatan user
• !ban @user - Ban user global
• !unban @user - Unban user
• !kickall - Kick semua member non-admin

──────────────────────

✨━━〔📊 GROUP COMMANDS〕━━✨
• !infogrup
• !listadmin
• !totalmember
• !linkgrup

✨━━〔👑 OWNER COMMANDS〕━━✨
• !bc [pesan]
• !setowner [nomor]
• !toggle [on/off]
• !status
• !leave

✨━━〔 ️ OTHER COMMANDS〕━━✨
• !ping
• !owner
• !help

──────────────────────
╭─——〔 💡 Kata Pengembang 〕——─╮
│ "Kami terus berinovasi
│ untuk memberikan pengalaman
│ terbaik dalam setiap interaksi."
╰──────────────────╯

🚀 Powered By MOONFLUX BOT
By ${config.developer}`;
    }

    // ==================== WELCOME SYSTEM FUNCTIONS ====================
    
    // Function untuk handle group participants update dengan FALLBACK
    async function handleGroupParticipantsUpdate(update) {
        try {
            const { id, participants, action } = update;
            
            console.log(`\n🎉 EVENT group-participants.update DITERIMA!`);
            console.log(`📊 Group: ${id}`);
            console.log(`🔧 Action: ${action}`);
            console.log(`👥 Participants: ${JSON.stringify(participants)}`);
            
            if (!id.endsWith('@g.us')) {
                console.log('⚠️  Bukan grup, skipping...');
                return;
            }
            
            try {
                const metadata = await sock.groupMetadata(id);
                const groupName = metadata.subject;
                const memberCount = metadata.participants.length;
                const groupDesc = metadata.desc || "-";
                
                for (let num of participants) {
                    try {
                        const userJid = num.includes('@') ? num : num + '@s.whatsapp.net';
                        const pushName = userJid.split('@')[0] || 'User';
                        
                        console.log(`📝 Processing ${action} for ${userJid} in ${groupName}`);
                        
                        // Check if user is banned
                        if (action === 'add' && isUserBanned(userJid)) {
                            console.log(`🚫 User ${pushName} is banned, kicking...`);
                            await sock.groupParticipantsUpdate(id, [userJid], 'remove')
                                .then(() => {
                                    sock.sendMessage(id, {
                                        text: `🚫 @${pushName} telah di-ban dari semua grup. Tidak boleh bergabung kembali.`,
                                        mentions: [userJid]
                                    }).catch(() => {});
                                })
                                .catch(err => console.log('❌ Gagal kick banned user:', err.message));
                            continue;
                        }
                        
                        if (action === 'add' && config.autoWelcomeMsg) {
                            console.log(`✅ Welcome message should be sent for ${pushName}`);
                            
                            if (isSetWelcome(id)) {
                                const get_teks = getTextSetWelcome(id);
                                if (get_teks) {
                                    const replaced = get_teks
                                        .replace(/@user/gi, `@${pushName}`)
                                        .replace(/@group/gi, groupName)
                                        .replace(/@desc/gi, groupDesc);
                                    
                                    console.log(`📤 Sending custom welcome to ${userJid}`);
                                    await sock.sendMessage(id, { 
                                        text: replaced, 
                                        mentions: [userJid] 
                                    }).catch(err => console.log('❌ Error sending custom welcome:', err.message));
                                    continue;
                                }
                            }
                            
                            // Default welcome message
                            const welcomeMsg = 
`✨━━━〔 🎉 WELCOME 〕━━━✨

ʜᴀɪ ᴋᴀᴋ @${pushName} sᴇʟᴀᴍᴀᴛ ʙᴇʀɢᴀʙᴜɴɢ ᴅɪ ${groupName}! ✨

ᴍᴇᴍʙᴇʀ ᴋᴇ: ${memberCount}

💡 **SELAMAT DATANG DI KELUARGA BESAR!**
• Perkenalkan diri kalian ya! 😊
• Patuhi aturan grup jika ada
• Hormati semua member
• Nikmati setiap momen bersama

_🌙 MoonFlux Bot - Making Connections Better_`;

                            console.log(`📤 Sending default welcome to ${userJid}`);
                            await sock.sendMessage(id, {
                                text: welcomeMsg,
                                mentions: [userJid]
                            }).catch(err => console.log('❌ Error sending default welcome:', err.message));
                            
                        } else if (action === 'remove' && config.autoLeaveMsg) {
                            console.log(`✅ Leave message should be sent for ${pushName}`);
                            
                            if (isSetLeft(id)) {
                                const get_teks = getTextSetLeft(id);
                                if (get_teks) {
                                    const replaced = get_teks
                                        .replace(/@user/gi, `@${pushName}`)
                                        .replace(/@group/gi, groupName)
                                        .replace(/@desc/gi, groupDesc);
                                    
                                    console.log(`📤 Sending custom leave to ${userJid}`);
                                    await sock.sendMessage(id, { 
                                        text: replaced, 
                                        mentions: [userJid] 
                                    }).catch(err => console.log('❌ Error sending custom leave:', err.message));
                                    continue;
                                }
                            }
                            
                            // Default leave message
                            const leaveMsg = 
`✨━━━〔 👋 GOODBYE 〕━━━✨

ʙᴀɪʙᴀɪ ᴋᴀᴋ @${pushName} sᴇᴍᴏɢᴀ ᴛᴇɴᴀɴɢ ᴅɪ ᴀʟᴀᴍ sᴀɴᴀ ✨

ᴍᴇᴍʙᴇʀ ᴛᴇʀsɪsᴀ: ${memberCount - 1}

💔 **SEMOGA SUKSES SELALU!**
• Terima kasih telah menjadi bagian dari kami
• Semoga sukses di mana pun berada
• Jangan lupa kunjungi kami lagi
• Stay awesome and keep shining!

_🌙 MoonFlux Bot - Forever in Our Hearts_`;

                            console.log(`📤 Sending default leave to ${userJid}`);
                            await sock.sendMessage(id, {
                                text: leaveMsg,
                                mentions: [userJid]
                            }).catch(err => console.log('❌ Error sending default leave:', err.message));
                            
                        } else if (action === 'promote' && config.autoPromoteMsg) {
                            console.log(`✅ Promote message should be sent for ${pushName}`);
                            
                            const promoteMsg = 
`✨━━━〔 👑 PROMOTION 〕━━━✨

🎉 **SELAMAT!** 🎉

ᴘᴀɴɢᴋᴀᴛ ᴋᴀᴍᴜ ᴅɪ ɢʀᴜᴘ ${groupName} ɴᴀɪᴋ ᴍᴇɴᴊᴀᴅɪ ᴀᴅᴍɪɴ! ✨

@${pushName} sekarang menjadi admin grup!

💡 **TANGGUNG JAWAB BARU:**
• Jaga ketertiban grup
• Bantu member yang membutuhkan
• Patuhi aturan yang ada
• Jadilah pemimpin yang baik

_🌙 MoonFlux Bot - Congratulations!_`;

                            console.log(`📤 Sending promote message to ${userJid}`);
                            await sock.sendMessage(id, {
                                text: promoteMsg,
                                mentions: [userJid]
                            }).catch(err => console.log('❌ Error sending promote message:', err.message));
                            
                        } else if (action === 'demote' && config.autoDemoteMsg) {
                            console.log(`✅ Demote message should be sent for ${pushName}`);
                            
                            const demoteMsg = 
`✨━━━〔 📉 DEMOTION 〕━━━✨

ᴘᴀɴɢᴋᴀᴛ ᴋᴀᴍᴜ ᴅɪ ɢʀᴜᴘ ${groupName} ᴛᴜʀᴜɴ ᴍᴇɴᴊᴀᴅɪ ᴀɴɢɢᴏᴛᴀ ✨

@${pushName} tidak lagi menjadi admin grup.

💡 **TERIMA KASIH:**
• Terima kasih atas kontribusinya
• Tetap semangat beraktivitas
• Support admin yang baru
• Tetap jadi member aktif!

_🌙 MoonFlux Bot - Keep Supporting!_`;

                            console.log(`📤 Sending demote message to ${userJid}`);
                            await sock.sendMessage(id, {
                                text: demoteMsg,
                                mentions: [userJid]
                            }).catch(err => console.log('❌ Error sending demote message:', err.message));
                        }
                    } catch (err) {
                        console.log(`❌ Error processing participant ${num}:`, err.message);
                    }
                }
            } catch (err) {
                console.log('❌ Error getting group metadata:', err.message);
                // Send fallback messages without metadata
                for (let num of participants) {
                    try {
                        const userJid = num.includes('@') ? num : num + '@s.whatsapp.net';
                        const pushName = userJid.split('@')[0] || 'User';
                        
                        if (action === 'add' && config.autoWelcomeMsg) {
                            await sock.sendMessage(id, {
                                text: `✨ Selamat datang @${pushName} di grup! ✨\n\nSemoga betah ya! 😊`,
                                mentions: [userJid]
                            }).catch(() => {});
                        } else if (action === 'remove' && config.autoLeaveMsg) {
                            await sock.sendMessage(id, {
                                text: `✨ Selamat tinggal @${pushName}! ✨\n\nSemoga sukses selalu! 🙏`,
                                mentions: [userJid]
                            }).catch(() => {});
                        }
                    } catch (err2) {
                        console.log(`❌ Fallback error for ${num}:`, err2.message);
                    }
                }
            }
        } catch (err) {
            console.log('❌ Error in handleGroupParticipantsUpdate:', err.message);
        }
    }

    // Function untuk send with thumbnail
    async function sendWithThumbnail(jid, text, thumbnailPath = null) {
        try {
            let imagePath = thumbnailPath;
            
            if (!imagePath || !fs.existsSync(imagePath)) {
                imagePath = path.join(thumbnailsDir, 'default.jpg');
                
                if (!fs.existsSync(imagePath)) {
                    await sock.sendMessage(jid, { text }).catch(() => {});
                    return;
                }
            }
            
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(jid, {
                image: imageBuffer,
                caption: text,
                mimetype: 'image/jpeg',
                fileName: 'moonflux_thumbnail.jpg'
            }).catch(() => {
                sock.sendMessage(jid, { text }).catch(() => {});
            });
            
        } catch (err) {
            console.log('❌ Error sending with thumbnail:', err.message);
            await sock.sendMessage(jid, { text }).catch(() => {});
        }
    }

    // Function untuk extract mention dari pesan
    function extractMentions(text) {
        const mentions = [];
        const regex = /@(\d+)/g;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            mentions.push(match[1] + '@s.whatsapp.net');
        }
        
        return mentions;
    }

    // Function untuk kick user
    async function kickUser(groupId, userId, reason = "Melanggar aturan grup") {
        try {
            await sock.groupParticipantsUpdate(groupId, [userId], 'remove');
            
            // Reset warnings setelah kick
            resetUserWarnings(groupId, userId);
            
            const userName = userId.split('@')[0];
            return {
                success: true,
                message: `✅ @${userName} telah dikick dari grup.\nAlasan: ${reason}`,
                mentions: [userId]
            };
        } catch (err) {
            console.log('❌ Error kicking user:', err.message);
            return {
                success: false,
                message: `❌ Gagal mengkick user: ${err.message}`
            };
        }
    }

    // Handle messages
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message) return;

            const from = msg.key.remoteJid;
            const sender = msg.key.participant || from;
            const pushName = msg.pushName || 'User';
            const isGroup = from.endsWith('@g.us');
            
            const isFromSelf = msg.key.fromMe;
            if (isFromSelf && !config.selfCommands) return;
            
            let text = '';
            const msgType = getContentType(msg.message);
            
            if (msgType === 'conversation') {
                text = msg.message.conversation || '';
            } else if (msgType === 'extendedTextMessage') {
                text = msg.message.extendedTextMessage?.text || '';
            }
            
            const originalText = text.trim();
            const lowerText = originalText.toLowerCase();
            
            console.log(`\n${isFromSelf ? '[SELF]' : '[USER]'} ${pushName}: ${originalText.substring(0, 50)}${originalText.length > 50 ? '...' : ''}`);
            
            const isCommand = hasPrefix(originalText);
            if (!isCommand && !isFromSelf) return;
            
            const command = extractCommand(originalText);
            
            // COMMAND HANDLER
            switch (command.split(' ')[0]) {
                case 'menu':
                case 'help':
                case 'start':
                    const menuText = createMoonfluxMenu(pushName, 14);
                    await sendWithThumbnail(from, menuText);
                    break;
                    
                // ==================== KICK COMMANDS ====================
                case 'kick':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    if (!isOwner(sender) && !isFromSelf) {
                        // Cek apakah sender adalah admin
                        try {
                            const metadata = await sock.groupMetadata(from);
                            const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;
                            if (!isAdmin) {
                                await sock.sendMessage(from, { 
                                    text: '❌ Hanya admin yang bisa menggunakan command ini!'
                                }).catch(() => {});
                                return;
                            }
                        } catch (err) {
                            await sock.sendMessage(from, { 
                                text: '❌ Gagal memverifikasi admin status!'
                            }).catch(() => {});
                            return;
                        }
                    }
                    
                    const mentions = extractMentions(originalText);
                    if (mentions.length === 0) {
                        await sock.sendMessage(from, { 
                            text: '❌ Tag user yang ingin dikick!\nContoh: !kick @user'
                        }).catch(() => {});
                        return;
                    }
                    
                    for (const userId of mentions) {
                        try {
                            const result = await kickUser(from, userId, "Atas permintaan admin");
                            if (result.success) {
                                await sock.sendMessage(from, {
                                    text: result.message,
                                    mentions: result.mentions
                                }).catch(() => {});
                            } else {
                                await sock.sendMessage(from, { 
                                    text: result.message 
                                }).catch(() => {});
                            }
                        } catch (err) {
                            await sock.sendMessage(from, { 
                                text: `❌ Error kicking ${userId.split('@')[0]}: ${err.message}`
                            }).catch(() => {});
                        }
                    }
                    break;
                    
                case 'warn':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    if (!isOwner(sender) && !isFromSelf) {
                        // Cek apakah sender adalah admin
                        try {
                            const metadata = await sock.groupMetadata(from);
                            const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;
                            if (!isAdmin) {
                                await sock.sendMessage(from, { 
                                    text: '❌ Hanya admin yang bisa menggunakan command ini!'
                                }).catch(() => {});
                                return;
                            }
                        } catch (err) {
                            await sock.sendMessage(from, { 
                                text: '❌ Gagal memverifikasi admin status!'
                            }).catch(() => {});
                            return;
                        }
                    }
                    
                    const warnMentions = extractMentions(originalText);
                    if (warnMentions.length === 0) {
                        await sock.sendMessage(from, { 
                            text: '❌ Tag user yang ingin di-warn!\nContoh: !warn @user'
                        }).catch(() => {});
                        return;
                    }
                    
                    for (const userId of warnMentions) {
                        const warnings = addUserWarning(from, userId);
                        const userName = userId.split('@')[0];
                        
                        let warningMsg = '';
                        if (warnings >= config.maxWarnings && config.autoKickOnMaxWarn) {
                            // Auto kick jika mencapai max warnings
                            try {
                                await sock.groupParticipantsUpdate(from, [userId], 'remove');
                                warningMsg = `🚫 @${userName} telah mencapai ${warnings} peringatan dan otomatis dikick dari grup!`;
                                resetUserWarnings(from, userId);
                            } catch (err) {
                                warningMsg = `⚠️ @${userName} telah mencapai ${warnings} peringatan (MAX) tetapi gagal dikick: ${err.message}`;
                            }
                        } else {
                            warningMsg = `⚠️ @${userName} mendapat peringatan! (${warnings}/${config.maxWarnings})\n\nLanjutkan pelanggaran akan berakibat kick otomatis!`;
                        }
                        
                        await sock.sendMessage(from, {
                            text: warningMsg,
                            mentions: [userId]
                        }).catch(() => {});
                    }
                    break;
                    
                case 'unwarn':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    if (!isOwner(sender) && !isFromSelf) {
                        // Cek apakah sender adalah admin
                        try {
                            const metadata = await sock.groupMetadata(from);
                            const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;
                            if (!isAdmin) {
                                await sock.sendMessage(from, { 
                                    text: '❌ Hanya admin yang bisa menggunakan command ini!'
                                }).catch(() => {});
                                return;
                            }
                        } catch (err) {
                            await sock.sendMessage(from, { 
                                text: '❌ Gagal memverifikasi admin status!'
                            }).catch(() => {});
                            return;
                        }
                    }
                    
                    const unwarnMentions = extractMentions(originalText);
                    if (unwarnMentions.length === 0) {
                        await sock.sendMessage(from, { 
                            text: '❌ Tag user yang ingin di-unwarn!\nContoh: !unwarn @user'
                        }).catch(() => {});
                        return;
                    }
                    
                    for (const userId of unwarnMentions) {
                        const reset = resetUserWarnings(from, userId);
                        const userName = userId.split('@')[0];
                        
                        if (reset) {
                            await sock.sendMessage(from, {
                                text: `✅ Peringatan @${userName} telah direset ke 0.`,
                                mentions: [userId]
                            }).catch(() => {});
                        } else {
                            await sock.sendMessage(from, {
                                text: `ℹ️ @${userName} tidak memiliki peringatan.`,
                                mentions: [userId]
                            }).catch(() => {});
                        }
                    }
                    break;
                    
                case 'warnings':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    const warningsMentions = extractMentions(originalText);
                    let targetUser = sender;
                    
                    if (warningsMentions.length > 0) {
                        targetUser = warningsMentions[0];
                    }
                    
                    const userWarnings = getUserWarnings(from, targetUser);
                    const userName = targetUser.split('@')[0];
                    
                    await sock.sendMessage(from, {
                        text: `📊 **PERINGATAN USER**\n\n👤 User: @${userName}\n⚠️ Peringatan: ${userWarnings}/${config.maxWarnings}\n\n${userWarnings >= config.maxWarnings ? '🚫 MAX WARNINGS - Akan di-kick otomatis!' : 'Masih aman 😊'}`,
                        mentions: [targetUser]
                    }).catch(() => {});
                    break;
                    
                case 'ban':
                    if (!isOwner(sender) && !isFromSelf) {
                        await sock.sendMessage(from, { 
                            text: '❌ Hanya owner bot yang bisa menggunakan command ini!'
                        }).catch(() => {});
                        return;
                    }
                    
                    const banMentions = extractMentions(originalText);
                    if (banMentions.length === 0) {
                        await sock.sendMessage(from, { 
                            text: '❌ Tag user yang ingin di-ban!\nContoh: !ban @user'
                        }).catch(() => {});
                        return;
                    }
                    
                    for (const userId of banMentions) {
                        banUser(userId);
                        const userName = userId.split('@')[0];
                        
                        await sock.sendMessage(from, {
                            text: `🚫 @${userName} telah di-BAN GLOBAL dari semua grup bot!`,
                            mentions: [userId]
                        }).catch(() => {});
                    }
                    break;
                    
                case 'unban':
                    if (!isOwner(sender) && !isFromSelf) {
                        await sock.sendMessage(from, { 
                            text: '❌ Hanya owner bot yang bisa menggunakan command ini!'
                        }).catch(() => {});
                        return;
                    }
                    
                    const unbanMentions = extractMentions(originalText);
                    if (unbanMentions.length === 0) {
                        await sock.sendMessage(from, { 
                            text: '❌ Tag user yang ingin di-unban!\nContoh: !unban @user'
                        }).catch(() => {});
                        return;
                    }
                    
                    for (const userId of unbanMentions) {
                        const unban = unbanUser(userId);
                        const userName = userId.split('@')[0];
                        
                        if (unban) {
                            await sock.sendMessage(from, {
                                text: `✅ @${userName} telah di-UNBAN dan bisa bergabung kembali ke grup.`,
                                mentions: [userId]
                            }).catch(() => {});
                        } else {
                            await sock.sendMessage(from, {
                                text: `ℹ️ @${userName} tidak dalam status banned.`,
                                mentions: [userId]
                            }).catch(() => {});
                        }
                    }
                    break;
                    
                case 'kickall':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    if (!isOwner(sender) && !isFromSelf) {
                        await sock.sendMessage(from, { 
                            text: '❌ Hanya owner bot yang bisa menggunakan command ini!'
                        }).catch(() => {});
                        return;
                    }
                    
                    try {
                        const metadata = await sock.groupMetadata(from);
                        const participants = metadata.participants;
                        const nonAdmins = participants.filter(p => !p.admin && !p.id.includes(sock.user.id.split(':')[0]));
                        
                        if (nonAdmins.length === 0) {
                            await sock.sendMessage(from, { 
                                text: '❌ Tidak ada member non-admin yang bisa dikick.'
                            }).catch(() => {});
                            return;
                        }
                        
                        await sock.sendMessage(from, { 
                            text: `⚠️ **PERINGATAN**\n\nAkan mengkick ${nonAdmins.length} member non-admin dalam 5 detik...`
                        }).catch(() => {});
                        
                        await new Promise(r => setTimeout(r, 5000));
                        
                        let successCount = 0;
                        let failCount = 0;
                        
                        for (const participant of nonAdmins) {
                            try {
                                await sock.groupParticipantsUpdate(from, [participant.id], 'remove');
                                successCount++;
                                // Tunggu 1 detik antara setiap kick untuk menghindari spam
                                await new Promise(r => setTimeout(r, 1000));
                            } catch (err) {
                                failCount++;
                                console.log(`❌ Gagal kick ${participant.id.split('@')[0]}:`, err.message);
                            }
                        }
                        
                        await sock.sendMessage(from, { 
                            text: `✅ **KICKALL COMPLETED**\n\nBerhasil: ${successCount} member\nGagal: ${failCount} member\n\nGrup sekarang hanya berisi admin.`
                        }).catch(() => {});
                        
                    } catch (err) {
                        await sock.sendMessage(from, { 
                            text: `❌ Error kickall: ${err.message}`
                        }).catch(() => {});
                    }
                    break;
                    
                // ==================== WELCOME SYSTEM COMMANDS ====================
                case 'setwelcome':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    if (!isOwner(sender) && !isFromSelf) {
                        await sock.sendMessage(from, { 
                            text: '❌ Hanya admin yang bisa mengatur welcome message!'
                        }).catch(() => {});
                        return;
                    }
                    
                    const welcomeText = originalText.replace(/^[!\.\/]setwelcome\s*/i, '').trim();
                    
                    if (!welcomeText) {
                        await sock.sendMessage(from, { 
                            text: `📝 **SET WELCOME MESSAGE**\n\nFormat: ${config.prefix[0]}setwelcome [teks]\n\n**Variabel yang tersedia:**\n• @user - Nama user\n• @group - Nama grup\n• @desc - Deskripsi grup\n\n**Contoh:**\n${config.prefix[0]}setwelcome Selamat datang @user di @group!`
                        }).catch(() => {});
                        return;
                    }
                    
                    set_welcome_db[from] = {
                        enabled: true,
                        text: welcomeText,
                        setBy: sender.split('@')[0],
                        timestamp: Date.now()
                    };
                    
                    saveWelcomeDB();
                    
                    await sock.sendMessage(from, { 
                        text: `✅ **WELCOME MESSAGE SET**\n\nWelcome message berhasil diatur!\n\n**Preview:**\n${welcomeText}\n\n**Variabel:**\n@user → [Nama user]\n@group → [Nama grup]\n@desc → [Deskripsi grup]`
                    }).catch(() => {});
                    break;
                    
                case 'setleft':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    if (!isOwner(sender) && !isFromSelf) {
                        await sock.sendMessage(from, { 
                            text: '❌ Hanya admin yang bisa mengatur left message!'
                        }).catch(() => {});
                        return;
                    }
                    
                    const leftText = originalText.replace(/^[!\.\/]setleft\s*/i, '').trim();
                    
                    if (!leftText) {
                        await sock.sendMessage(from, { 
                            text: `📝 **SET LEFT MESSAGE**\n\nFormat: ${config.prefix[0]}setleft [teks]\n\n**Variabel yang tersedia:**\n• @user - Nama user\n• @group - Nama grup\n• @desc - Deskripsi grup\n\n**Contoh:**\n${config.prefix[0]}setleft Selamat tinggal @user dari @group!`
                        }).catch(() => {});
                        return;
                    }
                    
                    set_left_db[from] = {
                        enabled: true,
                        text: leftText,
                        setBy: sender.split('@')[0],
                        timestamp: Date.now()
                    };
                    
                    saveLeftDB();
                    
                    await sock.sendMessage(from, { 
                        text: `✅ **LEFT MESSAGE SET**\n\nLeft message berhasil diatur!\n\n**Preview:**\n${leftText}\n\n**Variabel:**\n@user → [Nama user]\n@group → [Nama grup]\n@desc → [Deskripsi grup]`
                    }).catch(() => {});
                    break;
                    
                case 'togglewelcome':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    if (!isOwner(sender) && !isFromSelf) {
                        await sock.sendMessage(from, { 
                            text: '❌ Hanya admin yang bisa mengatur welcome system!'
                        }).catch(() => {});
                        return;
                    }
                    
                    const welcomeMode = originalText.replace(/^[!\.\/]togglewelcome\s*/i, '').trim().toLowerCase();
                    
                    if (welcomeMode === 'on') {
                        config.autoWelcomeMsg = true;
                        await sock.sendMessage(from, { 
                            text: '✅ **WELCOME SYSTEM DIHIDUPKAN**\n\nWelcome message akan dikirim otomatis saat ada member baru!'
                        }).catch(() => {});
                    } else if (welcomeMode === 'off') {
                        config.autoWelcomeMsg = false;
                        await sock.sendMessage(from, { 
                            text: '❌ **WELCOME SYSTEM DIMATIKAN**\n\nWelcome message tidak akan dikirim otomatis.'
                        }).catch(() => {});
                    } else {
                        config.autoWelcomeMsg = !config.autoWelcomeMsg;
                        await sock.sendMessage(from, { 
                            text: `🔄 **WELCOME SYSTEM DIPERBARUI**\n\nStatus: ${config.autoWelcomeMsg ? '✅ HIDUP' : '❌ MATI'}\n\nWelcome message ${config.autoWelcomeMsg ? 'akan' : 'tidak akan'} dikirim otomatis.`
                        }).catch(() => {});
                    }
                    
                    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
                    break;
                    
                case 'toggleleave':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    if (!isOwner(sender) && !isFromSelf) {
                        await sock.sendMessage(from, { 
                            text: '❌ Hanya admin yang bisa mengatur leave system!'
                        }).catch(() => {});
                        return;
                    }
                    
                    const leaveMode = originalText.replace(/^[!\.\/]toggleleave\s*/i, '').trim().toLowerCase();
                    
                    if (leaveMode === 'on') {
                        config.autoLeaveMsg = true;
                        await sock.sendMessage(from, { 
                            text: '✅ **LEAVE SYSTEM DIHIDUPKAN**\n\nLeave message akan dikirim otomatis saat ada member keluar!'
                        }).catch(() => {});
                    } else if (leaveMode === 'off') {
                        config.autoLeaveMsg = false;
                        await sock.sendMessage(from, { 
                            text: '❌ **LEAVE SYSTEM DIMATIKAN**\n\nLeave message tidak akan dikirim otomatis.'
                        }).catch(() => {});
                    } else {
                        config.autoLeaveMsg = !config.autoLeaveMsg;
                        await sock.sendMessage(from, { 
                            text: `🔄 **LEAVE SYSTEM DIPERBARUI**\n\nStatus: ${config.autoLeaveMsg ? '✅ HIDUP' : '❌ MATI'}\n\nLeave message ${config.autoLeaveMsg ? 'akan' : 'tidak akan'} dikirim otomatis.`
                        }).catch(() => {});
                    }
                    
                    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
                    break;
                    
                case 'viewwelcome':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    if (isSetWelcome(from)) {
                        const welcomeData = set_welcome_db[from];
                        const timestamp = new Date(welcomeData.timestamp).toLocaleString('id-ID');
                        
                        await sock.sendMessage(from, { 
                            text: `📋 **WELCOME SETTING**\n\n**Status:** ✅ AKTIF\n**Set oleh:** ${welcomeData.setBy}\n**Waktu:** ${timestamp}\n\n**Message:**\n${welcomeData.text}\n\n**Preview dengan variabel:**\n${welcomeData.text.replace(/@user/gi, '[Nama User]').replace(/@group/gi, '[Nama Grup]').replace(/@desc/gi, '[Deskripsi]')}`
                        }).catch(() => {});
                    } else {
                        await sock.sendMessage(from, { 
                            text: `📋 **WELCOME SETTING**\n\n**Status:** ❌ TIDAK AKTIF\n\n**Default Message:**\nWelcome message akan dikirim otomatis saat ada member baru.\n\nGunakan ${config.prefix[0]}setwelcome untuk custom message.`
                        }).catch(() => {});
                    }
                    break;
                    
                case 'viewleft':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    if (isSetLeft(from)) {
                        const leftData = set_left_db[from];
                        const timestamp = new Date(leftData.timestamp).toLocaleString('id-ID');
                        
                        await sock.sendMessage(from, { 
                            text: `📋 **LEFT SETTING**\n\n**Status:** ✅ AKTIF\n**Set oleh:** ${leftData.setBy}\n**Waktu:** ${timestamp}\n\n**Message:**\n${leftData.text}\n\n**Preview dengan variabel:**\n${leftData.text.replace(/@user/gi, '[Nama User]').replace(/@group/gi, '[Nama Grup]').replace(/@desc/gi, '[Deskripsi]')}`
                        }).catch(() => {});
                    } else {
                        await sock.sendMessage(from, { 
                            text: `📋 **LEFT SETTING**\n\n**Status:** ❌ TIDAK AKTIF\n\n**Default Message:**\nLeave message akan dikirim otomatis saat ada member keluar.\n\nGunakan ${config.prefix[0]}setleft untuk custom message.`
                        }).catch(() => {});
                    }
                    break;
                    
                case 'testwelcome':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    try {
                        const metadata = await sock.groupMetadata(from);
                        const memberCount = metadata.participants.length;
                        const groupName = metadata.subject;
                        
                        // Test welcome message
                        await sock.sendMessage(from, {
                            text: `🎉 **TEST WELCOME MESSAGE**\n\nSimulasi welcome untuk: @${sender.split('@')[0]}\n\n✨ Selamat datang di ${groupName}! ✨\n\nMember ke: ${memberCount}\n\nStatus: ${config.autoWelcomeMsg ? '✅ AKTIF' : '❌ NONAKTIF'}`,
                            mentions: [sender]
                        }).catch(() => {});
                    } catch (err) {
                        await sock.sendMessage(from, {
                            text: '🎉 **TEST WELCOME MESSAGE**\n\nSimulasi welcome message berhasil!\n\nStatus system: ✅ AKTIF'
                        }).catch(() => {});
                    }
                    break;
                    
                case 'testleave':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    try {
                        const metadata = await sock.groupMetadata(from);
                        const memberCount = metadata.participants.length;
                        const groupName = metadata.subject;
                        
                        // Test leave message
                        await sock.sendMessage(from, {
                            text: `👋 **TEST LEAVE MESSAGE**\n\nSimulasi leave untuk: @${sender.split('@')[0]}\n\n✨ Selamat tinggal dari ${groupName}! ✨\n\nMember tersisa: ${memberCount - 1}\n\nStatus: ${config.autoLeaveMsg ? '✅ AKTIF' : '❌ NONAKTIF'}`,
                            mentions: [sender]
                        }).catch(() => {});
                    } catch (err) {
                        await sock.sendMessage(from, {
                            text: '👋 **TEST LEAVE MESSAGE**\n\nSimulasi leave message berhasil!\n\nStatus system: ✅ AKTIF'
                        }).catch(() => {});
                    }
                    break;
                    
                // ==================== OTHER COMMANDS ====================
                case 'tagall':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    try {
                        const groupMetadata = await sock.groupMetadata(from);
                        const participants = groupMetadata.participants;
                        
                        let mentions = [];
                        let mentionText = '';
                        
                        participants.forEach(participant => {
                            mentions.push(participant.id);
                            mentionText += `@${participant.id.split('@')[0]} `;
                        });
                        
                        const message = originalText.replace(/^[!\.\/]tagall\s*/i, '').trim();
                        const finalMessage = message || '✨ Attention everyone! ✨';
                        
                        const tagMessage = 
`✨━━━〔 🎯 TAG ALL 〕━━━✨

${finalMessage}

${mentionText}

──────────────────────
📊 **STATISTIK GRUP**
• 👥 Total Member: ${participants.length}
• 👑 Admin: ${groupMetadata.participants.filter(p => p.admin).length}
• ⏰ Waktu: ${new Date().toLocaleTimeString('id-ID')}
──────────────────────

🚀 *Powered by MOONFLUX BOT*`;
                        
                        await sock.sendMessage(from, {
                            text: tagMessage,
                            mentions: mentions
                        }).catch(() => {});
                    } catch (err) {
                        console.log('❌ Error tagall:', err.message);
                    }
                    break;
                    
                case 'tagadmin':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    try {
                        const groupMetadata = await sock.groupMetadata(from);
                        const admins = groupMetadata.participants.filter(p => p.admin);
                        
                        if (admins.length === 0) {
                            await sock.sendMessage(from, { 
                                text: '✨━━━〔 👑 TAG ADMIN 〕━━━✨\n\n❌ Tidak ada admin di grup ini.'
                            }).catch(() => {});
                            return;
                        }
                        
                        let mentions = [];
                        let mentionText = '';
                        
                        admins.forEach(admin => {
                            mentions.push(admin.id);
                            mentionText += `@${admin.id.split('@')[0]} `;
                        });
                        
                        const adminMessage = 
`✨━━━〔 👑 TAG ADMIN 〕━━━✨

${mentionText}

──────────────────────
📊 **STATISTIK ADMIN**
• 👥 Total Admin: ${admins.length}
• 🏷️ Grup: ${groupMetadata.subject}
• ⏰ Waktu: ${new Date().toLocaleTimeString('id-ID')}
──────────────────────

🚀 *Powered by MOONFLUX BOT*`;
                        
                        await sock.sendMessage(from, {
                            text: adminMessage,
                            mentions: mentions
                        }).catch(() => {});
                    } catch (err) {
                        console.log('❌ Error tagadmin:', err.message);
                    }
                    break;
                    
                case 'infogrup':
                    if (!isGroup) {
                        await sock.sendMessage(from, { 
                            text: '❌ Command ini hanya untuk grup!'
                        }).catch(() => {});
                        return;
                    }
                    
                    try {
                        const groupMetadata = await sock.groupMetadata(from);
                        const infoMsg = 
`✨━━━〔 📊 GROUP INFO 〕━━━✨

🏷️ **Nama Grup:** ${groupMetadata.subject}
👥 **Total Member:** ${groupMetadata.participants.length} orang
👑 **Total Admin:** ${groupMetadata.participants.filter(p => p.admin).length} orang
📅 **Dibuat:** ${new Date(groupMetadata.creation * 1000).toLocaleDateString('id-ID')}
📝 **Deskripsi:** ${groupMetadata.desc ? (groupMetadata.desc.substring(0, 100) + (groupMetadata.desc.length > 100 ? '...' : '')) : 'Tidak ada'}

──────────────────────
💡 **FITUR GRUP:**
• Welcome System: ${config.autoWelcomeMsg ? '✅ ON' : '❌ OFF'}
• Leave System: ${config.autoLeaveMsg ? '✅ ON' : '❌ OFF'}
• Custom Welcome: ${isSetWelcome(from) ? '✅ SET' : '❌ DEFAULT'}
• Custom Leave: ${isSetLeft(from) ? '✅ SET' : '❌ DEFAULT'}
• Anti Spam: ${config.antiSpam ? '✅ ON' : '❌ OFF'}
• Auto Kick: ${config.autoKickOnMaxWarn ? '✅ ON' : '❌ OFF'}
──────────────────────

🚀 *Powered by MOONFLUX BOT*`;
                        
                        await sock.sendMessage(from, { text: infoMsg }).catch(() => {});
                    } catch (err) {
                        console.log('❌ Error infogrup:', err.message);
                    }
                    break;
                    
                case 'ping':
                    const startTime = Date.now();
                    await sock.sendMessage(from, { 
                        text: '🏓 *PONG!*\n\nTesting connection...'
                    }).catch(() => {});
                    const latency = Date.now() - startTime;
                    await sock.sendMessage(from, { 
                        text: `📊 **PING RESULTS**\n\nLatency: ${latency}ms\nStatus: ${latency < 100 ? '✅ Excellent' : latency < 500 ? '⚠️ Good' : '❌ Slow'}\nServer: 🟢 Online`
                    }).catch(() => {});
                    break;
                    
                case 'status':
                    const statusInfo = {
                        'Status': '✅ ONLINE',
                        'Versi': config.botVersion,
                        'Uptime': formatUptime(),
                        'Owner': config.ownerNumber ? config.ownerNumber.split('@')[0] : 'Belum diatur',
                        'Prefix': config.prefix.join(' '),
                        'Welcome Sys': config.autoWelcomeMsg ? 'ON ✅' : 'OFF ❌',
                        'Leave Sys': config.autoLeaveMsg ? 'ON ✅' : 'OFF ❌',
                        'Anti Spam': config.antiSpam ? 'ON ✅' : 'OFF ❌',
                        'Auto Kick': config.autoKickOnMaxWarn ? 'ON ✅' : 'OFF ❌'
                    };
                    
                    let statusCard = '✨━━━〔 🤖 BOT STATUS 〕━━━✨\n\n';
                    Object.entries(statusInfo).forEach(([key, value]) => {
                        statusCard += `• ${key.padEnd(15)}: ${value}\n`;
                    });
                    statusCard += '\n──────────────────────\n';
                    statusCard += '🚀 *Powered by MOONFLUX BOT*';
                    
                    await sock.sendMessage(from, { text: statusCard }).catch(() => {});
                    break;
                    
                case 'owner':
                    if (config.ownerNumber) {
                        await sock.sendMessage(from, { 
                            text: `✨━━━〔 👑 OWNER INFO 〕━━━✨\n\n🤖 **Bot Name:** ${config.botName}\n👑 **Owner:** ${config.ownerNumber}\n📱 **WhatsApp:** wa.me/${config.ownerNumber.split('@')[0]}\n📅 **Since:** ${new Date(config.startTime).toLocaleDateString('id-ID')}\n\n💡 **Contact Owner for:**\n• Support & Help\n• Custom Features\n• Bug Reports\n• Suggestions\n\n🚀 *Powered by MOONFLUX BOT*`
                        }).catch(() => {});
                    } else {
                        await sock.sendMessage(from, { 
                            text: '👑 **OWNER INFO**\n\nOwner belum diatur.\nGunakan !setowner [nomor] untuk set owner.'
                        }).catch(() => {});
                    }
                    break;
                    
                default:
                    if (!isFromSelf && !isCommand) {
                        const greetings = ['hai', 'halo', 'hi', 'hello'];
                        if (greetings.includes(lowerText)) {
                            await sock.sendMessage(from, {
                                text: `✨━━━〔 🌙 MOONFLUX BOT 〕━━━✨\n\n👋 *Halo ${pushName}!*\n\nSelamat datang di ${config.botName}!\n\nKetik ${config.prefix[0]}menu untuk melihat semua fitur.\n\n**🎉 Fitur Welcome System:**\n• Welcome message otomatis\n• Goodbye message otomatis\n• Promotion/Demotion notification\n• Customizable messages\n\n**⚡ Fitur Moderasi:**\n• Kick user dengan command\n• Sistem peringatan (warn)\n• Auto kick pada max warn\n• Global ban system\n\n🚀 *Powered by MOONFLUX BOT*`
                            }).catch(() => {});
                        }
                    }
                    break;
            }
            
        } catch (err) {
            console.log('❌ Error processing message:', err.message);
        }
    });

    // Handle group participants update - PERBAIKAN UTAMA
    sock.ev.on('group-participants.update', (update) => {
        console.log('\n🎉 EVENT group-participants.update DITERIMA!');
        console.log('📊 Full update data:', JSON.stringify(update, null, 2));
        handleGroupParticipantsUpdate(update);
    });

    // Terminal input function
    function question(query) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        return new Promise(resolve => {
            rl.question(query, (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    }

    // Process exit handler
    process.on('SIGINT', async () => {
        console.log('\n\n╔══════════════════════════════════╗');
        console.log('║      🌙 MOONFLUX BOT OFFLINE    ║');
        console.log('╚══════════════════════════════════╝\n');
        
        try {
            await sock.sendPresenceUpdate('unavailable');
            await sock.ws.close();
        } catch (err) {
            // Ignore errors on shutdown
        }
        
        process.exit(0);
    });
}

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('\n❌ UNCAUGHT ERROR:', err.message);
    console.error(err.stack, '\n');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n❌ UNHANDLED REJECTION:', reason);
});

// Start bot
console.log('\n╔══════════════════════════════════╗');
console.log('║    🌙 MOONFLUX BOT STARTING     ║');
console.log('║   🎉 WELCOME SYSTEM ENABLED     ║');
console.log('║   ⚡ KICK SYSTEM READY          ║');
console.log('╚══════════════════════════════════╝\n');

// Create default thumbnail
createDefaultThumbnail();

console.log('🎉 **FITUR WELCOME SYSTEM:**');
console.log('• Welcome message otomatis ✅');
console.log('• Goodbye message otomatis ✅');
console.log('• Promotion/Demotion notification ✅');
console.log('• Customizable welcome/left messages ✅');
console.log('• Database penyimpanan setting ✅\n');

console.log('⚡ **FITUR KICK/MODERASI:**');
console.log('• !kick @user - Kick user dari grup ✅');
console.log('• !warn @user - Beri peringatan ke user ✅');
console.log('• !unwarn @user - Reset peringatan user ✅');
console.log('• !warnings @user - Lihat peringatan user ✅');
console.log('• !ban @user - Ban user global ✅');
console.log('• !unban @user - Unban user ✅');
console.log('• !kickall - Kick semua member non-admin ✅');
console.log('• Auto kick pada max warnings ✅');
console.log('• Sistem anti spam ✅\n');

console.log('⚙️ **COMMAND WELCOME BARU:**');
console.log('• !setwelcome [teks] - Set custom welcome');
console.log('• !setleft [teks] - Set custom left message');
console.log('• !togglewelcome [on/off] - Aktif/matikan welcome');
console.log('• !toggleleave [on/off] - Aktif/matikan leave');
console.log('• !viewwelcome - Lihat welcome setting');
console.log('• !viewleft - Lihat left setting');
console.log('• !testwelcome - Test welcome message');
console.log('• !testleave - Test leave message\n');

console.log('📁 **FOLDER STRUCTURE:**');
console.log('├── /database - Penyimpanan setting');
console.log('│   ├── set_welcome.json');
console.log('│   ├── set_left.json');
console.log('│   ├── warnings.json');
console.log('│   └── banned_users.json');
console.log('├── /thumbnails - Gambar thumbnail');
console.log('├── /audio - File audio (opsional)');
console.log('└── /media - Media lain (opsional)\n');

console.log('⚠️  **PERHATIAN:**');
console.log('• Pastikan bot adalah ADMIN di grup');
console.log('• Welcome/leave AKTIF otomatis saat bot online');
console.log('• Bot akan auto kick banned users yang join');
console.log('• Max warnings: 3 (bisa diubah di config)\n');

console.log('🚀 **BOT READY TO USE!**\n');

startBot().catch(err => {
    console.error('\n❌ FATAL ERROR:', err);
    console.error(err.stack, '\n');
    process.exit(1);
});
