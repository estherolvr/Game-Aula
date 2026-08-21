import Phaser from 'phaser';
import { JobSystem } from '../systems/JobSystem';
import { PC } from '../systems/PC';
import { DB_COMPONENTS } from '../systems/HardwareData';
import { TutorialManager } from '../systems/TutorialManager';

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

    // Table background (wood color)
    this.add.rectangle(0, 0, 800, 720, 0x3d2b1f).setOrigin(0);
    this.add.rectangle(100, 100, 600, 520, 0x222222).setOrigin(0); // PC Case mat

    this.setupPCBots();

    this.events.on('accept_job', () => {
      if (this.jobSystem.activeJob) {
        this.loadPCFromJob();
        TutorialManager.getInstance().advance('accept_job');
      }
    });

    this.events.on('power_on_pc', () => {
      if (this.activePC) {
        const result = this.activePC.powerOn();
        if (result.success && this.jobSystem.activeJob) {
          this.showResultScreen(result.message);
          TutorialManager.getInstance().advance('power_on_success');
        } else {
          this.events.emit('toast', `${result.message} - ${result.diagnostic}`, '#e84118');
        }
      } else {
        this.events.emit('toast', 'Nenhum computador na bancada.', '#e84118');
      }
    });
  }

  private setupPCBots() {
    this.moboSprite = this.add.sprite(400, 360, 'mobo_sprite').setInteractive();
    // relative to mobo center
    this.cpuSprite = this.add.sprite(380, 310, 'cpu_sprite').setInteractive().setAlpha(0);
    this.ramSprite = this.add.sprite(455, 310, 'ram_sprite').setInteractive().setAlpha(0);
    
    // PSU on the bottom left
    this.psuSprite = this.add.sprite(200, 500, 'psu_sprite').setInteractive().setAlpha(0);

    this.cpuSprite.on('pointerdown', () => this.removePart('CPU'));
    this.ramSprite.on('pointerdown', () => this.removePart('RAM'));
    this.psuSprite.on('pointerdown', () => this.removePart('PSU'));
  }

  private loadPCFromJob() {
    const job = this.jobSystem.activeJob;
    if (!job) return;

    this.activePC = new PC();
    
    Object.keys(job.basePC).forEach(type => {
      const compId = job.basePC[type];
      const dbComp = DB_COMPONENTS.find(c => c.id === compId);
      if (dbComp) {
        let compToInstall = JSON.parse(JSON.stringify(dbComp));
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
      this.events.emit('toast', `Peça removida: ${removed.name}`, '#fbc531');
      TutorialManager.getInstance().advance('remove_part');
    }
  }

  public installPart(inventoryIndex: number) {
    if (!this.activePC) return;
    const comp = this.jobSystem.inventory[inventoryIndex];
    if (comp) {
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
        this.events.emit('toast', `Peça instalada: ${comp.name}`, '#4cd137');
        TutorialManager.getInstance().advance('install_part');
      } else {
        this.events.emit('toast', 'O slot já está ocupado. Remova a peça antiga primeiro.', '#e84118');
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
    if (this.activePC.cpu && this.activePC.cpu.condition <= 0) this.cpuSprite.setTint(0xff4757);
    else this.cpuSprite.clearTint();

    this.ramSprite.setAlpha(this.activePC.ram ? 1 : 0);
    if (this.activePC.ram && this.activePC.ram.condition <= 0) this.ramSprite.setTint(0xff4757);
    else this.ramSprite.clearTint();

    this.psuSprite.setAlpha(this.activePC.psu ? 1 : 0);
    if (this.activePC.psu && this.activePC.psu.condition <= 0) this.psuSprite.setTint(0xff4757);
    else this.psuSprite.clearTint();
  }

  private showResultScreen(msg: string) {
    const job = this.jobSystem.activeJob!;
    
    // Dim background
    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setOrigin(0);
    
    // Receipt panel
    const panel = this.add.rectangle(640, 360, 400, 400, 0x2f3640).setOrigin(0.5);
    
    const title = this.add.text(640, 200, 'TRABALHO CONCLUÍDO!', { fontSize: '28px', color: '#0fb9b1', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);
    
    const repTxt = this.add.text(640, 250, `Recompensa: +$${job.reward}\nReputação: +10`, { fontSize: '20px', color: '#d2dae2', align: 'center', fontFamily: 'Arial' }).setOrigin(0.5);
    
    const finishBtn = this.add.rectangle(640, 450, 250, 60, 0x0be881).setInteractive();
    const btnTxt = this.add.text(640, 450, 'ENTREGAR COMPUTADOR', { fontSize: '16px', color: '#1e272e', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);

    finishBtn.on('pointerdown', () => {
      this.jobSystem.finishJob(true);
      this.activePC = null;
      this.updatePCVisuals();
      
      overlay.destroy();
      panel.destroy();
      title.destroy();
      repTxt.destroy();
      finishBtn.destroy();
      btnTxt.destroy();
    });
  }
}
