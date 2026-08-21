import Phaser from 'phaser';

export class TutorialScene extends Phaser.Scene {
  constructor() {
    super('TutorialScene');
  }

  create() {
    const { width, height } = this.scale;
    
    this.add.rectangle(0, 0, width, height, 0x2d3436).setOrigin(0);

    this.add.text(40, 40, 'COMO JOGAR', { fontSize: '32px', color: '#0fb9b1', fontStyle: 'bold', fontFamily: 'Arial' });

    const steps = [
      { title: '1. Receba um PC', desc: 'Leia o email do cliente e entenda o problema. Aceite o serviço para receber o computador na bancada.' },
      { title: '2. Diagnostique', desc: 'Ligue o PC quebrado e leia a mensagem de erro do sistema (Ex: "3 Beeps = Sem RAM").' },
      { title: '3. Compre Peças', desc: 'Abra a LOJA e compre peças compatíveis (Ex: MOBO LGA-1 precisa de CPU LGA-1).' },
      { title: '4. Monte o PC', desc: 'Clique nas peças quebradas para remover. Vá ao inventário e instale as novas peças.' },
      { title: '5. Teste e Entregue', desc: 'Ligue o PC. Se estiver saudável, a tela de resultados aparecerá e você lucrará!' }
    ];

    let startY = 120;
    steps.forEach((step, index) => {
      this.add.text(40, startY, step.title, { fontSize: '24px', color: '#feca57', fontStyle: 'bold', fontFamily: 'Arial' });
      this.add.text(40, startY + 35, step.desc, { fontSize: '18px', color: '#dfe6e9', wordWrap: { width: 1000 }, fontFamily: 'Arial' });
      startY += 100;
    });

    // Back Button
    const btn = this.add.rectangle(150, height - 80, 200, 50, 0xd63031).setInteractive();
    this.add.text(150, height - 80, 'VOLTAR', { fontSize: '20px', color: '#fff', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);

    btn.on('pointerdown', () => {
      this.scene.start('MainMenu');
    });
  }
}
