import Phaser from 'phaser';
import { startRun } from './net/api';
import { setCurrentRun } from './state/store';

export class LobbyScene extends Phaser.Scene {
  private difficultyLevel: number = 1;

  constructor() {
    super({ key: 'LobbyScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Title
    this.add.text(width / 2, height * 0.15, 'HEIST LOBBY', {
      fontSize: '36px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Difficulty selector
    const diffY = height * 0.35;
    this.add.text(width / 2, diffY - 40, 'Select Difficulty:', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const diffText = this.add.text(width / 2, diffY + 20, this.getDifficultyText(), {
      fontSize: '32px',
      color: '#ffcc00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Difficulty buttons
    this.createButton(width / 2 - 100, diffY + 20, '◀', () => {
      this.difficultyLevel = Math.max(1, this.difficultyLevel - 1);
      diffText.setText(this.getDifficultyText());
    }, 60);

    this.createButton(width / 2 + 100, diffY + 20, '▶', () => {
      this.difficultyLevel = Math.min(5, this.difficultyLevel + 1);
      diffText.setText(this.getDifficultyText());
    }, 60);

    // Info
    this.add.text(width / 2, diffY + 80,
      'Higher difficulty = better rewards\nCosts 1 energy',
      {
        fontSize: '16px',
        color: '#aaaaaa',
        align: 'center',
      }
    ).setOrigin(0.5);

    // Start button
    this.createButton(width / 2, height * 0.65, '🚀 START HEIST', async () => {
      await this.startHeist();
    }, 200, 60);

    // Back button
    this.createButton(width / 2, height * 0.8, 'Back', () => {
      this.scene.start('MenuScene');
    }, 150, 50);
  }

  getDifficultyText(): string {
    const levels = ['EASY', 'MEDIUM', 'HARD', 'EXPERT', 'INSANE'];
    return `⭐ ${levels[this.difficultyLevel - 1]}`;
  }

  async startHeist(): Promise<void> {
    try {
      const { width, height } = this.cameras.main;
      const loading = this.add.text(width / 2, height / 2, 'Starting heist...', {
        fontSize: '24px',
        color: '#ffffff',
      }).setOrigin(0.5);

      const runData = await startRun({
        difficulty: this.difficultyLevel,
        mode: 'SOLO',
      });

      // Store run data
      setCurrentRun({
        runId: runData.runId,
        seed: runData.seed,
        nonce: runData.nonce,
        difficulty: runData.difficulty,
        mode: runData.mode,
        startTime: Date.now(),
        score: 0,
        eventsCompleted: 0,
        inputs: 0,
      });

      loading.destroy();
      this.scene.start('HeistScene');
    } catch (error: any) {
      console.error('Failed to start heist:', error);

      const { width, height } = this.cameras.main;
      const errorText = this.add.text(width / 2, height / 2,
        `Error: ${error.message}\n\nTap to continue`,
        {
          fontSize: '20px',
          color: '#ff5555',
          align: 'center',
        }
      ).setOrigin(0.5).setInteractive();

      errorText.on('pointerdown', () => {
        this.scene.start('MenuScene');
      });
    }
  }

  createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void,
    width: number = 80,
    height: number = 60
  ): void {
    const button = this.add.text(x, y, text, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#e94560',
      padding: { x: width / 4, y: height / 4 },
    });
    button.setOrigin(0.5);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerdown', () => {
      button.setScale(0.95);
      callback();
    });

    button.on('pointerup', () => {
      button.setScale(1);
    });

    button.on('pointerover', () => {
      button.setBackgroundColor('#ff5577');
    });

    button.on('pointerout', () => {
      button.setBackgroundColor('#e94560');
      button.setScale(1);
    });
  }
}
