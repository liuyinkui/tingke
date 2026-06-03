#!/usr/bin/env node

/**
 * Seed data generator — 70篇初始素材
 *
 * 用法:
 *   node scripts/generate-seed.js
 *     → 输出 70 篇素材 JSON 到 stdout
 *
 *   node scripts/generate-seed.js --save
 *     → 保存到 scripts/materials/seed.json
 *
 *   node scripts/generate-seed.js --seed
 *     → 直接写入数据库（需运行 server）
 */

const fs = require('fs');
const path = require('path');

// ── 70篇素材内容 ─────────────────────────────────────────

function generateCET4Materials() {
  const topics = ['cet-4'];
  const difficulty = 'L2';
  const baseDuration = { min: 60, max: 120 };

  const transcripts = [
    "In modern society, communication plays a vital role in our daily lives. With the development of technology, people can now connect with each other more easily than ever before. However, many young people still find it difficult to express their thoughts clearly. This is especially true when they need to speak in public. The key to improving communication skills is practice and confidence building. Everyone can become a good communicator with enough effort.",
    "Environmental protection has become a global concern in recent years. More and more people are realizing the importance of living a green lifestyle. Simple actions like recycling waste and saving energy can make a big difference. Governments around the world are also taking measures to reduce pollution. It is our responsibility to protect the earth for future generations. Every small step counts towards a better environment.",
    "The internet has changed the way we learn and work. Online education allows students to access knowledge from anywhere in the world. Many universities now offer free online courses on various subjects. This makes education more accessible to people who cannot attend traditional schools. However, online learning also requires self-discipline and time management skills. Students need to be proactive in their studies.",
    "Reading is one of the most beneficial habits a person can develop. It not only improves vocabulary and language skills but also broadens one's horizons. Through reading, we can explore different cultures and perspectives. Many successful people attribute their achievements to a love of reading. Experts recommend reading for at least thirty minutes every day. Even fifteen minutes can make a difference over time.",
    "Traveling is a wonderful way to experience new cultures and create lasting memories. When you visit a foreign country, you get to try local food and learn about different customs. Travel also helps you become more independent and open-minded. Many students choose to study abroad to improve their language skills. Whether it is a short trip or a long journey, traveling always brings valuable experiences.",
    "Technology has transformed the way we communicate with each other. Smartphones and social media platforms keep us connected at all times. However, too much screen time can have negative effects on our health. Doctors recommend taking regular breaks from electronic devices. Balancing online and offline activities is essential for a healthy lifestyle. We should use technology wisely.",
    "The importance of exercise cannot be overstated. Regular physical activity helps maintain a healthy body and mind. Even simple exercises like walking or jogging can improve your mood and energy levels. Many people find it helpful to exercise with friends for motivation. The key is to find an activity that you enjoy and stick with it. Consistency is more important than intensity.",
    "Music is a universal language that brings people together. Different genres of music can evoke different emotions and memories. Learning to play a musical instrument has many benefits for brain development. Many schools include music education as part of their curriculum. Whether you are listening or playing, music enriches our lives in countless ways. It is truly a gift to humanity.",
    "The concept of time management is crucial for success in both academic and professional life. Effective time management allows you to accomplish more in less time. It also reduces stress and helps maintain a healthy work-life balance. Many people use planners or digital apps to organize their schedules. The first step is to prioritize tasks based on their importance and urgency.",
    "Healthy eating habits are essential for overall well-being. A balanced diet provides the nutrients your body needs to function properly. Fruits and vegetables should be an important part of every meal. Drinking enough water is also crucial for maintaining good health. Avoiding processed foods and reducing sugar intake can significantly improve your health.",
    "Friendship is one of the most valuable relationships in life. Good friends support each other through difficult times and celebrate happy moments together. Building strong friendships requires trust, honesty, and mutual respect. In today's busy world, it is important to make time for the people who matter most. Quality friendships can last a lifetime.",
    "The rapid development of artificial intelligence is changing many industries. AI can now perform tasks that once required human intelligence. From healthcare to transportation, AI applications are becoming increasingly common. However, there are also concerns about job displacement and privacy. It is important to develop AI responsibly and ethically.",
    "Learning a second language has numerous cognitive benefits. Studies show that bilingual people have better problem-solving skills and memory. Learning a new language also opens up opportunities for travel and career advancement. While it can be challenging at first, consistent practice leads to improvement. The best way to learn is through daily exposure and conversation.",
    "Cultural diversity makes our world a more interesting place. Different cultures have unique traditions, foods, and ways of thinking. When we understand and appreciate cultural differences, we become more tolerant and empathetic. Globalization has increased cultural exchange between countries. Embracing diversity strengthens communities and promotes peace.",
    "The career landscape is changing rapidly in the twenty-first century. Many traditional jobs are being replaced by automation and technology. New types of jobs are emerging that require different skills. Lifelong learning has become essential for career success. Professionals need to continuously update their knowledge and adapt to change.",
    "Family plays a fundamental role in shaping a person's character and values. The support and guidance of family members help individuals navigate life's challenges. In many cultures, family bonds remain strong throughout a person's life. Spending quality time with family is important for emotional well-being. Strong family relationships provide a foundation for happiness.",
    "Volunteering is a rewarding activity that benefits both the community and the individual. By giving your time to help others, you gain new perspectives and skills. Many organizations rely on volunteers to carry out their missions. Volunteering can also be a great way to meet new people and make friends. It is an experience that enriches your life.",
    "The impact of social media on society is a topic of ongoing debate. While social media helps people stay connected, it can also lead to comparison and anxiety. Studies have found that excessive use of social media may affect mental health. It is important to use these platforms mindfully and take breaks when needed. Finding a healthy balance is key.",
    "Climate change is one of the most pressing issues of our time. Rising temperatures and extreme weather events are affecting communities worldwide. Scientists agree that human activities are contributing to climate change. Reducing carbon emissions and adopting renewable energy are crucial steps. Everyone has a role to play in protecting our planet.",
    "The power of positive thinking should not be underestimated. A positive attitude can help you overcome obstacles and achieve your goals. Optimistic people tend to be healthier and live longer. Practicing gratitude and focusing on the good things in life can improve your outlook. Happiness is often a choice that we make every day.",
  ];

  return transcripts.map((text, i) => ({
    title: `CET-4 真题听力 #${String(i + 1).padStart(2, '0')}`,
    difficulty,
    duration: baseDuration.min + Math.floor(Math.random() * (baseDuration.max - baseDuration.min)),
    transcript: text,
    topics,
  }));
}

function generateCET6Materials() {
  const topics = ['cet-6'];
  const difficulty = 'L3';

  const transcripts = [
    "The relationship between economic growth and environmental sustainability has become a central topic in global discussions. Many developing countries face the challenge of balancing industrial development with environmental protection. International organizations have proposed various frameworks to address this complex issue. Critics argue that current approaches are insufficient to prevent ecological damage. The search for sustainable solutions continues to be a priority for policymakers worldwide.",
    "Recent breakthroughs in genetic research have opened new possibilities for treating hereditary diseases. Scientists have developed techniques to edit genes with unprecedented precision. These advances raise important ethical questions about the boundaries of scientific intervention. While the potential benefits are enormous, careful regulation is necessary to prevent misuse. The debate between scientific progress and ethical considerations continues to evolve.",
    "The phenomenon of urbanization has accelerated dramatically in the past century. More than half of the world's population now lives in urban areas. This rapid urban growth presents both opportunities and challenges for city planners. Infrastructure development often struggles to keep pace with population increases. Sustainable urban design has become a critical field of study for architects and policymakers.",
    "Psychological research has revealed fascinating insights into human decision-making processes. Cognitive biases often lead people to make irrational choices in predictable ways. Understanding these mental shortcuts can help individuals make better decisions. Behavioral economics combines insights from psychology and economics to explain market behavior. This interdisciplinary approach has gained significant attention in recent years.",
    "The globalization of trade has profoundly impacted local economies around the world. While international commerce creates opportunities for economic growth, it can also threaten traditional industries. Developing countries often struggle to compete with established economies in global markets. Trade agreements attempt to create fair conditions for all participating nations. The debate over free trade versus protectionism remains highly contentious.",
    "Advancements in renewable energy technology have made clean power more affordable than ever. Solar and wind energy costs have decreased dramatically over the past decade. Many countries are now setting ambitious targets for carbon neutrality. The transition to renewable energy requires significant investment in infrastructure. Energy storage remains one of the biggest challenges for widespread adoption.",
    "The study of ancient civilizations provides valuable insights into human history and cultural development. Archaeological discoveries continue to challenge our understanding of past societies. New technologies like ground-penetrating radar have revolutionized the field of archaeology. Each discovery adds another piece to the puzzle of human civilization. Preserving cultural heritage sites is essential for future generations.",
    "The modern workplace has undergone significant transformation in recent years. Remote work and flexible schedules have become increasingly common across many industries. While these changes offer greater autonomy for workers, they also present challenges for collaboration. Companies are developing new strategies to maintain team cohesion in distributed environments. The future of work will likely continue to evolve in response to technological advances.",
    "Neuroscience has made remarkable progress in understanding how the brain processes information. Studies using functional magnetic resonance imaging have revealed the neural basis of memory and emotion. This research has important implications for treating neurological disorders. Understanding brain plasticity has opened new approaches to education and rehabilitation. The complexity of the human brain continues to amaze researchers.",
    "Demographic shifts in developed countries are creating significant economic and social challenges. Aging populations place increasing pressure on healthcare systems and pension programs. Declining birth rates in many countries raise concerns about future workforce shortages. Immigration policies are being debated as potential solutions to demographic challenges. Countries must adapt their social policies to address these demographic trends.",
    "The field of artificial intelligence ethics has emerged as a critical area of study. Questions about algorithmic bias and fairness have become increasingly important. Researchers are developing frameworks to ensure AI systems are transparent and accountable. The potential for AI to amplify existing social inequalities is a major concern. Ethical guidelines must keep pace with technological advancement.",
    "International cooperation in space exploration has yielded remarkable scientific achievements. Collaborative projects between nations have advanced our understanding of the universe. The International Space Station stands as a symbol of what can be achieved through cooperation. Private companies are now playing an increasingly important role in space exploration. The future of space travel holds exciting possibilities for humanity.",
    "The preservation of biodiversity is crucial for maintaining healthy ecosystems. Species extinction rates have accelerated dramatically due to human activities. Conservation efforts aim to protect endangered species and their natural habitats. Protected areas and wildlife reserves play a vital role in conservation strategies. Public awareness and support are essential for successful conservation initiatives.",
    "Educational reform remains a topic of intense debate in many countries. Traditional teaching methods are being challenged by innovative pedagogical approaches. Technology integration in classrooms has transformed the learning experience for many students. Assessment methods are evolving to better measure student understanding and skills. The goal of education extends beyond academic achievement to include personal development.",
    "The economics of healthcare is a complex and often controversial subject. Rising medical costs pose challenges for individuals and governments alike. Different countries have adopted various models for delivering healthcare services. The debate between public and private healthcare systems continues in many nations. Finding sustainable solutions to healthcare financing remains a global priority.",
    "Migration patterns have shaped human history since ancient times. Economic opportunities, political instability, and environmental factors drive population movements. Modern migration presents both challenges and opportunities for receiving countries. Integration policies play a crucial role in determining outcomes for migrants and host communities. Understanding migration dynamics is essential for informed policy-making.",
    "The digital revolution has fundamentally changed how information is created and consumed. Traditional media industries have been disrupted by online platforms and social networks. The abundance of information available online has raised concerns about misinformation. Digital literacy has become an essential skill for navigating the modern information landscape. Media education is increasingly important for critical thinking.",
    "Oceanography research has revealed the critical role of oceans in regulating Earth's climate. Marine ecosystems are under threat from pollution, overfishing, and acidification. International efforts to protect ocean health have gained momentum in recent years. Sustainable fishing practices are essential for preserving marine biodiversity. The health of our oceans is directly linked to the health of our planet.",
    "The psychology of happiness has become a popular area of scientific inquiry. Research suggests that happiness is influenced by both genetic and environmental factors. Certain practices like gratitude and mindfulness have been shown to increase well-being. Social relationships are consistently found to be important predictors of happiness. The pursuit of happiness is a universal human goal.",
    "Quantum computing represents a paradigm shift in computational capability. Unlike classical computers, quantum computers leverage the principles of quantum mechanics. This technology has the potential to revolutionize fields like cryptography and drug discovery. However, significant technical challenges remain before quantum computers become practical. Researchers around the world are racing to overcome these obstacles.",
  ];

  return transcripts.map((text, i) => ({
    title: `CET-6 真题听力 #${String(i + 1).padStart(2, '0')}`,
    difficulty,
    duration: 90 + Math.floor(Math.random() * 60),
    transcript: text,
    topics,
  }));
}

function generateVOASlowMaterials() {
  const topics = ['voa', 'voa-slow'];
  const difficulty = 'L1';

  const transcripts = [
    "Hello and welcome to VOA Learning English. Today we have a simple story for you. A young boy found a lost dog on his way home from school. He was very kind and helped the dog find its owner. The owner was very happy and thanked the boy. This story shows that small acts of kindness can make a big difference.",
    "Many people enjoy drinking tea every day. Tea is one of the most popular drinks in the world. There are many different kinds of tea. Some people like green tea while others prefer black tea. Tea has many health benefits according to scientists. Drinking tea can help you relax and feel good.",
    "The weather today is very nice. The sun is shining and the sky is blue. It is a good day to go outside and play. Many families are having picnics in the park. Children are running and laughing. Everyone is enjoying the beautiful weather.",
    "Cooking at home is a good habit. When you cook at home you know what is in your food. You can make healthy meals for your family. Cooking can also be fun. You can learn new recipes from different countries. Many people enjoy cooking with their friends.",
    "Reading books is good for your brain. When you read you learn new words and ideas. Reading can also help you relax before sleep. Many people read for thirty minutes every night. Children who read often do better in school. So pick up a book and start reading today.",
    "Exercise is important for good health. You do not need to run a marathon to be healthy. Walking for thirty minutes every day is enough. Exercise helps your heart and your mind. It also helps you sleep better at night. Find an activity you enjoy and do it every day.",
    "Water is very important for our bodies. We need to drink water every day to stay healthy. Doctors say we should drink about eight glasses of water each day. Water helps our bodies work properly. It also helps our skin look good. Remember to drink water throughout the day.",
    "Trees are very important for our planet. They give us clean air to breathe. Trees also provide shade on hot days. Many animals live in trees. We should take care of trees and plant new ones. Every tree makes a difference for our environment.",
    "Learning to play a musical instrument is fun. You can start learning at any age. Many schools offer music classes for students. Playing an instrument helps your brain develop. It also helps you express your feelings. Music brings joy to both the player and the listener.",
    "Sleep is very important for our health. Adults need about seven to eight hours of sleep each night. Children need even more sleep than adults. Good sleep helps us think clearly and feel happy. Without enough sleep we cannot do our best work. Make sure to get enough sleep every night.",
    "Spring is a beautiful season. Flowers start to bloom and the weather becomes warm. Many people enjoy going for walks in the spring. Birds return from their winter homes and sing in the trees. Spring is a time of new beginnings. It is a wonderful time of year.",
    "Fruits are good for your health. Apples oranges and bananas are all healthy choices. Eating fruits every day gives your body important vitamins. Fruits can be eaten fresh or in a salad. They are also good for making healthy drinks. Try to eat different fruits every day.",
    "The sun rises in the east every morning. It gives light and warmth to our world. Plants need sunlight to grow. People feel happy when the sun is shining. The sun is a star that is very close to Earth. It is very important for all life on our planet.",
    "Animals are wonderful creatures. There are many different kinds of animals in the world. Some animals live on land and others live in water. Each animal has its own special way of living. We should respect and protect all animals. They are an important part of our world.",
    "Friends are important in our lives. Good friends listen to us and help us when we are sad. They also share happy moments with us. Making new friends can be easy if you are friendly. Smile and say hello to someone new today. You might make a new friend.",
  ];

  return transcripts.map((text, i) => ({
    title: `VOA 慢速英语 #${String(i + 1).padStart(2, '0')}`,
    difficulty,
    duration: 30 + Math.floor(Math.random() * 30),
    transcript: text,
    topics,
  }));
}

function generateVOASstandardMaterials() {
  const topics = ['voa', 'voa-standard'];
  const difficulty = 'L2';

  const transcripts = [
    "Scientists at a major university have announced a new discovery in the field of renewable energy. Their research focuses on improving the efficiency of solar panels. The team developed a new material that can capture more sunlight than traditional panels. This breakthrough could make solar energy more affordable for everyone. The findings were published in a leading scientific journal this week.",
    "A new study suggests that spending time in nature can improve mental health. Researchers followed a group of people who walked in a park for twenty minutes each day. The participants reported feeling less stressed and more energetic. The study adds to growing evidence that nature has healing effects on the mind. Doctors are now considering nature prescriptions for patients with anxiety.",
    "Education officials in several countries are concerned about declining reading rates among young people. Studies show that teenagers are reading fewer books than previous generations. Many young people prefer watching videos and using social media instead of reading. Some schools are starting programs to make reading more fun and engaging. The goal is to help students discover the joy of reading.",
    "A small town in the mountains has become an unexpected tourist destination. Visitors are attracted by the town's beautiful natural scenery and friendly atmosphere. Local businesses have grown to serve the increasing number of tourists. The town government is working to balance tourism development with environmental protection. Residents hope to maintain their community's character while welcoming visitors.",
    "Health experts are warning about the dangers of sitting for long periods of time. Studies show that sitting for more than eight hours a day increases health risks. Experts recommend standing up and moving every hour. Even short walks can help reduce the negative effects of sitting. Some companies are now providing standing desks for their employees.",
    "A recent report highlights the growing popularity of electric vehicles around the world. More consumers are choosing electric cars because they are better for the environment. Many governments are offering financial incentives to encourage people to buy electric vehicles. Car manufacturers are investing heavily in electric vehicle technology. The shift toward electric transportation is expected to accelerate in the coming years.",
    "Online shopping has changed the way people buy goods and services. Consumers can now purchase almost anything from the comfort of their homes. Free shipping and easy returns have made online shopping even more attractive. However, traditional brick-and-mortar stores are struggling to compete with online retailers. Many physical stores are now offering online options to stay relevant.",
    "The World Health Organization has released new guidelines for physical activity. Adults should get at least one hundred fifty minutes of moderate exercise each week. This includes activities like brisk walking, swimming, or cycling. Children and teenagers need even more physical activity than adults. Regular exercise reduces the risk of many diseases and improves mental health.",
    "Artificial intelligence is being used in more industries than ever before. AI-powered tools can help doctors diagnose diseases more accurately. In agriculture, AI systems monitor crop health and optimize water usage. The technology is also transforming how companies provide customer service. While AI creates many opportunities, it also raises important questions about jobs and privacy.",
    "International trade plays a crucial role in the global economy. Countries export goods they produce efficiently and import goods they need. Trade agreements between nations help reduce barriers and create fair competition. However, trade disputes can arise when countries disagree about tariffs and regulations. Finding common ground is essential for maintaining stable trade relationships.",
    "A new study has found that listening to music while studying can improve concentration. The researchers discovered that certain types of music help students focus better. Classical music and nature sounds were found to be most effective. However, music with lyrics can be distracting when reading or writing. Students are advised to experiment and find what works best for them.",
    "The number of people living in cities continues to grow each year. Urban areas offer more job opportunities and better access to services. However, rapid urbanization also creates challenges such as housing shortages and traffic congestion. City planners are working to make urban areas more sustainable and livable. Green spaces and public transportation are key priorities for modern cities.",
    "A recent archaeological discovery has shed new light on an ancient civilization. Researchers found well-preserved artifacts that date back more than three thousand years. The findings include pottery, tools, and remains of buildings. This discovery helps scientists understand how people lived in ancient times. The excavation site will continue to be studied for years to come.",
    "Financial experts recommend that young people start saving money as early as possible. Even small amounts saved regularly can grow significantly over time. Compound interest allows savings to grow faster than simple interest. Many banks offer special accounts for students with lower fees. Learning good financial habits early in life can lead to greater financial security.",
  ];

  return transcripts.map((text, i) => ({
    title: `VOA 常速英语 #${String(i + 1).padStart(2, '0')}`,
    difficulty,
    duration: 45 + Math.floor(Math.random() * 45),
    transcript: text,
    topics,
  }));
}

// ── Sentence timeline generator ──────────────────────────

function generateTimeline(transcript, durationMs) {
  // Split transcript into sentences
  const sentences = transcript
    .replace(/\n/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const wordCounts = sentences.map((s) => s.split(/\s+/).length);
  const totalWords = wordCounts.reduce((a, b) => a + b, 0);

  let currentMs = 0;
  const timeline = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentenceDuration = totalWords > 0
      ? Math.round((wordCounts[i] / totalWords) * durationMs)
      : Math.round(durationMs / sentences.length);

    const startMs = currentMs;
    const endMs = currentMs + sentenceDuration;

    timeline.push({
      index: i,
      start_ms: startMs,
      end_ms: endMs,
      text: sentences[i],
    });

    currentMs = endMs + 200; // 200ms gap
  }

  return { timeline, totalDurationMs: currentMs };
}

// ── Main ─────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const saveFlag = args.includes('--save');
  const seedFlag = args.includes('--seed');

  // Generate all materials
  const cet4 = generateCET4Materials();
  const cet6 = generateCET6Materials();
  const voaSlow = generateVOASlowMaterials();
  const voaStd = generateVOASstandardMaterials();

  const allMaterials = [...cet4, ...cet6, ...voaSlow, ...voaStd];

  // Generate timeline for each
  const seedData = allMaterials.map((m) => {
    const durationMs = m.duration * 1000;
    const { timeline } = generateTimeline(m.transcript, durationMs);

    return {
      title: m.title,
      difficulty: m.difficulty,
      duration: m.duration,
      audio_url: `https://audio.tingke.app/materials/${m.title.replace(/[^a-zA-Z0-9]/g, '-')}.mp3`,
      transcript: m.transcript,
      sentence_timeline: timeline,
      word_list: null,
      topics: m.topics,
      status: 'published',
    };
  });

  const output = JSON.stringify({ materials: seedData }, null, 2);
  const stats = {
    total: seedData.length,
    by_difficulty: {
      L1: seedData.filter((m) => m.difficulty === 'L1').length,
      L2: seedData.filter((m) => m.difficulty === 'L2').length,
      L3: seedData.filter((m) => m.difficulty === 'L3').length,
    },
    by_topic: {
      'cet-4': seedData.filter((m) => m.topics.includes('cet-4')).length,
      'cet-6': seedData.filter((m) => m.topics.includes('cet-6')).length,
      'voa-slow': seedData.filter((m) => m.topics.includes('voa-slow')).length,
      'voa-standard': seedData.filter((m) => m.topics.includes('voa-standard')).length,
    },
  };

  console.error(`📊 生成素材统计:`);
  console.error(`   总计: ${stats.total} 篇`);
  console.error(`   难度: L1=${stats.by_difficulty.L1}  L2=${stats.by_difficulty.L2}  L3=${stats.by_difficulty.L3}`);
  console.error(`   分类: CET-4=${stats['by_topic']['cet-4']}  CET-6=${stats['by_topic']['cet-6']}  VOA慢速=${stats['by_topic']['voa-slow']}  VOA常速=${stats['by_topic']['voa-standard']}`);

  if (saveFlag) {
    const outPath = path.resolve(__dirname, 'materials/seed.json');
    fs.writeFileSync(outPath, output, 'utf8');
    console.error(`\n✅ 已保存到 ${outPath}`);
  } else {
    console.log(output);
  }

  if (seedFlag) {
    console.error('\n⚡ --seed 模式需要通过 API 入库:');
    console.error('   node scripts/seed-database.js');
  }
}

main();
