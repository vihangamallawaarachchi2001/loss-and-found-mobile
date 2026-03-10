import type { ItemReport } from '../domain/types';

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'is',
  'are',
  'was',
  'were',
  'to',
  'of',
  'in',
  'on',
  'at',
  'with',
  'for',
  'from',
  'this',
  'that',
  'it',
  'inside',
  'contains',
]);

const COLOR_WORDS = [
  'black',
  'white',
  'blue',
  'red',
  'green',
  'yellow',
  'gray',
  'silver',
  'gold',
  'brown',
  'pink',
  'purple',
];

const SHAPE_WORDS = [
  'round',
  'square',
  'rectangular',
  'oval',
  'slim',
  'small',
  'large',
  'long',
  'short',
];

export type MatchScoreResult = {
  textScore: number;
  imageScore: number;
  combinedScore: number;
};

export const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const extractKeywords = (value: string): string[] => {
  const normalized = normalizeText(value);

  return normalized
    .split(' ')
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
};

export const jaccardSimilarity = (first: string[], second: string[]): number => {
  const setA = new Set(first);
  const setB = new Set(second);

  if (setA.size === 0 || setB.size === 0) {
    return 0;
  }

  const intersectionCount = [...setA].filter((keyword) => setB.has(keyword)).length;
  const unionCount = new Set([...setA, ...setB]).size;

  return unionCount === 0 ? 0 : intersectionCount / unionCount;
};

export const calculateTextSimilarity = (lostDescription: string, foundDescription: string): number => {
  const lostKeywords = extractKeywords(lostDescription);
  const foundKeywords = extractKeywords(foundDescription);

  return jaccardSimilarity(lostKeywords, foundKeywords);
};

const collectImageTokens = (...values: string[]): Set<string> => {
  const tokens = values
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s/._-]/g, ' ')
    .split(/[\s/._-]+/)
    .filter(Boolean);

  return new Set(tokens);
};

const filterKnownTokens = (tokenSet: Set<string>, knownWords: string[]): string[] =>
  knownWords.filter((word) => tokenSet.has(word));

const hashStringToBits = (value: string): string => {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  const unsignedHash = hash >>> 0;
  return unsignedHash.toString(2).padStart(32, '0');
};

const hammingDistance = (firstBits: string, secondBits: string): number => {
  const maxLength = Math.max(firstBits.length, secondBits.length);
  const normalizedFirst = firstBits.padStart(maxLength, '0');
  const normalizedSecond = secondBits.padStart(maxLength, '0');

  let distance = 0;

  for (let index = 0; index < maxLength; index += 1) {
    if (normalizedFirst[index] !== normalizedSecond[index]) {
      distance += 1;
    }
  }

  return distance;
};

const calculateHistogramSimilarity = (lostItem: ItemReport, foundItem: ItemReport): number => {
  const lostTokens = collectImageTokens(lostItem.imageUri ?? '', lostItem.description);
  const foundTokens = collectImageTokens(foundItem.imageUri ?? '', foundItem.description);

  const lostColorWords = filterKnownTokens(lostTokens, COLOR_WORDS);
  const foundColorWords = filterKnownTokens(foundTokens, COLOR_WORDS);

  return jaccardSimilarity(lostColorWords, foundColorWords);
};

const calculateShapeSimilarity = (lostItem: ItemReport, foundItem: ItemReport): number => {
  const lostTokens = collectImageTokens(lostItem.imageUri ?? '', lostItem.description);
  const foundTokens = collectImageTokens(foundItem.imageUri ?? '', foundItem.description);

  const lostShapeWords = filterKnownTokens(lostTokens, SHAPE_WORDS);
  const foundShapeWords = filterKnownTokens(foundTokens, SHAPE_WORDS);

  return jaccardSimilarity(lostShapeWords, foundShapeWords);
};

const calculatePerceptualHashSimilarity = (lostImageUrl?: string, foundImageUrl?: string): number => {
  if (!lostImageUrl || !foundImageUrl) {
    return 0;
  }

  const lostHash = hashStringToBits(normalizeText(lostImageUrl));
  const foundHash = hashStringToBits(normalizeText(foundImageUrl));
  const distance = hammingDistance(lostHash, foundHash);

  return 1 - distance / Math.max(lostHash.length, foundHash.length);
};

export const calculateImageSimilarity = (lostItem: ItemReport, foundItem: ItemReport): number => {
  if (!lostItem.imageUri && !foundItem.imageUri) {
    return 0;
  }

  const histogramScore = calculateHistogramSimilarity(lostItem, foundItem);
  const shapeScore = calculateShapeSimilarity(lostItem, foundItem);
  const hashScore = calculatePerceptualHashSimilarity(lostItem.imageUri, foundItem.imageUri);

  return histogramScore * 0.4 + shapeScore * 0.25 + hashScore * 0.35;
};

export const calculateCombinedSimilarity = (
  lostItem: ItemReport,
  foundItem: ItemReport,
): MatchScoreResult => {
  const textScore = calculateTextSimilarity(lostItem.description, foundItem.description);
  const imageScore = calculateImageSimilarity(lostItem, foundItem);

  const combinedScore = imageScore > 0
    ? textScore * 0.65 + imageScore * 0.35
    : textScore;

  return {
    textScore,
    imageScore,
    combinedScore,
  };
};

export const sortByScoreDescending = <T extends { combinedScore: number }>(items: T[]): T[] =>
  [...items].sort((first, second) => second.combinedScore - first.combinedScore);
