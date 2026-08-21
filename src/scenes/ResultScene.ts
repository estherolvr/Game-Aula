import Phaser from 'phaser';

export class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }

  create(data: { winner: number; scoreP1: number; scoreP2: number }) {
    const W = this.scale.width, H = this.scale.height;
    const { winner, scoreP1, scoreP2 } = data;

    this.add.image(W / 2, H / 2, 'starfield').setAlpha(0.5);

    // Dark overlay
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);

    // Winner color and name
    const color = winner === 1 ? '#00d2ff' : '#ff2d78';
    const name = winner === 1 ? 'PLAYER 1' : 'PLAYER 2';

    this.add.text(W / 2, H / 2 - 160, 'VITÓRIA!', {
      fontSize: '72px', color: '#ffffff', fontStyle: 'bold', fontFamily: 'Arial',
      stroke: color, strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 70, name, {
      fontSize: '48px', color, fontStyle: 'bold', fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 20, `${scoreP1}  :  ${scoreP2}`, {
      fontSize: '36px', color: '#dddddd', fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Buttons
    const replayBg = this.add.rectangle(W / 2 - 150, H / 2 + 130, 250, 55, 0x00d2ff).setInteractive();
    this.add.text(W / 2 - 150, H / 2 + 130, 'JOGAR NOVAMENTE', { fontSize: '18px', color: '#000', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);

    const menuBg = this.add.rectangle(W / 2 + 150, H / 2 + 130, 200, 55, 0x444444).setInteractive();
    this.add.text(W / 2 + 150, H / 2 + 130, 'MENU INICIAL', { fontSize: '18px', color: '#fff', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);

    replayBg.on('pointerdown', () => {
      this.scene.start('ArenaScene', { scoreP1: 0, scoreP2: 0 });
    });
    menuBg.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    replayBg.on('pointerover', () => replayBg.setFillStyle(0x00ffff));
    replayBg.on('pointerout', () => replayBg.setFillStyle(0x00d2ff));
    menuBg.on('pointerover', () => menuBg.setFillStyle(0x666666));
    menuBg.on('pointerout', () => menuBg.setFillStyle(0x444444));
  }
}
