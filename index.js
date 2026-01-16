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
const commandImageFile = './boty2.JPG';

const usersReplies = {
  '1406416452310925496': 'لبيه يادحومي',
  '765750374166167562': 'لبيه يا حمودي',
  '1406421385428992135': 'لبيه يا نجد',
  '1406429112502976556': 'لبيه يا لولو ارحبي امريني بس',
  '1406430943321002016': 'لبيه يا لانا',
  '1417274940536782989': 'هلا بوفه هلا',
  '1375217824187814161': 'ارحب يالريس 🫡'
};

const ownerIds = [
  '1278197844259639322',
  '1406429112502976556',
  '1406416452310925496'
];

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
   بنك أسئلة عامة
====================== */
const questions = [
  { q: 'ما أطول نهر في العالم؟', a: 'النيل' },
  { q: 'ما أكبر قارة في العالم؟', a: 'آسيا' },
  { q: 'ما أصغر دولة في العالم؟', a: 'الفاتيكان' },
  { q: 'ما الكوكب الأقرب للشمس؟', a: 'عطارد' },
  { q: 'كم عدد القارات؟', a: '7' },
  { q: 'ما أعلى جبل في العالم؟', a: 'إيفرست' },
  { q: 'ما الدولة التي ليس لها جيش؟', a: 'كوستاريكا' },
  { q: 'ما الدولة التي يطلق عليها بلد المليون بحيرة؟', a: 'فنلندا' },
  { q: 'ما الحيوان الملقب بسفينة الصحراء؟', a: 'الجمل' },
  { q: 'ما عاصمة اليابان؟', a: 'طوكيو' },
  { q: 'ما عاصمة فرنسا؟', a: 'باريس' },
  { q: 'ما أكبر محيط في العالم؟', a: 'المحيط الهادئ' },
  { q: 'ما أسرع حيوان بري؟', a: 'الفهد' },
  { q: 'ما أكبر صحراء في العالم؟', a: 'الصحراء الكبرى' }
];

let questionActive = false;
let currentAnswer = '';

function getRandomQuestion() {
  return questions[Math.floor(Math.random() * questions.length)];
}

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

  /* ===== تشغيل سؤال ===== */
  if (content === 'سؤال' && ownerIds.includes(userId)) {
    if (questionActive) {
      await message.reply('فيه سؤال شغال الحين');
      return;
    }

    const q = getRandomQuestion();
    questionActive = true;
    currentAnswer = q.a;

    await message.channel.send(` **سؤال الفعالية:**\n${q.q}`);
    return;
  }

  if (questionActive && content === currentAnswer) {
    questionActive = false;
    await message.reply('اجابه صحيحه ياوحش');
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
  await message.reply('🫂');
  return;
}

// رجعنا أمر "بوت قول لي قصيده"
if (userId === '1406421385428992135' && content === 'بوت قول لي قصيده') {
  await message.reply(
    'يانجد الاحباب لك حدر القمر صوره\nطفله هلال و بنت خمسه عشر بدرا'
  );
  return;
}

/* ======================
   أمر "بوت عطه وحده ما تبي كنتاكي بعد"
====================== */
if (message.reference && content === 'بوت عطه وحده ما تبي كنتاكي بعد') {
  try {
    const repliedMessage = await message.channel.messages.fetch(
      message.reference.messageId
    );

    const attachment = new AttachmentBuilder(commandImageFile);
    await repliedMessage.reply({ files: [attachment] });
  } catch (err) {
    console.error('خطأ في إرسال الصورة:', err);
    await message.reply('ما قدرت أرسل الصورة');
  }
  return;
}  /* ===== السلام ===== */
  if (content === 'السلام عليكم') {
    await message.reply('وعليكم السلام');
    return;
  }

  /* ===== كفارة المجلس ===== */
  if (content === 'كفاره المجلس') {
    await message.reply(
      'سبحانك اللهم وبحمدك، أشهد أن لا إله إلا أنت، أستغفرك وأتوب إليك'
    );
    return;
  }

  /* ===== مسح الرسائل ===== */
  if (content.startsWith('امسح')) {
    const args = content.split(' ');
    const amount = parseInt(args[1]);

    if (!amount || isNaN(amount)) {
      await message.reply('استخدم الأمر كذا: امسح 10');
      return;
    }

    if (amount < 1 || amount > 1000) {
      await message.reply('العدد لازم يكون بين 1 و 1000');
      return;
    }

    try {
      await message.channel.bulkDelete(amount, true);
      const confirm = await message.channel.send(`تم مسح ${amount} رسالة`);
      setTimeout(() => confirm.delete().catch(() => {}), 3000);
    } catch (err) {
      await message.reply('البوت ما عنده صلاحية مسح الرسائل');
    }
    return;
  }

  /* ===== الفاصل ===== */
  if (message.channel.id === separatorChannelID) {
    const attachment = new AttachmentBuilder(separatorImageFile);
    await message.channel.send({ files: [attachment] });
  }

  /* ===== تايم أوت ===== */
  if (content === 'اوت' && message.reference && ownerIds.includes(userId)) {
    try {
      const repliedMessage = await message.channel.messages.fetch(
        message.reference.messageId
      );
      const member = await message.guild.members.fetch(repliedMessage.author.id);
      await member.timeout(TIMEOUT_DURATION, 'تايم أوت');
      await message.reply(' القم تايم اوت');
    } catch {
      await message.reply(' ما قدرت أعطيه تايم أوت');
    }
  }

  lastMessageMap.set(userId, now);
});

/* ======================
   تسجيل الدخول
====================== */
client.login(process.env.TOKEN);
