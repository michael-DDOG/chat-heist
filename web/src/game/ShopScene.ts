import Phaser from 'phaser';
import { getState } from './state/store';
import { getShopGear, buyGear } from './net/api';

export class ShopScene extends Phaser.Scene {
  private gearList: any[] = [];

  constructor() {
    super({ key: 'ShopScene' });
  }

  async create(): Promise<void> {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Title
    this.add.text(width / 2, 50, '🏪 GEAR SHOP', {
      fontSize: '36px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Coins display
    const state = getState();
    this.add.text(width / 2, 100, `💰 ${state.user?.coinsTotal.toLocaleString() || 0} coins`, {
      fontSize: '24px',
      color: '#ffcc00',
    }).setOrigin(0.5);

    // Loading
    const loading = this.add.text(width / 2, height / 2, 'Loading shop...', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    try {
      const shopData = await getShopGear();
      this.gearList = shopData.catalog;

      loading.destroy();

      // Display gear
      const startY = 160;
      const spacing = 80;

      this.gearList.forEach((gear, index) => {
        const y = startY + index * spacing;
        this.createGearItem(width / 2, y, gear);
      });
    } catch (error) {
      console.error('Failed to load shop:', error);
      loading.setText('Failed to load shop\nTap to go back');
      loading.setInteractive().on('pointerdown', () => {
        this.scene.start('MenuScene');
      });
    }

    // Back button
    this.createButton(width / 2, height - 50, 'BACK', () => {
      this.scene.start('MenuScene');
    });
  }

  createGearItem(x: number, y: number, gear: any): void {
    const { width } = this.cameras.main;

    // Background
    const bg = this.add.rectangle(x, y, width * 0.9, 70, 0x2a2a3e);

    // Gear name
    const gearNames: Record<string, string> = {
      HACKER_RIG: '💻 Hacker Rig',
      DRILL: '🔧 Power Drill',
      GETAWAY: '🚗 Getaway Car',
      MASK: '🎭 Stealth Mask',
    };

    this.add.text(x - width * 0.4, y, gearNames[gear.type] || gear.type, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // Level
    this.add.text(x - width * 0.1, y, `Lv ${gear.currentLevel}/${gear.maxLevel}`, {
      fontSize: '18px',
      color: '#aaaaaa',
    });

    // Buy button
    if (gear.nextLevel) {
      const button = this.add.text(x + width * 0.25, y, `${gear.cost} 💰`, {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#e94560',
        padding: { x: 15, y: 8 },
      }).setOrigin(0.5);

      button.setInteractive({ useHandCursor: true });

      button.on('pointerdown', async () => {
        await this.purchaseGear(gear.type, button);
      });

      button.on('pointerover', () => {
        button.setBackgroundColor('#ff5577');
      });

      button.on('pointerout', () => {
        button.setBackgroundColor('#e94560');
      });
    } else {
      this.add.text(x + width * 0.25, y, 'MAX', {
        fontSize: '18px',
        color: '#00ff88',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }
  }

  async purchaseGear(gearType: string, button: Phaser.GameObjects.Text): Promise<void> {
    button.setText('...');

    try {
      const result = await buyGear(gearType);

      // Update user coins
      const state = getState();
      if (state.user) {
        state.user.coinsTotal = result.coinsRemaining;
      }

      // Refresh shop
      this.scene.restart();
    } catch (error: any) {
      console.error('Purchase failed:', error);
      button.setText('ERROR');

      this.time.delayedCall(2000, () => {
        this.scene.restart();
      });
    }
  }

  createButton(x: number, y: number, text: string, callback: () => void): void {
    const button = this.add.text(x, y, text, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#666666',
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
  }
}
