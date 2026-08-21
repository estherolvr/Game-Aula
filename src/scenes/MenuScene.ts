import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.image(W / 2, H / 2, 'starfield');

    // Ship previews
    this.add.image(220, H / 2 - 60, 'ship_p1').setScale(0.22).setTint(0x00d2ff);
    this.add.image(W - 220, H / 2 - 60, 'ship_p2').setScale(0.22).setTint(0xff2d78);

    // Title
    this.add.text(W / 2, 80, 'STELLAR DUEL', {
      fontSize: '72px', color: '#00d2ff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#005599', strokeThickness: 8,
      shadow: { color: '#00ffff', blur: 24, fill: true }
    }).setOrigin(0.5);

    this.add.text(W / 2, 155, '2 PLAYERS LOCAL', {
      fontSize: '22px', color: '#aaddff', fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Controls summary
    this.add.rectangle(220, H / 2 + 60, 320, 110, 0x00d2ff, 0.1);
    this.add.text(220, H / 2 + 5, 'PLAYER 1', { fontSize: '20px', color: '#00d2ff', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);
    this.add.text(220, H / 2 + 50, 'WASD — Mover\nESPAÇO — Atirar', { fontSize: '16px', color: '#aaddff', fontFamily: 'Arial', align: 'center' }).setOrigin(0.5);

    this.add.rectangle(W - 220, H / 2 + 60, 320, 110, 0xff2d78, 0.1);
    this.add.text(W - 220, H / 2 + 5, 'PLAYER 2', { fontSize: '20px', color: '#ff2d78', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);
    this.add.text(W - 220, H / 2 + 50, 'SETAS — Mover\nENTER — Atirar', { fontSize: '16px', color: '#ffaad4', fontFamily: 'Arial', align: 'center' }).setOrigin(0.5);

    // Buttons
    const startBg = this.add.rectangle(W / 2, H / 2 + 70, 280, 60, 0x00d2ff).setInteractive();
    const startTxt = this.add.text(W / 2, H / 2 + 70, '▶  INICIAR BATALHA', {
      fontSize: '22px', color: '#000', fontStyle: 'bold', fontFamily: 'Arial'
    }).setOrigin(0.5);

    const howBg = this.add.rectangle(W / 2, H / 2 + 148, 220, 44, 0x334455).setInteractive();
    this.add.text(W / 2, H / 2 + 148, '?  COMO JOGAR', {
      fontSize: '18px', color: '#aaddff', fontFamily: 'Arial'
    }).setOrigin(0.5);

    startBg.on('pointerover', () => startBg.setFillStyle(0x00ffff));
    startBg.on('pointerout', () => startBg.setFillStyle(0x00d2ff));
    startBg.on('pointerdown', () => this.scene.start('ArenaScene', { scoreP1: 0, scoreP2: 0 }));

    howBg.on('pointerover', () => howBg.setFillStyle(0x4477aa));
    howBg.on('pointerout', () => howBg.setFillStyle(0x334455));
    howBg.on('pointerdown', () => this.scene.start('HowToPlayScene'));

    this.tweens.add({ targets: [startBg, startTxt], scaleX: 1.04, scaleY: 1.04, yoyo: true, repeat: -1, duration: 700 });
  }
}
