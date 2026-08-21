import Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(0, 0, width, height, 0x1e272e).setOrigin(0);

    // Title
    this.add.text(width / 2, height / 2 - 100, 'BYTECRAFT', {
      fontSize: '64px',
      color: '#0fb9b1',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height / 2 - 40, 'PC Builder Sim', {
      fontSize: '24px',
      color: '#d1d8e0',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Buttons
    this.createButton(width / 2, height / 2 + 50, 'NOVO JOGO', () => {
      this.scene.start('OfficeScene');
    });

    this.createButton(width / 2, height / 2 + 120, 'COMO JOGAR', () => {
      this.scene.start('TutorialScene');
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void) {
    const bg = this.add.rectangle(x, y, 250, 50, 0x3867d6).setInteractive();
    const txt = this.add.text(x, y, text, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x4b7bec));
    bg.on('pointerout', () => bg.setFillStyle(0x3867d6));
    bg.on('pointerdown', callback);
  }
}
