import Phaser from 'phaser';
import { OfficeScene } from './OfficeScene';
import { DB_COMPONENTS } from '../systems/HardwareData';
import { TutorialManager } from '../systems/TutorialManager';

export class UIScene extends Phaser.Scene {
  private office!: OfficeScene;
  
  private moneyText!: Phaser.GameObjects.Text;
  private repText!: Phaser.GameObjects.Text;
  
  // Tabs
  private currentTab: 'EMAIL' | 'SHOP' | 'INVENTORY' = 'EMAIL';
  private panelContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'UIScene', active: false });
  }

  init(data: { officeScene: OfficeScene }) {
    this.office = data.officeScene;
  }

  create() {
    const { width, height } = this.scale;

    TutorialManager.getInstance().setScene(this);

    // Top Bar (Status)
    this.add.rectangle(0, 0, width, 50, 0x1e272e).setOrigin(0);
    this.add.text(20, 15, 'BYTECRAFT OFICINA', { fontSize: '20px', color: '#0fb9b1', fontFamily: 'Arial', fontStyle: 'bold' });
    this.moneyText = this.add.text(width - 300, 15, 'SALDO: $500', { fontSize: '20px', color: '#0be881', fontFamily: 'Arial', fontStyle: 'bold' });
    this.repText = this.add.text(width - 120, 15, 'REP: 50', { fontSize: '20px', color: '#ffd32a', fontFamily: 'Arial', fontStyle: 'bold' });

    // Right Panel Background
    this.add.rectangle(800, 50, 480, 670, 0x2f3640).setOrigin(0);
    
    // Tabs Header
    this.createTabButton(800, 50, 'EMAIL', () => this.switchTab('EMAIL'));
    this.createTabButton(960, 50, 'LOJA', () => this.switchTab('SHOP'));
    this.createTabButton(1120, 50, 'INVENTÁRIO', () => this.switchTab('INVENTORY'));

    this.panelContainer = this.add.container(800, 100);

    // PC Controls on the bottom right
    const pcControls = this.add.rectangle(800, height - 80, 480, 80, 0x1e272e).setOrigin(0);
    const bootBtn = this.add.rectangle(1040, height - 40, 200, 50, 0x0be881).setInteractive();
    this.add.text(1040, height - 40, 'LIGAR PC', { fontSize: '20px', color: '#1e272e', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);
    
    bootBtn.on('pointerover', () => bootBtn.setFillStyle(0x05c46b));
    bootBtn.on('pointerout', () => bootBtn.setFillStyle(0x0be881));
    bootBtn.on('pointerdown', () => this.office.events.emit('power_on_pc'));

    // Events
    this.office.events.on('inventory_updated', () => {
      if (this.currentTab === 'INVENTORY') this.renderInventory();
    });

    this.office.events.on('toast', (msg: string, color: string) => this.showToast(msg, color));

    this.time.addEvent({ delay: 500, loop: true, callback: () => this.updateHUD() });

    // Initial render
    this.switchTab('EMAIL');

    // Start tutorial
    TutorialManager.getInstance().advance('start');
  }

  private updateHUD() {
    this.moneyText.setText(`SALDO: $${this.office.jobSystem.money}`);
    this.repText.setText(`REP: ${this.office.jobSystem.reputation}`);
  }

  private createTabButton(x: number, y: number, text: string, callback: () => void) {
    const bg = this.add.rectangle(x, y, 160, 50, 0x353b48).setOrigin(0).setInteractive();
    const txt = this.add.text(x + 80, y + 25, text, { fontSize: '16px', color: '#d2dae2', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5);
    
    bg.on('pointerover', () => bg.setFillStyle(0x718093));
    bg.on('pointerout', () => bg.setFillStyle(0x353b48));
    bg.on('pointerdown', callback);
  }

  private switchTab(tab: 'EMAIL' | 'SHOP' | 'INVENTORY') {
    this.currentTab = tab;
    this.panelContainer.removeAll(true);

    if (tab === 'EMAIL') this.renderEmail();
    else if (tab === 'SHOP') this.renderShop();
    else if (tab === 'INVENTORY') this.renderInventory();
  }

  private renderEmail() {
    const job = this.office.jobSystem.availableJobs[0];
    if (!job) {
      this.panelContainer.add(this.add.text(20, 20, 'Sua caixa de entrada está vazia.', { fontSize: '18px', color: '#d2dae2', fontFamily: 'Arial' }));
      return;
    }

    const title = this.add.text(20, 20, `DE: ${job.clientName}`, { fontSize: '22px', color: '#0fb9b1', fontStyle: 'bold', fontFamily: 'Arial' });
    const desc = this.add.text(20, 60, job.description, { fontSize: '16px', color: '#d2dae2', wordWrap: { width: 440 }, fontFamily: 'Arial' });
    
    const budget = this.add.text(20, 200, `Orçamento: $${job.budget}`, { fontSize: '18px', color: '#ffd32a', fontStyle: 'bold', fontFamily: 'Arial' });
    const reward = this.add.text(20, 230, `Mão de Obra: $${job.reward}`, { fontSize: '18px', color: '#0be881', fontStyle: 'bold', fontFamily: 'Arial' });

    const acceptBg = this.add.rectangle(240, 320, 200, 50, 0x0fb9b1).setInteractive();
    const acceptTxt = this.add.text(240, 320, 'ACEITAR SERVIÇO', { fontSize: '18px', color: '#1e272e', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);

    acceptBg.on('pointerdown', () => {
      this.office.jobSystem.acceptJob(job.id);
      this.office.events.emit('accept_job');
      this.showToast('Serviço Aceito! PC na bancada.', '#0fb9b1');
      this.switchTab('EMAIL');
    });

    this.panelContainer.add([title, desc, budget, reward, acceptBg, acceptTxt]);
  }

  private renderShop() {
    let yPos = 20;
    DB_COMPONENTS.forEach((comp) => {
      // Card Background
      const card = this.add.rectangle(20, yPos, 440, 80, 0x1e272e).setOrigin(0);
      const name = this.add.text(35, yPos + 15, `${comp.type} - ${comp.name}`, { fontSize: '18px', color: '#0fb9b1', fontStyle: 'bold', fontFamily: 'Arial' });
      const specs = this.add.text(35, yPos + 40, `${comp.brand} | Consumo: ${comp.powerDraw}W`, { fontSize: '14px', color: '#808e9b', fontFamily: 'Arial' });
      const price = this.add.text(320, yPos + 30, `$${comp.price}`, { fontSize: '20px', color: '#0be881', fontStyle: 'bold', fontFamily: 'Arial' });
      
      const buyBtn = this.add.rectangle(410, yPos + 40, 60, 40, 0x3867d6).setInteractive();
      const buyTxt = this.add.text(410, yPos + 40, 'COMPRAR', { fontSize: '12px', color: '#fff', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);

      buyBtn.on('pointerdown', () => {
        if (this.office.jobSystem.money >= comp.price) {
          this.office.jobSystem.buyPart(comp.id);
          this.showToast(`${comp.name} comprado!`, '#0be881');
          TutorialManager.getInstance().advance('buy_part');
        } else {
          this.showToast('Saldo insuficiente.', '#ff3f34');
        }
      });

      this.panelContainer.add([card, name, specs, price, buyBtn, buyTxt]);
      yPos += 95;
    });
  }

  private renderInventory() {
    if (this.office.jobSystem.inventory.length === 0) {
      this.panelContainer.add(this.add.text(20, 20, 'Seu inventário está vazio.', { fontSize: '18px', color: '#d2dae2', fontFamily: 'Arial' }));
      return;
    }

    let yPos = 20;
    this.office.jobSystem.inventory.forEach((comp, index) => {
      const isBroken = comp.condition <= 0;
      const cardColor = isBroken ? 0x4a1c1c : 0x1e272e;
      
      const card = this.add.rectangle(20, yPos, 440, 60, cardColor).setOrigin(0);
      const name = this.add.text(35, yPos + 10, `${comp.type} - ${comp.name}`, { fontSize: '16px', color: isBroken ? '#ff3f34' : '#0fb9b1', fontStyle: 'bold', fontFamily: 'Arial' });
      const status = this.add.text(35, yPos + 30, isBroken ? 'ESTADO: QUEBRADO' : 'ESTADO: BOM', { fontSize: '14px', color: '#d2dae2', fontFamily: 'Arial' });
      
      const installBtn = this.add.rectangle(380, yPos + 30, 100, 30, 0x0fb9b1).setInteractive();
      const installTxt = this.add.text(380, yPos + 30, 'INSTALAR', { fontSize: '14px', color: '#1e272e', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);

      installBtn.on('pointerdown', () => {
        this.office.installPart(index);
      });

      this.panelContainer.add([card, name, status, installBtn, installTxt]);
      yPos += 75;
    });
  }

  private showToast(msg: string, color: string) {
    const toastBg = this.add.rectangle(640, 60, 400, 40, Phaser.Display.Color.HexStringToColor(color).color).setOrigin(0.5);
    const toastTxt = this.add.text(640, 60, msg, { fontSize: '16px', color: '#fff', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);
    
    this.tweens.add({
      targets: [toastBg, toastTxt],
      y: 40,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        toastBg.destroy();
        toastTxt.destroy();
      }
    });
  }
}
