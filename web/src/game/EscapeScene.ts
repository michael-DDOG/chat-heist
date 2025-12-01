import Phaser from 'phaser';
import { getState, incrementScore, incrementInputs } from './state/store';

const ESCAPE_DURATION = 10; // seconds

export class EscapeScene extends Phaser.Scene {
  private timeRemaining: number = ESCAPE_DURATION;
  private timerText!: Phaser.GameObjects.Text;
  private obstacles: Phaser.GameObjects.Rectangle[] = [];
  private successfulDodges: number = 0;

  constructor() {
    super({ key: 'EscapeScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x0f0f1e).setOrigin(0);

    // Title
    this.add.text(width / 2, 50, '🚨 ESCAPE!', {
      fontSize: '36px',
      color: '#ff5555',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Timer
    this.timerText = this.add.text(width / 2, 100, `${ESCAPE_DURATION}s`, {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Instructions
    this.add.text(width / 2, height * 0.8, 'TAP TO DODGE OBSTACLES', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Make screen interactive
    this.input.on('pointerdown', () => {
      this.handleDodge();
    });

    // Spawn obstacles
    this.time.addEvent({
      delay: 1500,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    // Timer
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  updateTimer(): void {
    this.timeRemaining--;
    this.timerText.setText(`${this.timeRemaining}s`);

    if (this.timeRemaining <= 0) {
      this.endEscape();
    }
  }

  spawnObstacle(): void {
    const { width, height } = this.cameras.main;
    const x = Phaser.Math.Between(width * 0.2, width * 0.8);
    const size = 60;

    const obstacle = this.add.rectangle(x, 150, size, size, 0xff5555);
    this.obstacles.push(obstacle);

    this.tweens.add({
      targets: obstacle,
      y: height + size,
      duration: 2000,
      onComplete: () => {
        obstacle.destroy();
        const index = this.obstacles.indexOf(obstacle);
        if (index > -1) {
          this.obstacles.splice(index, 1);
        }
      },
    });
  }

  handleDodge(): void {
    incrementInputs();

    // Remove closest obstacle
    if (this.obstacles.length > 0) {
      const obstacle = this.obstacles[0];
      this.obstacles.shift();

      // Add bonus score
      incrementScore(20);
      this.successfulDodges++;

      // Visual feedback
      obstacle.setFillStyle(0x00ff88);
      this.tweens.add({
        targets: obstacle,
        alpha: 0,
        scale: 1.5,
        duration: 300,
        onComplete: () => obstacle.destroy(),
      });
    }
  }

  endEscape(): void {
    // Bonus for successful dodges
    const bonus = this.successfulDodges * 50;
    incrementScore(bonus);

    this.scene.start('ResultsScene');
  }
}
