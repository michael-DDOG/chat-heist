import Phaser from 'phaser';
import { getState, incrementScore, incrementInputs, incrementEventsCompleted } from './state/store';

const HEIST_DURATION = 60; // seconds
const MINI_EVENTS = ['HACK', 'DRILL', 'LOCKPICK', 'DRIVE', 'CAMERAS', 'SAFE'];

export class HeistScene extends Phaser.Scene {
  private timeRemaining: number = HEIST_DURATION;
  private timerText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private currentEvent: string = '';
  private eventText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Rectangle;
  private eventProgress: number = 0;
  private eventTarget: number = 10;

  constructor() {
    super({ key: 'HeistScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const state = getState();

    // Background
    this.add.rectangle(0, 0, width, height, 0x0f0f1e).setOrigin(0);

    // HUD
    this.scoreText = this.add.text(20, 20, `Score: ${state.currentRun?.score || 0}`, {
      fontSize: '24px',
      color: '#ffcc00',
      fontStyle: 'bold',
    });

    this.timerText = this.add.text(width - 20, 20, `⏱ ${HEIST_DURATION}s`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOriginX(1);

    // Event display
    this.eventText = this.add.text(width / 2, height * 0.3, '', {
      fontSize: '32px',
      color: '#e94560',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // Progress bar
    const barWidth = width * 0.6;
    const barHeight = 30;
    const barY = height * 0.5;

    this.add.rectangle(width / 2, barY, barWidth, barHeight, 0x333333).setOrigin(0.5);
    this.progressBar = this.add.rectangle(
      width / 2 - barWidth / 2,
      barY,
      0,
      barHeight,
      0x00ff88
    ).setOrigin(0, 0.5);

    // Tap area
    const tapArea = this.add.rectangle(0, height * 0.6, width, height * 0.4, 0x1a1a2e, 0.5)
      .setOrigin(0)
      .setInteractive();

    const tapText = this.add.text(width / 2, height * 0.8, '👆 TAP TO ACT', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    tapArea.on('pointerdown', () => {
      this.handleTap();
      tapText.setScale(1.1);
    });

    tapArea.on('pointerup', () => {
      tapText.setScale(1);
    });

    // Start timer
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Start first event
    this.startNewEvent();
  }

  updateTimer(): void {
    this.timeRemaining--;
    this.timerText.setText(`⏱ ${this.timeRemaining}s`);

    if (this.timeRemaining <= 0) {
      this.endHeist();
    }
  }

  startNewEvent(): void {
    this.currentEvent = Phaser.Utils.Array.GetRandom(MINI_EVENTS);
    this.eventProgress = 0;
    this.eventTarget = Phaser.Math.Between(8, 15);

    const eventNames: Record<string, string> = {
      HACK: '💻 HACK THE SYSTEM',
      DRILL: '🔧 DRILL THE VAULT',
      LOCKPICK: '🔓 PICK THE LOCK',
      DRIVE: '🚗 DRIVE ESCAPE',
      CAMERAS: '📹 DISABLE CAMERAS',
      SAFE: '💎 CRACK THE SAFE',
    };

    this.eventText.setText(eventNames[this.currentEvent] || this.currentEvent);
    this.updateProgressBar();
  }

  handleTap(): void {
    if (this.timeRemaining <= 0) return;

    incrementInputs();

    this.eventProgress++;
    this.updateProgressBar();

    // Add score
    const points = 10;
    incrementScore(points);
    this.scoreText.setText(`Score: ${getState().currentRun?.score || 0}`);

    // Check if event completed
    if (this.eventProgress >= this.eventTarget) {
      incrementEventsCompleted();

      // Bonus for completion
      incrementScore(50);
      this.scoreText.setText(`Score: ${getState().currentRun?.score || 0}`);

      // Show completion effect
      this.showEventComplete();

      // Start new event
      this.time.delayedCall(500, () => {
        this.startNewEvent();
      });
    }
  }

  updateProgressBar(): void {
    const { width } = this.cameras.main;
    const barWidth = width * 0.6;
    const progress = Math.min(this.eventProgress / this.eventTarget, 1);
    this.progressBar.width = barWidth * progress;
  }

  showEventComplete(): void {
    const { width, height } = this.cameras.main;
    const text = this.add.text(width / 2, height * 0.5, '✓ COMPLETE!', {
      fontSize: '36px',
      color: '#00ff88',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      alpha: 0,
      y: height * 0.4,
      duration: 500,
      onComplete: () => text.destroy(),
    });
  }

  endHeist(): void {
    this.scene.start('EscapeScene');
  }
}
