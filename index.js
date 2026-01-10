const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

/* ======================
   الإعدادات
   ====================== */

const separatorChannelID = '1451696498214703246';
const separatorImageFile = './boty.PNG';

const usersReplies = {
  '1406416452310925496': 'لبيه يادحومي',
  '765750374166167562': 'لبيه يا حمودي',
  '1406421385428992135': 'لبيه يا نجد',
  '1406429112502976556': 'لبيه يا لولو ارحبي امريني بس',
  '1406430943321002016': 'لبيه يا لانا',
  '1417274940536782989': 'هلا بوفه هلا',
  '1375217824187814161': 'ارحب يالريس 🫡'
};

const ownerIds = ['1278197844259639322', '1406429112502976556'];

const TIMEOUT_DURATION = 60 * 1000;
const restartCommand = 'ريستارت';

/* ======================
   كول داون الردود
   ====================== */

const lastReplyMap = new Map();
const REPLY_COOLDOWN = 60 * 1000;

/* ======================
   الترحيب بعد الغياب
   ====================== */

const lastMessageMap = new Map();
const welcomeOwnerId = '1406429112502976556';
const ABSENCE_TIME = 60 * 60 * 1000;

/* ======================
   جاهزية البوت
   ====================== */

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

/* ======================
   التعامل مع الرسائل
   ====================== */

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();
  const userId = message.author.id;
  const now = Date.now();

  /* ======================
     رد السلام
     ====================== */

  if (content === 'السلام عليكم') {
    await message.reply('وعليكم السلام');
    return;
  }

  /* ======================
     كفارة المجلس
     ====================== */

  if (content === 'كفاره المجلس') {
    await message.reply(
      'سبحانك اللهم وبحمدك، أشهد أن لا إله إلا أنت، أستغفرك وأتوب إليك'
    );
    return;
  }

  /* ======================
     أمر مسح الرسائل (للجميع)
     ====================== */

  if (content.startsWith('امسح')) {
    const args = content.split(' ');
    const amount = parseInt(args[1]);

    if (!amount || isNaN(amount)) {
      await message.reply('❌ استخدم الأمر كذا: امسح 10');
      return;
    }

    if (amount < 1 || amount > 100) {
      await message.reply('❌ العدد لازم يكون بين 1 و 100');
      return;
    }

    try {
      await message.channel.bulkDelete(amount, true);
      const confirm = await message.channel.send(`🧹 تم مسح ${amount} رسالة`);
      setTimeout(() => confirm.delete().catch(() => {}), 3000);
    } catch (err) {
      console.error(err);
      await message.reply('❌ البوت ما عنده صلاحية مسح الرسائل');
    }

    return;
  }

  /* ======================
     أوامر بوت الخاصة
     ====================== */

  if (content === 'بوت تحبني') {
    await message.reply('اموت فيك');
    return;
  }

  if (content === 'بوت احضني') {
    await message.reply('ما تبي كنتاكي بعد');
    return;
  }

  if (
    userId === '1406421385428992135' &&
    content === 'بوت قول لي قصيده'
  ) {
    await message.reply(
      'يانجد الاحباب لك حدر القمر صوره\nطفله هلال و بنت خمسه عشر بدرا'
    );
    return;
  }

  /* ======================
     إرسال الفاصل (صورة)
     ====================== */

  if (message.channel.id === separatorChannelID) {
    try {
      const attachment = new AttachmentBuilder(separatorImageFile);
      await message.channel.send({ files: [attachment] });
    } catch (err) {
      console.error('خطأ في إرسال الفاصل:', err);
    }
  }

  /* ======================
     الرد على "بوت" فقط
     ====================== */

  if (content === 'بوت' && usersReplies[userId]) {
    const lastReply = lastReplyMap.get(userId);

    if (!lastReply || now - lastReply >= REPLY_COOLDOWN) {
      await message.reply(usersReplies[userId]);
      lastReplyMap.set(userId, now);
    } else {
      await message.reply('لا تفلها عاد');
    }
  }

  /* ======================
     تايم أوت
     ====================== */

  if (
    content === 'اوت' &&
    message.reference &&
    ownerIds.includes(userId)
  ) {
    try {
      const repliedMessage = await message.channel.messages.fetch(
        message.reference.messageId
      );

      const member = await message.guild.members.fetch(
        repliedMessage.author.id
      );

      await member.timeout(TIMEOUT_DURATION, 'تايم أوت من Owner');
      await message.reply('القم تايم اوت');
    } catch (err) {
      console.error(err);
      await message.reply('❌ ما قدرت أعطيه تايم أوت');
    }
  }

  /* ======================
     إعادة تشغيل
     ====================== */

  if (content === restartCommand && ownerIds.includes(userId)) {
    await message.reply('🔄 جاري إعادة تشغيل البوت...');
    process.exit(0);
  }

  /* ======================
     الترحيب بعد الغياب
     ====================== */

  const lastTime = lastMessageMap.get(userId);

  if (lastTime && now - lastTime >= ABSENCE_TIME) {
    if (userId === welcomeOwnerId) {
      await message.reply('أرحب يا أطلق أونر 🫡');
    } else {
      await message.reply('أرحب يا مطنوخ، وين كنت لك فقده');
    }
  }

  lastMessageMap.set(userId, now);
});

/* ======================
   تسجيل الدخول
   ====================== */

client.login(process.env.TOKEN);
