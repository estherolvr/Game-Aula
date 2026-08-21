import Phaser from 'phaser';

export class TutorialManager {
  private static instance: TutorialManager;
  public step: number = 0;
  public isFirstTime: boolean = true;
  private currentTooltip: Phaser.GameObjects.Container | null = null;
  private scene: Phaser.Scene | null = null;

  private constructor() {}

  public static getInstance(): TutorialManager {
    if (!TutorialManager.instance) {
      TutorialManager.instance = new TutorialManager();
    }
    return TutorialManager.instance;
  }

  public setScene(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public showTooltip(x: number, y: number, text: string) {
    if (!this.scene || !this.isFirstTime) return;
    this.clearTooltip();

    this.currentTooltip = this.scene.add.container(x, y).setDepth(9999);
    const bg = this.scene.add.rectangle(0, 0, 300, 60, 0x0fb9b1).setOrigin(0.5);
    const txt = this.scene.add.text(0, 0, text, { fontSize: '16px', color: '#1e272e', fontStyle: 'bold', fontFamily: 'Arial', wordWrap: { width: 280 } }).setOrigin(0.5);
    
    this.currentTooltip.add([bg, txt]);

    // Bounce animation
    this.scene.tweens.add({
      targets: this.currentTooltip,
      y: y - 10,
      yoyo: true,
      repeat: -1,
      duration: 500,
      ease: 'Sine.easeInOut'
    });
  }

  public clearTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.destroy();
      this.currentTooltip = null;
    }
  }

  public advance(triggerEvent: string) {
    if (!this.isFirstTime) return;

    if (this.step === 0 && triggerEvent === 'start') {
      this.step = 1;
      this.showTooltip(900, 100, 'Temos um cliente! Clique em ACEITAR SERVIÇO na aba Email.');
    } else if (this.step === 1 && triggerEvent === 'accept_job') {
      this.step = 2;
      this.showTooltip(400, 650, 'A Fonte está quebrada (vermelha). Clique nela para remover.');
    } else if (this.step === 2 && triggerEvent === 'remove_part') {
      this.step = 3;
      this.showTooltip(1050, 100, 'Agora abra a LOJA e compre a peça "400W Basic".');
    } else if (this.step === 3 && triggerEvent === 'buy_part') {
      this.step = 4;
      this.showTooltip(1200, 100, 'Ótimo! Vá ao INVENTÁRIO e clique em INSTALAR.');
    } else if (this.step === 4 && triggerEvent === 'install_part') {
      this.step = 5;
      this.showTooltip(1040, 600, 'Tudo pronto! Clique em LIGAR PC para testar.');
    } else if (this.step === 5 && triggerEvent === 'power_on_success') {
      this.clearTooltip();
      this.isFirstTime = false; // Tutorial done
    }
  }
}
