import Phaser from 'phaser';
import { getState, clearCurrentRun, calculateChecksum } from './state/store';
import { completeRun } from './net/api';

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultsScene' });
  }

  async create(): Promise<void> {
    const { width, height } = this.cameras.main;
    const state = getState();

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Loading
    const loading = this.add.text(width / 2, height / 2, 'Submitting results...', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    try {
      if (!state.currentRun) {
        throw new Error('No run data');
      }

      // Calculate checksum
      const checksum = calculateChecksum();

      // Submit to server
      const result = await completeRun({
        runId: state.currentRun.runId,
        score: state.currentRun.score,
        eventsCompleted: state.currentRun.eventsCompleted,
        inputs: state.currentRun.inputs,
        checksum,
      });

      loading.destroy();

      // Show results
      const yStart = height * 0.2;
      const spacing = 60;

      // Title
      this.add.text(width / 2, yStart, result.success ? '✅ HEIST SUCCESS!' : '❌ HEIST FAILED', {
        fontSize: '36px',
        color: result.success ? '#00ff88' : '#ff5555',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      // Stats
      this.add.text(width / 2, yStart + spacing,
        `Score: ${result.score.toLocaleString()}`,
        {
          fontSize: '28px',
          color: '#ffcc00',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5);

      this.add.text(width / 2, yStart + spacing * 2,
        `💰 Cash Earned: ${result.cashEarned.toLocaleString()}`,
        {
          fontSize: '24px',
          color: '#ffffff',
        }
      ).setOrigin(0.5);

      this.add.text(width / 2, yStart + spacing * 3,
        `💰 Total: ${result.totalCoins.toLocaleString()}`,
        {
          fontSize: '20px',
          color: '#aaaaaa',
        }
      ).setOrigin(0.5);

      if (result.heat > 0) {
        this.add.text(width / 2, yStart + spacing * 4,
          `🔥 Heat: ${result.heat}`,
          {
            fontSize: '20px',
            color: '#ff8844',
          }
        ).setOrigin(0.5);
      }

      // Buttons
      this.createButton(width / 2, height * 0.75, '🔄 PLAY AGAIN', () => {
        clearCurrentRun();
        this.scene.start('LobbyScene');
      });

      this.createButton(width / 2, height * 0.85, 'MENU', () => {
        clearCurrentRun();
        this.scene.start('MenuScene');
      });

      // Update user state
      if (state.user) {
        state.user.coinsTotal = result.totalCoins;
        state.user.heat = result.heat;
      }

      clearCurrentRun();
    } catch (error: any) {
      console.error('Failed to submit results:', error);

      loading.destroy();

      this.add.text(width / 2, height / 2,
        `Error: ${error.message}\n\nTap to continue`,
        {
          fontSize: '20px',
          color: '#ff5555',
          align: 'center',
        }
      ).setOrigin(0.5).setInteractive().on('pointerdown', () => {
        clearCurrentRun();
        this.scene.start('MenuScene');
      });
    }
  }

  createButton(x: number, y: number, text: string, callback: () => void): void {
    const button = this.add.text(x, y, text, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#e94560',
      padding: { x: 30, y: 15 },
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
