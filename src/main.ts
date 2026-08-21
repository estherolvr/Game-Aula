import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';
import { OfficeScene } from './scenes/OfficeScene';
import { UIScene } from './scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#2b2b2b', // Dark gray for the office table background
  pixelArt: true,
  scene: [Preloader, OfficeScene, UIScene]
};

new Phaser.Game(config);
