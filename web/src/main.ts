import Phaser from 'phaser';
import { BootScene } from './game/BootScene';
import { MenuScene } from './game/MenuScene';
import { LobbyScene } from './game/LobbyScene';
import { HeistScene } from './game/HeistScene';
import { EscapeScene } from './game/EscapeScene';
import { ResultsScene } from './game/ResultsScene';
import { ShopScene } from './game/ShopScene';

// Initialize Telegram WebApp
const tg = (window as any).Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    MenuScene,
    LobbyScene,
    HeistScene,
    EscapeScene,
    ResultsScene,
    ShopScene,
  ],
};

// Create game instance
const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

// Hide loading screen
const loading = document.getElementById('loading');
if (loading) {
  loading.style.display = 'none';
}

export default game;
