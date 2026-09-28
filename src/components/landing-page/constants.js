// landing-page/constants.js

export const NAV_LINKS = [
  { label: 'Features', id: 'features' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Screenshots', id: 'screenshots' },
  { label: 'Pricing', id: 'pricing' },
];

export const FEATURES = [
  {
    icon: 'SportsMartialArts',
    title: 'Hello Ninja',
    description:
      'Words fall from the sky. Click the right one before it hits the ground. Speed, combos, and vocabulary under pressure.',
    color: 'var(--nb-yellow)',
  },
  {
    icon: 'Casino',
    title: 'Hello Land of Fortune',
    description:
      'Spin the board, guess a letter, and bet your score. A Wheel-of-Fortune style guessing game with real risk and reward.',
    color: 'var(--nb-cyan)',
  },
  {
    icon: 'GridView',
    title: 'Hello Crossword',
    description:
      'Solve themed crossword puzzles where every sentence is generated for your level. Read, guess, and fill the grid.',
    color: 'var(--nb-lime)',
  },
  {
    icon: 'MenuBook',
    title: 'Reading Lessons',
    description:
      'Read along with native-pronunciation audio, tap any word for a translation, and answer comprehension questions as you go.',
    color: 'var(--nb-pink)',
  },
  {
    icon: 'Style',
    title: 'Smart Flashcards',
    description:
      'AI-generated flashcards for every topic, with spaced repetition that focuses on the words you keep forgetting.',
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
    title: 'Pick a Game',
    description:
      'Choose a mode — reading, flashcards, quiz, Ninja, Fortune, or Crossword. Every mode adapts to your topic and difficulty.',
    color: 'var(--nb-lime)',
  },
  {
    number: '3',
    title: 'Play, Practice, Master',
    description:
      'Learn a language by playing. Track your streak, high scores, and progress across every mode.',
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
    icon: 'SportsMartialArts',
    title: 'Hello Ninja',
    caption: 'Click words before they fall',
    color: 'var(--nb-pink)',
    image: '/images/screenshots/ninja.png',
  },
  {
    icon: 'Casino',
    title: 'Hello Land of Fortune',
    caption: 'Guess letters, bet your score',
    color: 'var(--nb-lime)',
    image: '/images/screenshots/fortune.png',
  },
  {
    icon: 'GridView',
    title: 'Hello Crossword',
    caption: 'Solve sentence puzzles',
    color: 'var(--nb-cyan)',
    image: '/images/screenshots/crossword.png',
  },
  {
    icon: 'Insights',
    title: 'Progress Stats',
    caption: 'Track your streak and high scores',
    color: 'var(--nb-purple)',
    image: '/images/screenshots/stats.png',
    iconColor: 'var(--nb-white)',
  },
];

export const PRICING_PLANS = [
  {
    name: 'Free Forever',
    price: '$0',
    period: ' always',
    tagline: 'Every feature, every language, no paywall',
    features: [
      'All 10 languages',
      'All topics & lessons',
      'Every game mode unlocked',
      'Unlimited flashcards, quizzes, reading',
      'Unlimited Hello Ninja, Fortune, Crossword',
      'Progress tracking & high scores',
    ],
    cta: 'Start Learning Free',
    featured: false,
  },
  {
    name: 'Support the Developer',
    price: 'Any amount',
    period: ' one-time',
    tagline: 'Optional donation. Keeps the app free for everyone.',
    features: [
      'Everything is already free',
      'Funds AI usage for all learners',
      'Supports new languages & features',
      'Keeps the app ad-free',
      'One-time or recurring, your choice',
      'Cancel anytime, no commitment',
    ],
    cta: 'Support Hello Ai',
    featured: true,
    badge: 'OPTIONAL',
  },
];

export const PRICING_FAQ = {
  title: 'Why is it completely free?',
  subtitle:
    'Language learning should not be locked behind a paywall. AI is cheap enough now that we can run the whole app on donations — no subscriptions, no ads, no data selling.',
  stats: [
    {
      icon: 'Forum',
      value: '13',
      label: 'Requests (30 days)',
      detail: 'Real API calls made to test the app',
      color: 'var(--nb-cyan)',
    },
    {
      icon: 'Description',
      value: '10,923',
      label: 'Tokens processed',
      detail: '≈ 8,000 words of generated content',
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
      body: 'A typical lesson or game round costs less than half a cent with DeepSeek. That is why we can offer unlimited use for free — no subscription required.',
    },
    {
      icon: 'DarkMode',
      title: 'Off-peak pricing',
      body: 'DeepSeek bills weekends and Chinese holidays at a discount. We batch non-urgent generation during those windows to keep costs down even further.',
    },
    {
      icon: 'GpsFixed',
      title: 'Donations keep it free',
      body: 'Every dollar donated goes straight to AI usage and hosting. If enough people chip in, the app stays free for everyone — including the people who cannot afford it.',
    },
    {
      icon: 'AllInclusive',
      title: 'No paywall, ever',
      body: 'Every mode, every language, every feature is unlocked for every user. No tiers, no upsells, no "premium" badge. Just learning.',
    },
  ],
};

export const SUSTAINABILITY = {
  badge: 'Sustainability',
  title: 'How Hello Ai Stays Free',
  subtitle:
    'No subscriptions, no ads, no data selling. Just one developer and a small community of supporters. Here is the math.',
  metrics: [
    {
      label: 'Cost per user',
      value: '<$0.01',
      note: 'Per lesson or game round',
      highlight: 'var(--nb-cyan)',
    },
    {
      label: 'Monthly cost',
      value: '~$30',
      note: 'For ~1,000 active learners',
      highlight: 'var(--nb-yellow)',
    },
    {
      label: 'Supporters',
      value: '~600',
      note: 'Needed at $0.05/mo each',
      highlight: 'var(--nb-lime)',
    },
    {
      label: 'Founder cost',
      value: '$0',
      note: 'When donations cover it',
      highlight: 'var(--nb-pink)',
    },
  ],
  notes: [
    {
      icon: 'Bolt',
      title: 'AI is cheaper than you think',
      body: 'A typical lesson or game round uses ~840 tokens and costs less than a cent. A one-dollar donation covers dozens of rounds for someone else.',
      color: 'var(--nb-yellow)',
    },
    {
      icon: 'DarkMode',
      title: 'Off-peak batching',
      body: 'Weekends and Chinese holidays are billed at off-peak rates. We queue non-urgent generation for those windows to cut costs further.',
      color: 'var(--nb-cyan)',
    },
    {
      icon: 'Favorite',
      title: 'Support the developer',
      body: 'This app is built and maintained by one person. Donations cover AI costs, hosting, and new features — no shareholders, no ads, no compromises.',
      color: 'var(--nb-lime)',
    },
  ],
  footer:
    'This app is built by one person, not a corporation. Your support keeps it alive and funds new languages, games, and features for everyone.',
  badges: [
    { icon: 'Block', label: 'No subscriptions', color: 'var(--nb-red)', textColor: 'var(--nb-white)' },
    { icon: 'Block', label: 'No ads', color: 'var(--nb-red)', textColor: 'var(--nb-white)' },
    { icon: 'Block', label: 'No paywalls', color: 'var(--nb-red)', textColor: 'var(--nb-white)' },
    { icon: 'Favorite', label: 'Donation funded', color: 'var(--nb-lime)' },
  ],
};

export const HERO = {
  badge: 'Free Language Learning, Powered by AI',
  subtitle:
    'Play through reading lessons, flashcards, and three original games — Hello Ninja, Hello Land of Fortune, and Hello Crossword. Every mode, every language, always free.',
  image: '/images/screenshots/hero.png',
  imageAlt: 'Hello Ai app — Hello Ninja gameplay screen',
  trustBadges: [
    {
      icon: 'Favorite',
      label: 'Free forever',
    },
    {
      icon: 'SportsMartialArts',
      label: '3 original games',
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