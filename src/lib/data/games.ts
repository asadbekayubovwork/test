import { vocabularyCards } from './words';
import type { WordCard } from '../../types';

export interface GameQuestion {
  word: WordCard;
  options: string[];
  correctIndex: number;
}

export interface MemoryTile {
  id: string;
  pairId: string;
  type: 'word' | 'translation';
  value: string;
}

// Seeded PRNG for deterministic daily shuffles
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const rng = seededRandom(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildQuestion(word: WordCard, allWords: WordCard[]): GameQuestion {
  const distractors = allWords
    .filter((w) => w.id !== word.id)
    .map((w) => w.translation);
  const picked = shuffleArray(distractors).slice(0, 3);
  const options = shuffleArray([word.translation, ...picked]);
  return {
    word,
    options,
    correctIndex: options.indexOf(word.translation),
  };
}

export function getDailyQuestions(): GameQuestion[] {
  const seed = getDateSeed();
  const shuffled = seededShuffle(vocabularyCards, seed);
  const selected = shuffled.slice(0, 5);
  return selected.map((w) => buildQuestion(w, vocabularyCards));
}

export function getTodayDate(): string {
  return getTodayString();
}

export function getWordRushQuestions(): GameQuestion[] {
  const shuffled = shuffleArray(vocabularyCards);
  return shuffled.map((w) => buildQuestion(w, vocabularyCards));
}

export function getMemoryTiles(): MemoryTile[] {
  const shuffled = shuffleArray(vocabularyCards);
  const selected = shuffled.slice(0, 8);
  const tiles: MemoryTile[] = [];

  selected.forEach((card, i) => {
    const pairId = `pair-${i}`;
    tiles.push({ id: `word-${i}`, pairId, type: 'word', value: card.word });
    tiles.push({ id: `trans-${i}`, pairId, type: 'translation', value: card.translation });
  });

  return shuffleArray(tiles);
}
