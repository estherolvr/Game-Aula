import Phaser from 'phaser';
import { JobSystem } from '../systems/JobSystem';
import { PC } from '../systems/PC';
import { DB_COMPONENTS } from '../systems/HardwareData';

export class OfficeScene extends Phaser.Scene {
  public jobSystem!: JobSystem;
  public activePC: PC | null = null;
  
  private moboSprite!: Phaser.GameObjects.Sprite;
  private cpuSprite!: Phaser.GameObjects.Sprite;
  private ramSprite!: Phaser.GameObjects.Sprite;
  private psuSprite!: Phaser.GameObjects.Sprite;

  constructor() {
    super('OfficeScene');
  }

  create() {
    this.jobSystem = new JobSystem();
    this.scene.launch('UIScene', { officeScene: this });

    // Table background
    this.add.rectangle(0, 500, 1280, 220, 0x5c4033).setOrigin(0);

    // Setup the PC slots visually
    this.setupPCBots();

    // Event listeners from UI
    this.events.on('accept_job', () => {
      if (this.jobSystem.activeJob) {
        this.loadPCFromJob();
      }
    });

    this.events.on('power_on_pc', () => {
      if (this.activePC) {
        const result = this.activePC.powerOn();
        this.events.emit('terminal_log', result.message, result.diagnostic);
        if (result.success && this.jobSystem.activeJob) {
          this.jobSystem.finishJob(true);
          this.activePC = null;
          this.updatePCVisuals();
          this.events.emit('terminal_log', 'Serviço concluído!', 'Pagamento recebido.');
        }
      } else {
        this.events.emit('terminal_log', 'Erro', 'Nenhum PC na bancada.');
      }
    });
  }

  private setupPCBots() {
    // Motherboard slot
    this.moboSprite = this.add.sprite(400, 300, 'mobo_sprite').setInteractive();
    // CPU slot (relative to mobo)
    this.cpuSprite = this.add.sprite(400, 260, 'cpu_sprite').setInteractive().setAlpha(0);
    // RAM slot
    this.ramSprite = this.add.sprite(460, 260, 'ram_sprite').setInteractive().setAlpha(0);
    // PSU slot
    this.psuSprite = this.add.sprite(200, 400, 'psu_sprite').setInteractive().setAlpha(0);

    // Click to remove
    this.cpuSprite.on('pointerdown', () => this.removePart('CPU'));
    this.ramSprite.on('pointerdown', () => this.removePart('RAM'));
    this.psuSprite.on('pointerdown', () => this.removePart('PSU'));
  }

  private loadPCFromJob() {
    const job = this.jobSystem.activeJob;
    if (!job) return;

    this.activePC = new PC();
    
    // Load base components from job
    Object.keys(job.basePC).forEach(type => {
      const compId = job.basePC[type];
      const dbComp = DB_COMPONENTS.find(c => c.id === compId);
      if (dbComp) {
        let compToInstall = JSON.parse(JSON.stringify(dbComp));
        // Break the component if it's the target
        if (job.brokenComponentType === type) {
          compToInstall.condition = 0;
        }
        this.activePC!.installComponent(compToInstall);
      }
    });

    this.updatePCVisuals();
  }

  private removePart(type: string) {
    if (!this.activePC) return;
    const removed = this.activePC.removeComponent(type);
    if (removed) {
      this.jobSystem.inventory.push(removed);
      this.updatePCVisuals();
      this.events.emit('inventory_updated');
    }
  }

  public installPart(inventoryIndex: number) {
    if (!this.activePC) return;
    const comp = this.jobSystem.inventory[inventoryIndex];
    if (comp) {
      // Check if slot is empty
      let current = null;
      switch (comp.type) {
        case 'CPU': current = this.activePC.cpu; break;
        case 'MOBO': current = this.activePC.mobo; break;
        case 'RAM': current = this.activePC.ram; break;
        case 'PSU': current = this.activePC.psu; break;
      }
      
      if (!current) {
        this.activePC.installComponent(comp);
        this.jobSystem.inventory.splice(inventoryIndex, 1);
        this.updatePCVisuals();
        this.events.emit('inventory_updated');
      } else {
        this.events.emit('terminal_log', 'Aviso', 'O slot já está ocupado.');
      }
    }
  }

  private updatePCVisuals() {
    if (!this.activePC) {
      this.moboSprite.setAlpha(0);
      this.cpuSprite.setAlpha(0);
      this.ramSprite.setAlpha(0);
      this.psuSprite.setAlpha(0);
      return;
    }

    this.moboSprite.setAlpha(this.activePC.mobo ? 1 : 0);
    this.cpuSprite.setAlpha(this.activePC.cpu ? 1 : 0);
    
    // Visual feedback for broken CPU
    if (this.activePC.cpu && this.activePC.cpu.condition <= 0) this.cpuSprite.setTint(0xff0000);
    else this.cpuSprite.clearTint();

    this.ramSprite.setAlpha(this.activePC.ram ? 1 : 0);
    if (this.activePC.ram && this.activePC.ram.condition <= 0) this.ramSprite.setTint(0xff0000);
    else this.ramSprite.clearTint();

    this.psuSprite.setAlpha(this.activePC.psu ? 1 : 0);
    if (this.activePC.psu && this.activePC.psu.condition <= 0) this.psuSprite.setTint(0xff0000);
    else this.psuSprite.clearTint();
  }
}
