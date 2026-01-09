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
const separatorImageFile = './boty.PNG';

// الردود التلقائية لكل شخص
const usersReplies = {
  '1406416452310925496': 'لبيه يادحومي',
  '765750374166167562': 'لبيه يا حمودي',
  '1406421385428992135': 'لبيه يا نجد',
  '1406429112502976556': 'لبيه يا لولو ارحبي امريني بس',
  '1406430943321002016': 'لبيه يا لانا',
  '1417274940536782989': 'هلا بوفه هلا',
  '1375217824187814161': 'ارحب يالريس 🫡'
};

// الأشخاص اللي يقدرون يعطون تايم أوت
const ownerIds = ['1278197844259639322', '1406429112502976556'];

const TIMEOUT_DURATION = 60 * 1000; // دقيقة
const restartCommand = 'ريستارت';

// ===== كول داون الردود =====
const lastReplyMap = new Map();
const REPLY_COOLDOWN = 60 * 1000;

// ===== الترحيب بعد الغياب =====
const lastMessageMap = new Map();
const welcomeOwnerId = '1406429112502976556';
const ABSENCE_TIME = 60 * 60 * 1000;

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

  // ---- أوامر خاصة ----
  if (msg === 'بوت تحبني') {
    await message.channel.send('اموت فيك');
    return;
  }

  if (msg === 'بوت احضني') {
    await message.channel.send('ما تبي كنتاكي بعد');
    return;
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

  // ---- الردود التلقائية للأشخاص ----
  if (usersReplies[userId] && msg.includes('بوت')) {
    const lastReply = lastReplyMap.get(userId);

    if (!lastReply || now - lastReply >= REPLY_COOLDOWN) {
      await message.channel.send(usersReplies[userId]);
      lastReplyMap.set(userId, now);
    } else {
      await message.channel.send('لا تفلها عاد');
    }
  }

  // ---- الرد على "بوت قول لي قصيده" لمستخدم محدد ----
  if (userId === '1406421385428992135' && msg.includes('بوت قول لي قصيده')) {
    await message.channel.send(
      'يانجد الاحباب لك حدر القمر صوره\nطفله هلال و بنت خمسه عشر بدرا'
    );
  }

  // ---- تايم أوت ----
  if (msg === 'اوت' && message.reference && ownerIds.includes(userId)) {
    try {
      const repliedMessage = await message.channel.messages.fetch(
        message.reference.messageId
      );
      const member = await message.guild.members.fetch(repliedMessage.author.id);

      await member.timeout(TIMEOUT_DURATION, 'تايم أوت من Owner');
      await message.channel.send('القم تايم اوت');
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
  if (lastTime && now - lastTime >= ABSENCE_TIME) {
    if (userId === welcomeOwnerId) {
      await message.channel.send('أرحب يا أطلق أونر 🫡');
    } else {
      await message.channel.send('أرحب يا مطنوخ، وين كنت لك فقده');
    }
  }

  lastMessageMap.set(userId, now);
});

// ===== تسجيل الدخول =====
client.login(process.env.TOKEN);
