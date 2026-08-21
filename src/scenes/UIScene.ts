import Phaser from 'phaser';
import { OfficeScene } from './OfficeScene';
import { DB_COMPONENTS } from '../systems/HardwareData';

export class UIScene extends Phaser.Scene {
  private office!: OfficeScene;
  
  private moneyText!: Phaser.GameObjects.Text;
  private repText!: Phaser.GameObjects.Text;
  private terminalText!: Phaser.GameObjects.Text;
  private invContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'UIScene', active: false });
  }

  init(data: { officeScene: OfficeScene }) {
    this.office = data.officeScene;
  }

  create() {
    // HUD Stats
    this.moneyText = this.add.text(20, 20, '$0', { fontSize: '24px', color: '#00ff00' });
    this.repText = this.add.text(20, 50, 'Rep: 0', { fontSize: '24px', color: '#ffff00' });

    // Terminal / Email panel
    this.add.rectangle(800, 0, 480, 720, 0x111111).setOrigin(0);
    this.terminalText = this.add.text(820, 20, 'OS ByteCraft v1.0\n\nNenhuma mensagem nova.', {
      fontSize: '16px', color: '#00ff00', wordWrap: { width: 440 }
    });

    // Buttons
    this.createButton(820, 400, 'Ler Email', () => this.readEmail());
    this.createButton(820, 450, 'Abrir Loja', () => this.openShop());
    this.createButton(820, 500, 'Ver Inventário', () => this.showInventory());
    
    // PC Controls
    this.createButton(400, 600, 'LIGAR PC', () => {
      this.office.events.emit('power_on_pc');
    });

    // Event listeners
    this.office.events.on('terminal_log', (msg: string, diag: string) => {
      this.terminalText.setText(`[SISTEMA]: ${msg}\n\n[DIAGNÓSTICO]: ${diag}`);
    });

    this.office.events.on('inventory_updated', () => {
      if (this.invContainer && this.invContainer.visible) {
        this.showInventory(); // refresh
      }
    });

    this.updateHUD();
    this.time.addEvent({
      delay: 500, loop: true,
      callback: () => this.updateHUD()
    });
  }

  private updateHUD() {
    this.moneyText.setText(`$${this.office.jobSystem.money}`);
    this.repText.setText(`Rep: ${this.office.jobSystem.reputation}`);
  }

  private createButton(x: number, y: number, text: string, callback: () => void) {
    const bg = this.add.rectangle(x, y, 200, 40, 0x333333).setOrigin(0).setInteractive();
    const txt = this.add.text(x + 10, y + 10, text, { fontSize: '18px', color: '#ffffff' });
    
    bg.on('pointerover', () => bg.setFillStyle(0x555555));
    bg.on('pointerout', () => bg.setFillStyle(0x333333));
    bg.on('pointerdown', callback);
  }

  private readEmail() {
    this.clearPanel();
    const job = this.office.jobSystem.availableJobs[0];
    if (job) {
      this.terminalText.setText(`DE: ${job.clientName}\n\n${job.description}\n\nOrçamento: $${job.budget}\nRecompensa: $${job.reward}`);
      this.createButton(820, 300, 'ACEITAR SERVIÇO', () => {
        this.office.jobSystem.acceptJob(job.id);
        this.office.events.emit('accept_job');
        this.terminalText.setText('Serviço aceito. O PC está na bancada.');
        this.clearTempButtons();
      });
    } else {
      this.terminalText.setText('Nenhum email novo.');
    }
  }

  private openShop() {
    this.clearPanel();
    this.terminalText.setText('LOJA HARDWARE');
    
    let yPos = 100;
    DB_COMPONENTS.forEach((comp) => {
      if (yPos > 600) return; // simple limit
      this.add.text(820, yPos, `${comp.name} - $${comp.price}`, { fontSize: '14px', color: '#fff' }).setName('temp_ui');
      const buyBtn = this.add.text(1150, yPos, '[COMPRAR]', { fontSize: '14px', color: '#00ff00' }).setInteractive().setName('temp_ui');
      buyBtn.on('pointerdown', () => {
        if (this.office.jobSystem.money >= comp.price) {
          this.office.jobSystem.buyPart(comp.id);
          this.office.events.emit('terminal_log', 'Compra aprovada', `Item ${comp.name} enviado para inventário.`);
        } else {
          this.office.events.emit('terminal_log', 'Erro', 'Saldo insuficiente.');
        }
      });
      yPos += 30;
    });
  }

  private showInventory() {
    this.clearPanel();
    this.terminalText.setText('SEU INVENTÁRIO (Clique para instalar)');
    
    let yPos = 100;
    this.office.jobSystem.inventory.forEach((comp, index) => {
      if (yPos > 600) return;
      const condition = comp.condition > 0 ? 'Bom' : 'Quebrado';
      const color = comp.condition > 0 ? '#fff' : '#ff0000';
      
      const txt = this.add.text(820, yPos, `${comp.type} ${comp.name} [${condition}]`, { fontSize: '14px', color }).setInteractive().setName('temp_ui');
      
      txt.on('pointerdown', () => {
        this.office.installPart(index);
      });
      yPos += 30;
    });
  }

  private clearPanel() {
    this.terminalText.setText('');
    this.clearTempButtons();
  }

  private clearTempButtons() {
    this.children.getChildren().forEach(child => {
      if (child.name === 'temp_ui') {
        child.destroy();
      }
    });
  }
}
