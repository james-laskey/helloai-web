// landing-page/constants.js

export const NAV_LINKS = [
  { label: 'Features', id: 'features' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Screenshots', id: 'screenshots' },
  { label: 'Pricing', id: 'pricing' },
];

export const FEATURES = [
  {
    icon: 'Chat',
    title: 'AI Voice Tutor',
    description:
      'Have natural conversations with an AI tutor that speaks your target language fluently and corrects your mistakes gently.',
    color: 'var(--nb-yellow)',
  },
  {
    icon: 'Style',
    title: 'Smart Flashcards',
    description:
      'AI-generated flashcards tailored to your topics with spaced repetition to help you remember what you learn.',
    color: 'var(--nb-cyan)',
  },
  {
    icon: 'Quiz',
    title: 'Interactive Quizzes',
    description:
      'Test your knowledge with adaptive quizzes that get harder as you improve, with detailed explanations for every answer.',
    color: 'var(--nb-pink)',
  },
  {
    icon: 'Insights',
    title: 'Progress Tracking',
    description:
      'Track your learning journey with detailed stats — time spent, cards mastered, quiz scores, and more.',
    color: 'var(--nb-lime)',
  },
  {
    icon: 'Tune',
    title: 'Adaptive Difficulty',
    description:
      'From complete beginner to advanced, the app adjusts to your proficiency level automatically.',
    color: 'var(--nb-orange)',
  },
  {
    icon: 'Public',
    title: '10 Languages',
    description:
      'Spanish, French, Japanese, Korean, German, Italian, Chinese, Portuguese, English, and more coming soon.',
    color: 'var(--nb-purple)',
    iconColor: 'var(--nb-white)',
  },
];

export const STEPS = [
  {
    number: '1',
    title: 'Create Your Account',
    description:
      'Sign up in seconds. Tell us which language you want to learn and your current level.',
    color: 'var(--nb-yellow)',
  },
  {
    number: '2',
    title: 'Pick a Topic',
    description:
      'Choose from curated topics like greetings, food, travel, or grammar. Each topic has tailored lessons.',
    color: 'var(--nb-lime)',
  },
  {
    number: '3',
    title: 'Practice & Master',
    description:
      'Talk with your AI tutor, review flashcards, and take quizzes — all in one app.',
    color: 'var(--nb-pink)',
  },
];

export const SCREENSHOTS = [
  {
    icon: 'MenuBook',
    title: 'Topic Selection',
    caption: 'Browse topics by language',
    color: 'var(--nb-yellow)',
    image: '/images/screenshots/topic-selection.png',
  },
  {
    icon: 'School',
    title: 'AI Tutor Chat',
    caption: 'Have real conversations',
    color: 'var(--nb-pink)',
    image: '/images/screenshots/ai-tutor.png',
  },
  {
    icon: 'Style',
    title: 'Flashcards',
    caption: 'Master vocabulary fast',
    color: 'var(--nb-lime)',
    image: '/images/screenshots/flashcards.png',
  },
  {
    icon: 'Quiz',
    title: 'Quizzes',
    caption: 'Test your knowledge',
    color: 'var(--nb-cyan)',
    image: '/images/screenshots/quiz.png',
  },
  {
    icon: 'Insights',
    title: 'Progress Stats',
    caption: 'Track your progress',
    color: 'var(--nb-purple)',
    image: '/images/screenshots/stats.png',
    iconColor: 'var(--nb-white)',
  },
];

export const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: ' forever',
    tagline: 'Great for casual learners',
    features: [
      'All 10 languages',
      'All topics & lessons',
      'AI Tutor — 20 messages/day',
      'Flashcards — 3 sets/day',
      'Quizzes — 2 per day',
      'Progress tracking',
    ],
    cta: 'Start Learning Free',
    featured: false,
  },
  {
    name: 'Lifetime Unlock',
    price: '$1.99',
    period: ' one-time',
    tagline: 'Pay once. Learn forever.',
    features: [
      'Everything in Free',
      'Unlimited AI Tutor messages',
      'Unlimited flashcards & quizzes',
      'Priority AI responses',
      'No daily limits, ever',
      'All future languages included',
    ],
    cta: 'Unlock for $1.99',
    featured: true,
    badge: 'BEST VALUE',
  },
];

export const PRICING_FAQ = {
  title: 'Why is it only $1.99?',
  subtitle:
    'Modern AI is remarkably cheap to run. We pass those savings on to you — no subscriptions, no markup, no games.',
  stats: [
    {
      icon: 'Forum',
      value: '13',
      label: 'Requests (30 days)',
      detail: 'Real API calls made to test the tutor',
      color: 'var(--nb-cyan)',
    },
    {
      icon: 'Description',
      value: '10,923',
      label: 'Tokens processed',
      detail: '≈ 8,000 words of AI conversation',
      color: 'var(--nb-lime)',
    },
    {
      icon: 'AttachMoney',
      value: '<$0.01',
      label: '30-day API cost',
      detail: 'Total spent on AI in the last month',
      color: 'var(--nb-yellow)',
    },
    {
      icon: 'Calculate',
      value: '$0.0004',
      label: 'Per request',
      detail: 'Roughly 1/25th of a US cent per message',
      color: 'var(--nb-pink)',
    },
  ],
  explanation: [
    {
      icon: 'Bolt',
      title: 'AI is cheap now',
      body: 'A typical tutor conversation (≈840 tokens) costs less than half a cent with DeepSeek. That\u2019s why we can offer unlimited use for a one-time $1.99.',
    },
    {
      icon: 'DarkMode',
      title: 'Off-peak pricing',
      body: 'DeepSeek bills weekends and Chinese holidays at a discount. We batch non-urgent requests (like flashcard generation) during these windows to cut costs further.',
    },
    {
      icon: 'GpsFixed',
      title: 'Free tier keeps it fair',
      body: 'Free users get daily rate limits so everyone can practice. Unlock Lifetime for $1.99 to remove all limits — one payment, no subscription.',
    },
    {
      icon: 'AllInclusive',
      title: 'One payment, years of use',
      body: 'At under a cent per conversation, $1.99 covers hundreds of messages. Your purchase funds ongoing development, new languages, and future features.',
    },
  ],
};

export const SUSTAINABILITY = {
  badge: 'Sustainability',
  title: 'How $1.99 Funds the Whole Thing',
  subtitle:
    'No subscriptions, no ads, no upsells. Just a one-time price that keeps the lights on and the AI talking. Here\u2019s the math.',
  metrics: [
    {
      label: 'Free user',
      value: '20 msgs/day',
      note: 'Rate limited to keep it fair',
      highlight: 'var(--nb-cyan)',
    },
    {
      label: 'Paid user',
      value: 'Unlimited',
      note: 'One-time $1.99',
      highlight: 'var(--nb-yellow)',
    },
    {
      label: 'Cost to us',
      value: '<$0.01',
      note: 'Per AI conversation',
      highlight: 'var(--nb-lime)',
    },
    {
      label: 'Break-even',
      value: '~500 msgs',
      note: 'At recent API rates',
      highlight: 'var(--nb-pink)',
    },
  ],
  notes: [
    {
      icon: 'Bolt',
      title: 'AI is cheaper than you think',
      body: 'A typical tutor exchange uses ~840 tokens and costs us less than a cent. So $1.99 covers hundreds of conversations before we break even.',
      color: 'var(--nb-yellow)',
    },
    {
      icon: 'DarkMode',
      title: 'Off-peak batching',
      body: 'Weekends and Chinese holidays are billed at off-peak rates. We queue non-urgent work (like flashcard generation) for those windows to cut costs further.',
      color: 'var(--nb-cyan)',
    },
    {
      icon: 'AllInclusive',
      title: 'One payment, years of use',
      body: 'At $0.0004 per message, $1.99 funds roughly 5,000 conversations. Most learners never come close — which is exactly the point.',
      color: 'var(--nb-lime)',
    },
  ],
  footer:
    'This app is built by one person, not a corporation. Your $1.99 keeps it alive and funds new languages, features, and improvements.',
  badges: [
    { icon: 'Block', label: 'No subscriptions', color: 'var(--nb-red)', textColor: 'var(--nb-white)' },
    { icon: 'Block', label: 'No ads', color: 'var(--nb-red)', textColor: 'var(--nb-white)' },
    { icon: 'Block', label: 'No data selling', color: 'var(--nb-red)', textColor: 'var(--nb-white)' },
    { icon: 'Favorite', label: 'Built by one dev', color: 'var(--nb-lime)' },
  ],
};

export const HERO = {
  badge: 'AI-Powered Language Learning',
  subtitle:
    'Practice real conversations with an AI tutor that adapts to your level. Learn Spanish, French, Japanese, Korean, and more — anytime, anywhere.',
  image: '/images/screenshots/hero.png',
  imageAlt: 'Hello Ai app — AI tutor conversation screen',
  trustBadges: [
    {
      icon: 'Favorite',
      label: 'Free to start',
    },
    {
      icon: 'Diamond',
      label: '$1.99 lifetime unlock',
    },
    {
      icon: 'Public',
      label: '10 languages',
    },
  ],
};

export const FOOTER_LINKS = {
  product: ['Features', 'Pricing', 'Screenshots', 'FAQ'],
  company: ['About', 'Blog', 'Careers', 'Contact'],
  legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

export const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};