import Phaser from 'phaser';
import { ArenaScene } from './ArenaScene';

const MAX_HP = 100;
const WIN_ROUNDS = 3;

export class HUDScene extends Phaser.Scene {
  private arena!: ArenaScene;
  private hpBarP1!: Phaser.GameObjects.Rectangle;
  private hpBarP2!: Phaser.GameObjects.Rectangle;
  private scoreP1 = 0;
  private scoreP2 = 0;

  constructor() { super({ key: 'HUDScene', active: false }); }

  init(data: { arenaScene: ArenaScene; scoreP1: number; scoreP2: number }) {
    this.arena = data.arenaScene;
    this.scoreP1 = data.scoreP1;
    this.scoreP2 = data.scoreP2;
  }

  create() {
    const W = this.scale.width;

    // P1 HP Bar background
    this.add.rectangle(20, 22, 250, 20, 0x333333).setOrigin(0);
    this.hpBarP1 = this.add.rectangle(20, 22, 250, 20, 0x00d2ff).setOrigin(0);
    this.add.text(20, 5, 'P1', { fontSize: '14px', color: '#00d2ff', fontStyle: 'bold', fontFamily: 'Arial' });

    // P2 HP Bar background (right side)
    this.add.rectangle(W - 270, 22, 250, 20, 0x333333).setOrigin(0);
    this.hpBarP2 = this.add.rectangle(W - 270, 22, 250, 20, 0xff2d78).setOrigin(0);
    this.add.text(W - 40, 5, 'P2', { fontSize: '14px', color: '#ff2d78', fontStyle: 'bold', fontFamily: 'Arial' });

    // Score (center)
    this.add.text(W / 2, 15, `${this.scoreP1}  —  ${this.scoreP2}`, {
      fontSize: '24px', color: '#ffffff', fontStyle: 'bold', fontFamily: 'Arial',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 0);

    // Round indicator dots
    for (let i = 0; i < WIN_ROUNDS; i++) {
      const col1 = i < this.scoreP1 ? 0x00d2ff : 0x333333;
      const col2 = i < this.scoreP2 ? 0xff2d78 : 0x333333;
      this.add.circle(W / 2 - 60 + i * 20, 45, 6, col1);
      this.add.circle(W / 2 + 40 + i * 20, 45, 6, col2);
    }

    // HP update listener
    this.arena.events.on('hpUpdate', (hp1: number, hp2: number) => {
      this.hpBarP1.width = (hp1 / MAX_HP) * 250;
      this.hpBarP2.width = (hp2 / MAX_HP) * 250;
    });
  }
}
