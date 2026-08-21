import Phaser from 'phaser';

export class HowToPlayScene extends Phaser.Scene {
  constructor() { super('HowToPlayScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;

    this.add.image(W / 2, H / 2, 'starfield').setAlpha(0.6);
    this.add.rectangle(W / 2, H / 2, W, H, 0x000022, 0.7);

    this.add.text(W / 2, 50, 'COMO JOGAR', {
      fontSize: '42px', color: '#00d2ff', fontStyle: 'bold', fontFamily: 'Arial',
      stroke: '#003366', strokeThickness: 6
    }).setOrigin(0.5);

    // --- CONTROLS SECTION ---
    this.sectionTitle(80, 120, 'CONTROLES');

    // P1
    this.add.image(160, 200, 'ship_p1').setScale(0.12).setTint(0x00d2ff);
    this.add.text(220, 165, 'PLAYER 1 — Azul', { fontSize: '20px', color: '#00d2ff', fontStyle: 'bold', fontFamily: 'Arial' });
    this.keyCard(220, 195, 'W A S D', 'Mover a nave');
    this.keyCard(220, 230, 'ESPAÇO', 'Atirar');

    // P2
    this.add.image(700, 200, 'ship_p2').setScale(0.12).setTint(0xff2d78);
    this.add.text(760, 165, 'PLAYER 2 — Vermelho', { fontSize: '20px', color: '#ff2d78', fontStyle: 'bold', fontFamily: 'Arial' });
    this.keyCard(760, 195, '↑ ↓ ← →', 'Mover a nave');
    this.keyCard(760, 230, 'ENTER', 'Atirar');

    // --- RULES SECTION ---
    this.sectionTitle(80, 290, 'REGRAS');

    const rules = [
      '🚀  Mova sua nave livremente pela arena.',
      '🔫  Pressione Atirar para disparar um projétil — a nave aponta automaticamente para o adversário.',
      '💥  Cada tiro causa 20 de dano. Com 100 HP, são 5 acertos para vencer a rodada.',
      '🛡️  Mova-se para desviar dos tiros inimigos.',
      '🏆  Vence a partida quem ganhar 3 rodadas primeiro (Melhor de 5).',
    ];

    rules.forEach((rule, i) => {
      this.add.text(80, 320 + i * 52, rule, {
        fontSize: '18px', color: '#ddeeff', fontFamily: 'Arial', wordWrap: { width: 1120 }
      });
    });

    // --- TIPS SECTION ---
    this.sectionTitle(80, 580, 'DICAS');
    this.add.text(80, 608, '⚡ Há cooldown entre os tiros — mire antes de atirar!   •   🎯 A nave SEMPRE apira para o inimigo — o segredo é o posicionamento.', {
      fontSize: '16px', color: '#88aacc', fontFamily: 'Arial'
    });

    // Back button
    const backBg = this.add.rectangle(W / 2, H - 45, 240, 48, 0x334455).setInteractive();
    this.add.text(W / 2, H - 45, '← VOLTAR AO MENU', { fontSize: '18px', color: '#aaddff', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);

    backBg.on('pointerover', () => backBg.setFillStyle(0x4477aa));
    backBg.on('pointerout', () => backBg.setFillStyle(0x334455));
    backBg.on('pointerdown', () => this.scene.start('MenuScene'));

    // Press any key
    this.add.text(W - 20, H - 20, 'ESC — Voltar', { fontSize: '14px', color: '#556677', fontFamily: 'Arial' }).setOrigin(1, 1);
    this.input.keyboard!.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  private sectionTitle(x: number, y: number, text: string) {
    this.add.rectangle(x + 200, y + 12, 400, 2, 0x00d2ff, 0.4).setOrigin(0.5);
    this.add.text(x, y, text, { fontSize: '22px', color: '#00d2ff', fontStyle: 'bold', fontFamily: 'Arial' });
  }

  private keyCard(x: number, y: number, key: string, desc: string) {
    this.add.rectangle(x, y + 8, 110, 28, 0x1a3a5c).setOrigin(0);
    this.add.text(x + 4, y + 10, key, { fontSize: '15px', color: '#ffffff', fontStyle: 'bold', fontFamily: 'Courier' });
    this.add.text(x + 120, y + 10, desc, { fontSize: '15px', color: '#aaddff', fontFamily: 'Arial' });
  }
}
