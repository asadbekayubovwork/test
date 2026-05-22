import type { Course, Unit, UnitWord } from '../../types';

// Sample words data for units
const sampleWords: Record<string, UnitWord[]> = {
  'u1-1': [
    { id: 'g1', word: 'Hello', transcription: '/həˈloʊ/', definition: 'A common greeting used when meeting someone', example: 'Hello, how are you today?', isFavorite: false, learned: true },
    { id: 'g2', word: 'Goodbye', transcription: '/ˌɡʊdˈbaɪ/', definition: 'A word used when parting from someone', example: 'Goodbye, see you tomorrow!', isFavorite: false, learned: true },
    { id: 'g3', word: 'Welcome', transcription: '/ˈwelkəm/', definition: 'A greeting said to someone who has just arrived', example: 'Welcome to our home!', isFavorite: true, learned: true },
    { id: 'g4', word: 'Please', transcription: '/pliːz/', definition: 'A polite word used when asking for something', example: 'Could you please help me?', isFavorite: false, learned: true },
    { id: 'g5', word: 'Thank you', transcription: '/θæŋk juː/', definition: 'An expression of gratitude', example: 'Thank you for your help!', isFavorite: true, learned: true },
    { id: 'g6', word: 'Sorry', transcription: '/ˈsɒri/', definition: 'An expression of apology or regret', example: 'Sorry, I didn\'t mean to interrupt.', isFavorite: false, learned: true },
    { id: 'g7', word: 'Excuse me', transcription: '/ɪkˈskjuːz miː/', definition: 'A polite phrase to get attention or apologize', example: 'Excuse me, where is the station?', isFavorite: false, learned: true },
    { id: 'g8', word: 'Good morning', transcription: '/ɡʊd ˈmɔːrnɪŋ/', definition: 'A greeting used in the morning', example: 'Good morning, did you sleep well?', isFavorite: false, learned: true },
    { id: 'g9', word: 'Good afternoon', transcription: '/ɡʊd ˌɑːftərˈnuːn/', definition: 'A greeting used in the afternoon', example: 'Good afternoon, how can I help you?', isFavorite: false, learned: true },
    { id: 'g10', word: 'Good evening', transcription: '/ɡʊd ˈiːvnɪŋ/', definition: 'A greeting used in the evening', example: 'Good evening, welcome to the restaurant.', isFavorite: false, learned: true },
    { id: 'g11', word: 'Good night', transcription: '/ɡʊd naɪt/', definition: 'A phrase used when parting at night or before sleep', example: 'Good night, sweet dreams!', isFavorite: false, learned: true },
    { id: 'g12', word: 'Nice to meet you', transcription: '/naɪs tə miːt juː/', definition: 'A polite phrase when meeting someone for the first time', example: 'Nice to meet you, I\'m Sarah.', isFavorite: true, learned: true },
    { id: 'g13', word: 'How are you?', transcription: '/haʊ ɑːr juː/', definition: 'A question asking about someone\'s well-being', example: 'Hi John, how are you?', isFavorite: false, learned: true },
    { id: 'g14', word: 'Fine', transcription: '/faɪn/', definition: 'A response meaning good or okay', example: 'I\'m fine, thank you.', isFavorite: false, learned: true },
    { id: 'g15', word: 'See you later', transcription: '/siː juː ˈleɪtər/', definition: 'An informal way to say goodbye', example: 'See you later, have a great day!', isFavorite: false, learned: true },
    { id: 'g16', word: 'Take care', transcription: '/teɪk ker/', definition: 'A friendly phrase used when saying goodbye', example: 'Take care and stay safe!', isFavorite: false, learned: true },
    { id: 'g17', word: 'Congratulations', transcription: '/kənˌɡrætʃəˈleɪʃənz/', definition: 'An expression of praise for an achievement', example: 'Congratulations on your graduation!', isFavorite: true, learned: true },
    { id: 'g18', word: 'Cheers', transcription: '/tʃɪrz/', definition: 'An informal word for thanks or a toast', example: 'Cheers for helping me out!', isFavorite: false, learned: true },
    { id: 'g19', word: 'Pardon', transcription: '/ˈpɑːrdən/', definition: 'A polite way to ask someone to repeat something', example: 'Pardon? I didn\'t hear you.', isFavorite: false, learned: true },
    { id: 'g20', word: 'Bless you', transcription: '/bles juː/', definition: 'A phrase said when someone sneezes', example: 'Bless you! Are you catching a cold?', isFavorite: false, learned: true },
  ],
  'u1-6': [
    { id: 'w1', word: 'Sunny', transcription: '/ˈsʌni/', definition: 'Bright with sunlight', example: 'It was a sunny day at the beach.', isFavorite: false, learned: true },
    { id: 'w2', word: 'Cloudy', transcription: '/ˈklaʊdi/', definition: 'Covered with clouds', example: 'The sky is cloudy today.', isFavorite: false, learned: true },
    { id: 'w3', word: 'Rainy', transcription: '/ˈreɪni/', definition: 'Having a lot of rain', example: 'Bring an umbrella on rainy days.', isFavorite: true, learned: true },
    { id: 'w4', word: 'Windy', transcription: '/ˈwɪndi/', definition: 'With strong winds', example: 'Hold onto your hat, it\'s windy!', isFavorite: false, learned: false },
    { id: 'w5', word: 'Snowy', transcription: '/ˈsnoʊi/', definition: 'Covered with snow', example: 'The mountains look snowy in winter.', isFavorite: false, learned: false },
    { id: 'w6', word: 'Foggy', transcription: '/ˈfɔːɡi/', definition: 'Full of fog', example: 'Drive carefully in foggy conditions.', isFavorite: false, learned: false },
    { id: 'w7', word: 'Humid', transcription: '/ˈhjuːmɪd/', definition: 'Warm and damp', example: 'Summers are very humid here.', isFavorite: false, learned: false },
    { id: 'w8', word: 'Freezing', transcription: '/ˈfriːzɪŋ/', definition: 'Extremely cold', example: 'It\'s freezing outside today.', isFavorite: true, learned: false },
    { id: 'w9', word: 'Spring', transcription: '/sprɪŋ/', definition: 'Season after winter', example: 'Flowers bloom in spring.', isFavorite: false, learned: true },
    { id: 'w10', word: 'Summer', transcription: '/ˈsʌmər/', definition: 'Warmest season of the year', example: 'We go swimming in summer.', isFavorite: false, learned: true },
    { id: 'w11', word: 'Autumn', transcription: '/ˈɔːtəm/', definition: 'Season after summer, also called fall', example: 'Leaves change color in autumn.', isFavorite: false, learned: true },
    { id: 'w12', word: 'Winter', transcription: '/ˈwɪntər/', definition: 'Coldest season of the year', example: 'It snows a lot in winter.', isFavorite: false, learned: true },
  ],
  'u3-2': [
    { id: 'w13', word: 'Significant', transcription: '/sɪɡˈnɪfɪkənt/', definition: 'Important or meaningful', example: 'There was a significant increase in sales.', isFavorite: false, learned: true },
    { id: 'w14', word: 'Approximately', transcription: '/əˈprɒksɪmətli/', definition: 'Close to an exact amount', example: 'Approximately 500 people attended.', isFavorite: true, learned: true },
    { id: 'w15', word: 'Dramatic', transcription: '/drəˈmætɪk/', definition: 'Sudden and striking', example: 'There was a dramatic drop in temperature.', isFavorite: false, learned: false },
    { id: 'w16', word: 'Fluctuate', transcription: '/ˈflʌktʃueɪt/', definition: 'To rise and fall irregularly', example: 'Prices tend to fluctuate throughout the year.', isFavorite: false, learned: false },
    { id: 'w17', word: 'Trend', transcription: '/trend/', definition: 'A general direction of change', example: 'The trend shows increasing adoption.', isFavorite: false, learned: true },
    { id: 'w18', word: 'Peak', transcription: '/piːk/', definition: 'The highest point', example: 'Sales reached their peak in December.', isFavorite: false, learned: true },
    { id: 'w19', word: 'Decline', transcription: '/dɪˈklaɪn/', definition: 'A gradual decrease', example: 'There was a sharp decline in enrollment.', isFavorite: false, learned: false },
    { id: 'w20', word: 'Proportion', transcription: '/prəˈpɔːʃən/', definition: 'A part considered in relation to the whole', example: 'A large proportion of students passed.', isFavorite: true, learned: false },
    { id: 'w21', word: 'Correlation', transcription: '/ˌkɒrəˈleɪʃən/', definition: 'A mutual relationship between things', example: 'There is a strong correlation between exercise and health.', isFavorite: false, learned: false },
    { id: 'w22', word: 'Substantial', transcription: '/səbˈstænʃəl/', definition: 'Of considerable importance or size', example: 'They made substantial progress.', isFavorite: false, learned: true },
  ],
};

export const courses: Course[] = [
  {
    id: 'course-1',
    title: 'Essential Vocabulary',
    description: 'Learn the most common English words used in everyday conversations. Perfect for beginners starting their English journey.',
    difficulty: 'beginner',
    type: 'general',
    totalCards: 200,
    progress: 65,
    accessType: 'purchased',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    level: 'A2 Elementary',
    totalUnits: 8,
    completedUnits: 5,
    xpEarned: 1240,
    units: [
      { id: 'u1-1', courseId: 'course-1', title: 'Basic Greetings', order: 1, totalCards: 20, learnedCards: 20, progress: 100, status: 'completed', testScore: 98, testCompleted: true, words: sampleWords['u1-1'] },
      { id: 'u1-2', courseId: 'course-1', title: 'Family Members', order: 2, totalCards: 25, learnedCards: 25, progress: 100, status: 'completed', testScore: 92, testCompleted: true, words: [] },
      { id: 'u1-3', courseId: 'course-1', title: 'Numbers & Time', order: 3, totalCards: 25, learnedCards: 25, progress: 100, status: 'completed', testScore: 100, testCompleted: true, words: [] },
      { id: 'u1-4', courseId: 'course-1', title: 'Food & Drinks', order: 4, totalCards: 25, learnedCards: 25, progress: 100, status: 'completed', testScore: 88, testCompleted: true, words: [] },
      { id: 'u1-5', courseId: 'course-1', title: 'Daily Routines', order: 5, totalCards: 25, learnedCards: 25, progress: 100, status: 'completed', testScore: 95, testCompleted: true, words: [] },
      { id: 'u1-6', courseId: 'course-1', title: 'Weather & Seasons', order: 6, totalCards: 12, learnedCards: 7, progress: 58, status: 'in_progress', testCompleted: false, words: sampleWords['u1-6'] },
      { id: 'u1-7', courseId: 'course-1', title: 'Shopping & Money', order: 7, totalCards: 25, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u1-8', courseId: 'course-1', title: 'Travel & Transport', order: 8, totalCards: 25, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
    ],
  },
  {
    id: 'course-2',
    title: 'Business English',
    description: 'Master professional vocabulary for workplace communication, meetings, and presentations.',
    difficulty: 'intermediate',
    type: 'general',
    totalCards: 300,
    progress: 42,
    accessType: 'purchased',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    level: 'B1 Intermediate',
    totalUnits: 10,
    completedUnits: 4,
    xpEarned: 890,
    units: [
      { id: 'u2-1', courseId: 'course-2', title: 'Office Essentials', order: 1, totalCards: 30, learnedCards: 30, progress: 100, status: 'completed', testScore: 94, testCompleted: true, words: [] },
      { id: 'u2-2', courseId: 'course-2', title: 'Email Writing', order: 2, totalCards: 30, learnedCards: 30, progress: 100, status: 'completed', testScore: 88, testCompleted: true, words: [] },
      { id: 'u2-3', courseId: 'course-2', title: 'Meetings & Calls', order: 3, totalCards: 30, learnedCards: 30, progress: 100, status: 'completed', testScore: 92, testCompleted: true, words: [] },
      { id: 'u2-4', courseId: 'course-2', title: 'Presentations', order: 4, totalCards: 30, learnedCards: 30, progress: 100, status: 'completed', testScore: 85, testCompleted: true, words: [] },
      { id: 'u2-5', courseId: 'course-2', title: 'Negotiations', order: 5, totalCards: 30, learnedCards: 18, progress: 60, status: 'in_progress', testCompleted: false, words: [] },
      { id: 'u2-6', courseId: 'course-2', title: 'Reports & Documents', order: 6, totalCards: 30, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u2-7', courseId: 'course-2', title: 'Marketing Terms', order: 7, totalCards: 30, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u2-8', courseId: 'course-2', title: 'Finance Basics', order: 8, totalCards: 30, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u2-9', courseId: 'course-2', title: 'HR & Management', order: 9, totalCards: 30, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u2-10', courseId: 'course-2', title: 'Industry Jargon', order: 10, totalCards: 30, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
    ],
  },
  {
    id: 'course-3',
    title: 'IELTS Academic Vocabulary',
    description: 'Essential vocabulary for IELTS Academic test. Covers all major topics including science, technology, and social issues.',
    difficulty: 'advanced',
    type: 'ielts',
    totalCards: 500,
    progress: 15,
    accessType: 'purchased',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    level: 'B2 Upper Intermediate',
    totalUnits: 12,
    completedUnits: 1,
    xpEarned: 320,
    units: [
      { id: 'u3-1', courseId: 'course-3', title: 'Academic Fundamentals', order: 1, totalCards: 30, learnedCards: 30, progress: 100, status: 'completed', testScore: 98, testCompleted: true, words: [] },
      { id: 'u3-2', courseId: 'course-3', title: 'Data Interpretation', order: 2, totalCards: 10, learnedCards: 5, progress: 50, status: 'in_progress', testCompleted: false, words: sampleWords['u3-2'] },
      { id: 'u3-3', courseId: 'course-3', title: 'Abstract Concepts', order: 3, totalCards: 25, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u3-4', courseId: 'course-3', title: 'Professional Ethics', order: 4, totalCards: 40, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u3-5', courseId: 'course-3', title: 'Scientific Method', order: 5, totalCards: 35, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u3-6', courseId: 'course-3', title: 'Environment & Climate', order: 6, totalCards: 45, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u3-7', courseId: 'course-3', title: 'Technology & Innovation', order: 7, totalCards: 40, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u3-8', courseId: 'course-3', title: 'Social Issues', order: 8, totalCards: 50, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u3-9', courseId: 'course-3', title: 'Health & Medicine', order: 9, totalCards: 45, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u3-10', courseId: 'course-3', title: 'Economics & Business', order: 10, totalCards: 50, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u3-11', courseId: 'course-3', title: 'Education & Learning', order: 11, totalCards: 35, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
      { id: 'u3-12', courseId: 'course-3', title: 'Arts & Culture', order: 12, totalCards: 45, learnedCards: 0, progress: 0, status: 'locked', testCompleted: false, words: [] },
    ],
  },
  {
    id: 'course-4',
    title: 'Travel English',
    description: 'Practical vocabulary for travelers. Learn words and phrases for airports, hotels, restaurants, and sightseeing.',
    difficulty: 'beginner',
    type: 'general',
    totalCards: 150,
    progress: 0,
    accessType: 'subscription',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
    level: 'A1 Beginner',
    totalUnits: 6,
    completedUnits: 0,
    xpEarned: 0,
  },
  {
    id: 'course-5',
    title: 'Academic Writing',
    description: 'Vocabulary for essays, research papers, and academic discussions. Essential for university students.',
    difficulty: 'intermediate',
    type: 'general',
    totalCards: 250,
    progress: 0,
    accessType: 'subscription',
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
    level: 'B1 Intermediate',
    totalUnits: 8,
    completedUnits: 0,
    xpEarned: 0,
  },
  {
    id: 'course-6',
    title: 'IELTS Speaking',
    description: 'Boost your IELTS speaking score with topic-specific vocabulary and common expressions.',
    difficulty: 'intermediate',
    type: 'ielts',
    totalCards: 350,
    progress: 0,
    accessType: 'locked',
    price: 9.99,
    coverImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop',
    level: 'B1 Intermediate',
    totalUnits: 10,
    completedUnits: 0,
    xpEarned: 0,
  },
  {
    id: 'course-7',
    title: 'Advanced Idioms',
    description: 'Master English idioms and expressions used by native speakers in casual and formal contexts.',
    difficulty: 'advanced',
    type: 'general',
    totalCards: 200,
    progress: 0,
    accessType: 'locked',
    price: 7.99,
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=300&fit=crop',
    level: 'C1 Advanced',
    totalUnits: 8,
    completedUnits: 0,
    xpEarned: 0,
  },
  {
    id: 'course-8',
    title: 'Technology & IT',
    description: 'Technical vocabulary for software developers, IT professionals, and tech enthusiasts.',
    difficulty: 'intermediate',
    type: 'general',
    totalCards: 300,
    progress: 0,
    accessType: 'locked',
    price: 8.99,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    level: 'B1 Intermediate',
    totalUnits: 10,
    completedUnits: 0,
    xpEarned: 0,
  },
  {
    id: 'course-10',
    title: 'Everyday Phrases',
    description: 'Common phrases and expressions for daily conversations. Great for quick learning.',
    difficulty: 'beginner',
    type: 'general',
    totalCards: 100,
    progress: 0,
    accessType: 'subscription',
    coverImage: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=300&fit=crop',
    level: 'A1 Beginner',
    totalUnits: 5,
    completedUnits: 0,
    xpEarned: 0,
  },
];

export const getMyCourses = () => {
  return courses.filter(course =>
    course.accessType === 'purchased' ||
    (course.accessType === 'subscription' && course.progress > 0)
  );
};

export const getAvailableCourses = () => {
  return courses.filter(course =>
    course.accessType !== 'purchased' || course.progress === 0
  );
};

export const getCoursesByDifficulty = (difficulty: Course['difficulty']) => {
  return courses.filter(course => course.difficulty === difficulty);
};

export const getCoursesByType = (type: Course['type']) => {
  return courses.filter(course => course.type === type);
};

export const getCourseById = (id: string) => {
  return courses.find(course => course.id === id);
};

export const getUnitsByCourseId = (courseId: string): Unit[] => {
  const course = getCourseById(courseId);
  return course?.units || [];
};

export const getUnitById = (unitId: string): Unit | undefined => {
  for (const course of courses) {
    const unit = course.units?.find(u => u.id === unitId);
    if (unit) return unit;
  }
  return undefined;
};
