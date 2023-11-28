import { makeAutoObservable } from 'mobx';
import { LEVELS } from '../constants/levels';

export interface ILevelItem {
  level: number;
  key: string;
  name: string;
  score: number;
  isUnlock: boolean;
}

class LevelStore {
  currentLevel = 1;
  levels: ILevelItem[] = LEVELS;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentLevel(currentLevel: number) {
    this.currentLevel = currentLevel;
  }

  get totalScore(): number {
    return this.levels.reduce((acc, cur) => acc + cur.score, 0);
  }

  initializeLevels(levels: ILevelItem[]) {
    if (this.levels.length > 0) {
      console.warn('levels has been initialized');
      return;
    }
    this.levels = levels;
  }

  updateLevelScore(level: number, score: number) {
    const index = this.levels.findIndex((item) => item.level === level);
    if (index >= 0) {
      this.levels[index].score = score;
    } else {
      console.error(`level ${level} not found`);
    }
  }

  unlockLevel(level: number) {
    const index = this.levels.findIndex((item) => item.level === level);
    if (index >= 0) {
      this.levels[index].isUnlock = true;
    } else {
      console.error(`level ${level} not found`);
    }
  }
}

const levelStore = new LevelStore();
export { levelStore };
