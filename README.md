🌙 MOONFLUX WhatsApp Bot

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=15&height=200&section=header&text=MOONFLUX%20BOT&fontSize=60&fontColor=ffffff&animation=fadeIn&desc=Advanced%20WhatsApp%20Bot%20System&descAlign=50&descAlignY=65" />
</p>

<p align="center">
  <strong>🎉 Auto Welcome System • ⚡ Kick System • 📊 Moderation Tools</strong><br/>
  <sub>Stable • Fast • Elegant WhatsApp Bot Solution</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-v3.8-9d4edd?style=for-the-badge&logo=github" />
  <img src="https://img.shields.io/badge/Status-Online-38b000?style=for-the-badge&logo=whatsapp" />
  <img src="https://img.shields.io/badge/Features-1650+-ff6d00?style=for-the-badge&logo=stars" />
  <img src="https://img.shields.io/badge/License-MIT-0077b6?style=for-the-badge&logo=open-source-initiative" />
</p>

---

✨ Anime-Inspired Power Display

<p align="center">
  <!-- Anime Character Placeholder - Replace with actual images -->
  <img src="https://i.ibb.co/0jjQ12j1/f02f8eef4c7f.png" width="56" />
  <img src="https://i.ibb.co/xSMNdsS0/36d241b696a2.png" width="56" />
  <img src="https://i.ibb.co/vxqhdyFB/a65df3a1d5c8.png" width="56" />
  <img src="https://i.ibb.co/gbWhFtxs/5cf427ca69cf.png" width="56" />
  <img src="https://i.ibb.co/7JRVMWv9/cb3a6edefae5.png" width="56" />
</p>

<table align="center">
  <tr>
    <th>Anime Analogy</th>
    <th>Bot Feature</th>
    <th>Power Level</th>
  </tr>
  <tr>
    <td>Gojo — Limitless</td>
    <td>Welcome System</td>
    <td>███████████░░ 90%</td>
  </tr>
  <tr>
    <td>Sharingan</td>
    <td>Auto Moderation</td>
    <td>████████████░ 95%</td>
  </tr>
  <tr>
    <td>Bankai</td>
    <td>Group Management</td>
    <td>██████████░░░ 85%</td>
  </tr>
  <tr>
    <td>Shadow Clone</td>
    <td>Multi-Command</td>
    <td>███████████░░ 88%</td>
  </tr>
  <tr>
    <td>Levi Style</td>
    <td>Fast Response</td>
    <td>███████████░░ 92%</td>
  </tr>
</table>

<sub>※ System optimized for stability and performance</sub>

---

🚀 Quick Start Guide

📦 Prerequisites

```bash
Node.js v18+ • WhatsApp Account • Terminal Access • Stable Internet
```

⚙️ Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/momonpxl/moonflux-bot.git
cd moonflux-bot

# 2. Install dependencies
npm install

# 3. Start the bot
node index.js

# 4. Connect your WhatsApp
#    Option A: Scan QR Code (Recommended)
#    Option B: Use Pairing Code
```

🔑 First Time Setup

1. Run the bot for the first time
2. Choose connection method:
   · QR Code: Scan with WhatsApp → Linked Devices
   · Pairing Code: Enter your number, get code, link device
3. Set owner number when prompted
4. Bot automatically creates necessary directories

---

🎯 Feature Showcase

🎉 Welcome System (Perfect Susano'o Level)

```bash
• Auto Welcome Messages ✅
• Customizable Welcome Text ✅
• Variable Support (@user, @group, @desc) ✅
• Leave Message System ✅
• Promotion/Demotion Notification ✅
• Test Mode (!testwelcome, !testleave) ✅
```

⚡ Moderation (Unlimited Blade Works)

```bash
• !kick @user - Remove users ✅
• !warn @user - Warning system (1-3) ✅
• !unwarn @user - Reset warnings ✅
• !warnings @user - Check warnings ✅
• Auto Kick on Max Warn (3x) ✅
• Global Ban System (!ban, !unban) ✅
• !kickall - Remove all non-admins ✅
```

📊 Group Tools (Super Saiyan Blue)

```bash
• !infogrup - Detailed group info ✅
• !tagall [message] - Mention everyone ✅
• !tagadmin - Mention all admins ✅
• !listadmin - Show admin list ✅
• !linkgrup - Get group link ✅
• !totalmember - Member count ✅
```

👑 Owner Commands (Will of Fire)

```bash
• !bc [message] - Broadcast to all groups ✅
• !setowner [number] - Change owner ✅
• !status - Bot status & uptime ✅
• !leave - Bot leaves group ✅
• !toggle [on/off] - Toggle features ✅
```

🛠️ Utility Commands

```bash
• !menu / !help - Display all commands ✅
• !ping - Check bot latency ✅
• !owner - Show owner info ✅
• !prefix - Show current prefixes ✅
```

---

⚙️ Configuration Preview

```json
{
  "ownerNumber": "+6283895513613",
  "botName": "MOONFLUX 🌙",
  "prefix": ["!", ".", "/"],
  "autoReadMessages": true,
  "selfCommands": true,
  "botVersion": "v3.8",
  "developer": "momonpxl",
  "totalFeatures": 1650,
  "autoWelcomeMsg": true,
  "autoLeaveMsg": true,
  "autoPromoteMsg": true,
  "autoDemoteMsg": true,
  "antiSpam": true,
  "maxWarnings": 3,
  "autoKickOnMaxWarn": true
}
```

---

📁 Project Structure

```
moonflux-bot/
├── 📂 auth_info/              # WhatsApp session storage
│   ├── creds.json            # Encrypted credentials
│   ├── app-state.json        # Connection state
│   └── ...                   # Other session files
├── 📂 database/               # JSON database system
│   ├── set_welcome.json      # Custom welcome messages
│   ├── set_left.json         # Custom leave messages
│   ├── warnings.json         # User warning tracking
│   └── banned_users.json     # Global ban list
├── 📂 thumbnails/            # Image assets
│   └── default.jpg           # Default thumbnail
├── 📂 audio/                 # Audio files (welcome sounds)
├── 📂 media/                 # Media storage
├── ⚙️ config.json            # Main configuration file
├── 🚀 index.js              # Core bot file
├── 📄 package.json          # Dependencies
└── 📖 README.md            # This documentation
```

---

🧠 Tech Stack Matrix

<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,javascript,json,github,git,vscode,terminal&theme=dark&perline=7" />
</p>

<p align="center">
  <strong>Baileys WhatsApp API • Node.js • JavaScript • JSON Database</strong><br/>
  <sub>Built with stability and performance in mind</sub>
</p>

Technology Purpose Version
Node.js Runtime Environment v18+
@whiskeysockets/baileys WhatsApp Web API Latest
JavaScript Programming Language ES6+
JSON Database Storage -
Pino Logging System Latest
QRCode Terminal QR Display Latest

---

📊 System Analytics

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=momonpxl&show_icons=true&theme=tokyonight&hide_border=true&title_color=9d4edd&icon_color=38b000&text_color=ffffff&bg_color=0d1117" width="400" />
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=momonpxl&layout=compact&theme=tokyonight&hide_border=true&title_color=9d4edd&text_color=ffffff&bg_color=0d1117&langs_count=6" width="350" />
</p>

---

🎮 Command Usage Examples

🎉 Welcome System Commands

```bash
# Set custom welcome message with variables
!setwelcome Welcome @user to @group! 🎉
Member count: @count
Group description: @desc

# Set custom leave message
!setleft Goodbye @user from @group! 👋
We'll miss you!

# Toggle welcome system
!togglewelcome on
!togglewelcome off

# View current settings
!viewwelcome
!viewleft

# Test the messages
!testwelcome
!testleave
```

⚡ Moderation Commands

```bash
# Kick a user (admin only)
!kick @user

# Warning system
!warn @user        # Give warning (max 3)
!unwarn @user      # Reset warnings
!warnings @user    # Check warnings

# Ban system (owner only)
!ban @user         # Global ban
!unban @user       # Remove ban

# Mass moderation
!kickall           # Kick all non-admins
```

📊 Group Management

```bash
# Get group information
!infogrup

# Tag systems
!tagall Important announcement everyone!
!tagadmin
!tagrandom 5       # Tag 5 random members
!tagme

# Hide tag (no notification)
!hidetag Silent announcement
```

👑 Owner Commands

```bash
# Broadcast message to all groups
!bc Maintenance at 3 AM

# Set/change owner
!setowner 6283895513613

# Check bot status
!status

# Leave current group
!leave

# Toggle features
!toggle selfcommands on
```

---

⚠️ Important Notes

🔐 Admin Requirements

```
• Bot MUST be admin for kick/warn commands
• Bot MUST be admin for welcome/leave messages
• Only admins can use moderation commands
• Only owner can use global ban commands
• Welcome system works even if bot is not admin
```

🛡️ Safety Features

```
• Anti-spam protection enabled
• Auto-kick on max warnings (3 strikes)
• User warning tracking per group
• Global ban system across all groups
• Rate limiting protection
• Session encryption
```

⚡ Performance Optimizations

```
• Auto-reconnection on disconnect
• Connection retry mechanism
• Lightweight JSON database
• Efficient memory usage
• Fast response time (< 500ms)
```

---

👑 Developer Profile

<p align="center">
  <img src="https://i.ibb.co/xSMNdsS0/36d241b696a2.png" width="90"/>
  <img src="https://i.ibb.co/vxqhdyFB/a65df3a1d5c8.png" width="90"/>
  <img src="https://i.ibb.co/gbWhFtxs/5cf427ca69cf.png" width="90"/>
  <img src="https://i.ibb.co/7JRVMWv9/cb3a6edefae5.png" width="90"/>
  <img src="https://i.ibb.co/0jjQ12j1/f02f8eef4c7f.png" width="90"/>
</p>

<table align="center">
  <tr>
    <td align="center" width="200">
      <strong>👤 Developer</strong><br/>
      <sub>momonpxl</sub>
    </td>
    <td align="center" width="200">
      <strong>📱 WhatsApp</strong><br/>
      <sub>+62 838-9551-3613</sub>
    </td>
    <td align="center" width="200">
      <strong>📸 Instagram</strong><br/>
      <sub>@momonpxl</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="200">
      <strong>🎵 TikTok</strong><br/>
      <sub>@momonxpl</sub>
    </td>
    <td align="center" width="200">
      <strong>📨 Telegram</strong><br/>
      <sub>t.me/momonpxl</sub>
    </td>
    <td align="center" width="200">
      <strong>🌐 Website</strong><br/>
      <sub>store.momon.web.id</sub>
    </td>
  </tr>
</table>

---

🔗 Connect With Developer

<p align="center">
  <a href="https://wa.me/6283895513613">
    <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white&label=Contact%20Owner"/>
  </a>
  <a href="https://www.instagram.com/momonpxl">
    <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white&label=Follow%20Instagram"/>
  </a>
  <a href="https://t.me/momonpxl">
    <img src="https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white&label=Telegram%20Channel"/>
  </a>
  <a href="https://www.tiktok.com/@momonxpl">
    <img src="https://img.shields.io/badge/TikTok-000000?style=for-the-badge&logo=tiktok&logoColor=white&label=TikTok%20Content"/>
  </a>
  <a href="https://store.momon.web.id">
    <img src="https://img.shields.io/badge/Website-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white&label=Official%20Website"/>
  </a>
</p>

---

💭 Development Philosophy

"In the realm of code, I blend anime-inspired creativity with technical precision — creating systems that are both powerful and elegant. Every feature tells a story, every command has purpose."

Core Principles:

1. Stability First - Reliable performance over flashy features
2. User Experience - Intuitive commands and helpful responses
3. Anime Aesthetic - Bringing anime culture into technology
4. Continuous Improvement - Regular updates and feature additions
5. Community Focus - Built for real-world group needs

---

🏆 Credits & Recognition

🎨 Design Inspiration

· Anime aesthetics integration in UI/UX
· Modern design principles for readability
· Clean visual hierarchy and organization
· Consistent color scheme with gradient effects

⚡ Technical Excellence

· Stable Baileys implementation with error handling
· Efficient JSON database management system
· Optimized performance with fast response times
· Modular code structure for easy maintenance

👑 Developer Signature

```
Project: MOONFLUX BOT
Developer: momonpxl
Version: v3.8
Status: PRODUCTION READY
Power Level: MAX
Anime Mode: ACTIVATED
```

📚 Libraries Used

· Baileys - WhatsApp Web API
· Pino - Lightweight logger
· QRCode Terminal - QR display
· Axios - HTTP client (optional)

---

🐛 Troubleshooting Guide

Common Issues & Solutions

Issue Solution
QR Code not showing Delete auth_info folder and restart
Bot not responding Check if bot is admin for that command
Welcome messages not working Enable autoWelcomeMsg in config
Connection drops Wait 5 min, auto-reconnect will trigger
Command not recognized Check prefix (! . /) in config
Cannot kick users Bot must be admin to use kick command

Error Messages

```bash
# If you see "Logged Out"
- Delete auth_info folder
- Restart bot and scan QR again

# If you see "Connection timeout"
- Check your internet connection
- Wait 5-10 minutes and retry

# If commands don't work in group
- Make bot admin in group settings
- Check group permissions
```

Performance Tips

1. Regular Maintenance: Clear old session files monthly
2. Backup Database: Backup database/ folder regularly
3. Update Dependencies: Run npm update monthly
4. Monitor Logs: Check terminal for error messages
5. Restart Bot: Weekly restart for fresh connection

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,50:16213e,100:0f3460&height=120&section=footer&text=MOONFLUX%20BOT&fontSize=30&fontColor=ffffff" />
  <br/>
  <sub><b>Professional Level: ∞ | System Stability: 99.9% | Delivery: PLUS ULTRA</b></sub>
</p>

<p align="center">
  <sub>© 2024 momonpxl • All rights reserved • Made with ❤️ and anime power</sub>
  <br/>
  <sub>Version 3.8 • Last Updated: $(date +%Y-%m-%d)</sub>
</p>

---

📄 Quick Reference Card

```bash
# MOST USED COMMANDS
!menu           # Show all features
!kick @user     # Remove user from group
!warn @user     # Give warning to user
!infogrup       # Group information
!setwelcome     # Custom welcome message
!status         # Bot status check
!ping           # Test connection speed
!owner          # Owner information

# SUPPORT & CONTACT
Owner: momonpxl
WhatsApp: +62 838-9551-3613
Instagram: @momonpxl
Website: store.momon.web.id

# IMPORTANT NOTES
• Bot must be admin for moderation commands
• Welcome system works automatically
• Use !menu to see all available commands
• Report bugs to owner via WhatsApp
```

---

🌟 Star History

https://api.star-history.com/svg?repos=momonpxl/moonflux-bot&type=Date

---

Note: This bot is actively maintained and updated regularly with new features and improvements. Check back often for updates!

Disclaimer: This bot is for educational purposes. Please comply with WhatsApp's Terms of Service and use responsibly.

---

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=momonpxl-moonflux&label=Repository%20Views&color=blue&style=flat" alt="Repository Views" />
  <img src="https://img.shields.io/github/stars/momonpxl/moonflux-bot?style=social" alt="GitHub Stars" />
  <img src="https://img.shields.io/github/forks/momonpxl/moonflux-bot?style=social" alt="GitHub Forks" />
</p>
