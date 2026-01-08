const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ===== الإعدادات =====
const separatorChannelID = '1451696498214703246';
const separatorImageFile = './separator.png';

// الردود التلقائية لكل شخص
const usersReplies = {
  '1406416452310925496': 'لبيه يادحومي',
  '765750374166167562': 'لبيه يا حمودي',
  '1406421385428992135': 'لبيه يا نجد',
  '1406429112502976556': 'لبيه يا لولو',
  '1406420180279623832': 'أرحبي يا لانا',
  '141727494053678299': 'هلا بوفه هلا',
  '1375217824187814161': 'ارحب يالريس 🫡'
};

// الأشخاص اللي يقدرون يعطون تايم أوت
const ownerIds = ['1278197844259639322', '1406429112502976556'];

// مدة التايم أوت
const TIMEOUT_DURATION = 60 * 1000; // دقيقة

const restartCommand = 'ريستارت';

// ===== Anti-Spam =====
const spamMap = new Map();
const SPAM_LIMIT = 4;
const SPAM_TIME = 30 * 1000; // 30 ثانية

// ===== الردود مرة واحدة في الدقيقة =====
const lastReplyMap = new Map();
const REPLY_COOLDOWN = 60 * 1000; // دقيقة

// ===== الترحيب بعد الغياب =====
const lastMessageMap = new Map();
const welcomeOwnerId = '1406429112502976556'; // الأونر
const ABSENCE_TIME = 60 * 60 * 1000; // ساعة غياب

// ===== جاهزية البوت =====
client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ===== التعامل مع الرسائل =====
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();
  const userId = message.author.id;
  const now = Date.now();

  // ---- Anti-Spam ----
  if (!spamMap.has(userId)) {
    spamMap.set(userId, { count: 1, firstMessage: now });
  } else {
    const data = spamMap.get(userId);
    if (now - data.firstMessage < SPAM_TIME) {
      data.count++;
      if (data.count === SPAM_LIMIT) {
        await message.channel.send('هدي قاعد تسولف بسرعه محد يطردك يالذيب ');
      }
    } else {
      spamMap.set(userId, { count: 1, firstMessage: now });
    }
  }

  // ---- إرسال الفاصل ----
  if (message.channel.id === separatorChannelID) {
    try {
      const attachment = new AttachmentBuilder(separatorImageFile);
      await message.channel.send({ files: [attachment] });
    } catch (err) {
      console.error('خطأ في إرسال الفاصل:', err);
    }
  }

  // ---- الردود التلقائية مرة واحدة في الدقيقة ----
  if (usersReplies[userId] && msg.includes('بوت')) {
    const lastReply = lastReplyMap.get(userId);
    if (!lastReply || now - lastReply >= REPLY_COOLDOWN) {
      await message.channel.send(usersReplies[userId]);
      lastReplyMap.set(userId, now);
    } else {
      await message.channel.send('لا تفلها عاد ');
    }
  }

  // ---- الرد على الضحك ----
  const laughRegex = /ه{2,}/; // أي كلمة فيها أكثر من حرف "ه" متتالي
  if (laughRegex.test(msg)) {
    const lastLaugh = lastReplyMap.get(userId + '_laugh');
    if (!lastLaugh || now - lastLaugh >= REPLY_COOLDOWN) {
      await message.channel.send('دوم يا مطنوخ 🫡');
      lastReplyMap.set(userId + '_laugh', now);
    }
  }

  // ---- تايم أوت ----
  if (msg === 'اوت' && message.reference && ownerIds.includes(userId)) {
    try {
      const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
      const member = await message.guild.members.fetch(repliedMessage.author.id);

      await member.timeout(TIMEOUT_DURATION, 'تايم أوت من Owner');
      await message.channel.send(`القم تايم اوت`);
    } catch (err) {
      console.error(err);
      await message.channel.send('❌ ما قدرت أعطيه تايم أوت');
    }
  }

  // ---- إعادة تشغيل ----
  if (msg === restartCommand && ownerIds.includes(userId)) {
    await message.channel.send('🔄 جاري إعادة تشغيل البوت...');
    process.exit(0);
  }

  // ---- الترحيب بعد الغياب ----
  const lastTime = lastMessageMap.get(userId);
  if (userId === welcomeOwnerId) {
    if (lastTime && now - lastTime >= ABSENCE_TIME) {
      await message.channel.send('أرحب يا أطلق أونر 🫡');
    }
  } else {
    if (lastTime && now - lastTime >= ABSENCE_TIME) {
      await message.channel.send('أرحب يا مطنوخ، وين كنت لك فقده');
    }
  }
  lastMessageMap.set(userId, now);
});

// ===== تسجيل الدخول =====
client.login(process.env.TOKEN);