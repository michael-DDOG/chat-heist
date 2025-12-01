import Phaser from 'phaser';
import { authenticate } from './net/api';
import { setUser } from './state/store';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show loading text
    const { width, height } = this.cameras.main;
    const text = this.add.text(width / 2, height / 2, 'Authenticating...', {
      fontSize: '24px',
      color: '#ffffff',
    });
    text.setOrigin(0.5);
  }

  async create(): Promise<void> {
    try {
      // Authenticate with Telegram
      const authData = await authenticate();

      // Store user in state
      setUser(authData.user);

      console.log('Authenticated:', authData.user);

      // Transition to menu
      this.scene.start('MenuScene');
    } catch (error) {
      console.error('Authentication failed:', error);

      // Show error
      const { width, height } = this.cameras.main;
      this.add.text(width / 2, height / 2, 'Authentication Failed\nPlease restart the game', {
        fontSize: '20px',
        color: '#ff5555',
        align: 'center',
      }).setOrigin(0.5);
    }
  }
}
