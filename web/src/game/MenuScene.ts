import Phaser from 'phaser';
import { getState } from './state/store';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const state = getState();

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Title
    const title = this.add.text(width / 2, height * 0.2, '🎭 CHAT HEIST', {
      fontSize: '48px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // User stats
    if (state.user) {
      const statsY = height * 0.35;
      this.add.text(width / 2, statsY,
        `💰 ${state.user.coinsTotal.toLocaleString()} coins\n` +
        `⚡ ${state.user.energy}/5 energy\n` +
        `🔥 Heat: ${state.user.heat}`,
        {
          fontSize: '20px',
          color: '#ffffff',
          align: 'center',
        }
      ).setOrigin(0.5);
    }

    // Buttons
    const buttonY = height * 0.55;
    const buttonSpacing = 80;

    this.createButton(width / 2, buttonY, '🎮 START HEIST', () => {
      this.scene.start('LobbyScene');
    });

    this.createButton(width / 2, buttonY + buttonSpacing, '🏪 SHOP', () => {
      this.scene.start('ShopScene');
    });

    this.createButton(width / 2, buttonY + buttonSpacing * 2, '🏆 LEADERBOARD', () => {
      console.log('Leaderboard coming soon');
    });

    // Footer
    this.add.text(width / 2, height - 30, 'Tap actions • Crack vaults • Escape guards', {
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5);
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
    });

    button.on('pointerup', () => {
      button.setScale(1);
      callback();
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
