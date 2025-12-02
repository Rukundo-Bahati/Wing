import { app } from 'electron';
import path from 'path';
import fs from 'fs';



class SpellcheckerService {
  private dictionaries: Map<string, any> = new Map();
  private customWords: Map<string, Set<string>> = new Map();
  private enabledLanguages: Set<string> = new Set(['rw']);
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load Kinyarwanda dictionary
      await this.loadDictionary('rw');
      this.loadCustomWords();
      this.initialized = true;
      console.log('Spellchecker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize spellchecker:', error);
      // Continue without spellchecker rather than failing
    }
  }

  private async loadDictionary(language: string): Promise<void> {
    const userDataPath = app.getPath('userData');
    const dictPath = path.join(userDataPath, 'dictionaries', language);

    // Check if dictionary files exist
    const affPath = path.join(dictPath, `${language}.aff`);
    const dicPath = path.join(dictPath, `${language}.dic`);

    if (!fs.existsSync(affPath) || !fs.existsSync(dicPath)) {
      console.warn(`Dictionary files not found for ${language}, creating basic dictionary`);
      await this.createBasicDictionary(language, dictPath);
    }

    try {
      // For MVP, we'll use a simple word list approach
      // In production, integrate with nodehun for full Hunspell support
      const dictionary = this.loadWordList(dicPath);
      this.dictionaries.set(language, dictionary);
    } catch (error) {
      console.error(`Failed to load dictionary for ${language}:`, error);
      // Create empty dictionary as fallback
      this.dictionaries.set(language, new Set<string>());
    }
  }

  private async createBasicDictionary(language: string, dictPath: string): Promise<void> {
    // Create directory if it doesn't exist
    if (!fs.existsSync(dictPath)) {
      fs.mkdirSync(dictPath, { recursive: true });
    }

    // Create basic Kinyarwanda word list
    const basicWords = [
      'muraho',
      'mwaramutse',
      'mwiriwe',
      'ijoro',
      'ryari',
      'urakoze',
      'murakoze',
      'yego',
      'oya',
      'amakuru',
      'neza',
      'byiza',
      'gute',
      'ute',
      'ryari',
      'hehe',
      'kubera',
      'kuki',
      'igihe',
      'umunsi',
      'icyumweru',
      'ukwezi',
      'umwaka',
      'abantu',
      'umuntu',
      'umuryango',
      'inzu',
      'akazi',
      'ishuri',
      'ibitabo',
      'igitabo',
      'imodoka',
      'indege',
      'amazi',
      'ibiryo',
      'umugati',
      'ibirayi',
      'inyama',
      'imboga',
      'imbuto',
      'Rwanda',
      'Kigali',
      'Kinyarwanda',
      'Ikinyarwanda',
    ];

    // Write basic dictionary file
    const dicPath = path.join(dictPath, `${language}.dic`);
    const affPath = path.join(dictPath, `${language}.aff`);

    fs.writeFileSync(dicPath, basicWords.join('\n'), 'utf-8');
    fs.writeFileSync(affPath, 'SET UTF-8\n', 'utf-8');
  }

  private loadWordList(dicPath: string): Set<string> {
    try {
      const content = fs.readFileSync(dicPath, 'utf-8');
      const words = content
        .split('\n')
        .map((line) => line.trim().toLowerCase())
        .filter((word) => word.length > 0);
      return new Set(words);
    } catch (error) {
      console.error('Failed to load word list:', error);
      return new Set<string>();
    }
  }

  checkWord(word: string, language: string = 'rw'): boolean {
    if (!this.initialized || !this.enabledLanguages.has(language)) {
      return true; // Don't mark as incorrect if not initialized
    }

    const normalizedWord = word.toLowerCase().trim();

    // Check custom dictionary first
    const customDict = this.customWords.get(language);
    if (customDict?.has(normalizedWord)) {
      return true;
    }

    // Check main dictionary
    const dictionary = this.dictionaries.get(language);
    if (dictionary instanceof Set) {
      return dictionary.has(normalizedWord);
    }

    return true; // Default to correct if dictionary not available
  }

  getSuggestions(word: string, language: string = 'rw'): string[] {
    if (!this.initialized || !this.enabledLanguages.has(language)) {
      return [];
    }

    const normalizedWord = word.toLowerCase().trim();
    const dictionary = this.dictionaries.get(language);

    if (!(dictionary instanceof Set)) {
      return [];
    }

    const suggestions: string[] = [];

    // Simple suggestion algorithm for MVP
    // 1. Find words with similar length
    // 2. Find words with similar starting letters
    // 3. Calculate edit distance

    for (const dictWord of dictionary) {
      if (suggestions.length >= 5) break;

      // Similar length
      if (Math.abs(dictWord.length - normalizedWord.length) <= 2) {
        // Similar starting
        if (dictWord.startsWith(normalizedWord.substring(0, 2))) {
          const distance = this.levenshteinDistance(normalizedWord, dictWord);
          if (distance <= 2) {
            suggestions.push(dictWord);
          }
        }
      }
    }

    return suggestions;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  addToDictionary(word: string, language: string = 'rw'): void {
    const normalizedWord = word.toLowerCase().trim();

    if (!this.customWords.has(language)) {
      this.customWords.set(language, new Set());
    }

    this.customWords.get(language)!.add(normalizedWord);
    this.saveCustomWords();
  }

  removeFromDictionary(word: string, language: string = 'rw'): void {
    const normalizedWord = word.toLowerCase().trim();
    const customDict = this.customWords.get(language);

    if (customDict) {
      customDict.delete(normalizedWord);
      this.saveCustomWords();
    }
  }

  enableLanguage(language: string): void {
    this.enabledLanguages.add(language);
  }

  disableLanguage(language: string): void {
    this.enabledLanguages.delete(language);
  }

  getEnabledLanguages(): string[] {
    return Array.from(this.enabledLanguages);
  }

  private loadCustomWords(): void {
    try {
      const userDataPath = app.getPath('userData');
      const customWordsPath = path.join(userDataPath, 'custom-words.json');

      if (fs.existsSync(customWordsPath)) {
        const content = fs.readFileSync(customWordsPath, 'utf-8');
        const data = JSON.parse(content);

        for (const [lang, words] of Object.entries(data)) {
          this.customWords.set(lang, new Set(words as string[]));
        }
      }
    } catch (error) {
      console.error('Failed to load custom words:', error);
    }
  }

  private saveCustomWords(): void {
    try {
      const userDataPath = app.getPath('userData');
      const customWordsPath = path.join(userDataPath, 'custom-words.json');

      const data: Record<string, string[]> = {};
      for (const [lang, words] of this.customWords.entries()) {
        data[lang] = Array.from(words);
      }

      fs.writeFileSync(customWordsPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save custom words:', error);
    }
  }

  // Check multiple words in a text
  checkText(text: string, language: string = 'rw'): Array<{ word: string; correct: boolean; index: number }> {
    const words = text.match(/\b[\w']+\b/g) || [];
    const results: Array<{ word: string; correct: boolean; index: number }> = [];

    let currentIndex = 0;
    for (const word of words) {
      const index = text.indexOf(word, currentIndex);
      const correct = this.checkWord(word, language);

      results.push({ word, correct, index });
      currentIndex = index + word.length;
    }

    return results;
  }
}

// Singleton instance
export const spellcheckerService = new SpellcheckerService();
