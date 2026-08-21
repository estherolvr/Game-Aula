import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { TutorialScene } from './scenes/TutorialScene';
import { OfficeScene } from './scenes/OfficeScene';
import { UIScene } from './scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1e272e', 
  pixelArt: true,
  scene: [Preloader, MainMenu, TutorialScene, OfficeScene, UIScene]
};

new Phaser.Game(config);
