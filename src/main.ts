import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { HowToPlayScene } from './scenes/HowToPlayScene';
import { ArenaScene } from './scenes/ArenaScene';
import { HUDScene } from './scenes/HUDScene';
import { ResultScene } from './scenes/ResultScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#000011',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [BootScene, MenuScene, HowToPlayScene, ArenaScene, HUDScene, ResultScene]
};

new Phaser.Game(config);
