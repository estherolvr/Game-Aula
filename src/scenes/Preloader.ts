import Phaser from 'phaser';

export class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Generate beautiful clean flat vector-like graphics for the components
  }

  create() {
    this.createMoboTexture();
    this.createCPUTesture();
    this.createRAMTexture();
    this.createPSUTexture();
    this.scene.start('MainMenu');
  }

  private createMoboTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x2f3542); // Dark base
    g.fillRoundedRect(0, 0, 160, 200, 8);
    g.lineStyle(2, 0x0fb9b1);
    g.strokeRoundedRect(0, 0, 160, 200, 8);

    // CPU Socket
    g.fillStyle(0x747d8c);
    g.fillRect(50, 20, 60, 60);
    g.lineStyle(1, 0xffd32a);
    g.strokeRect(50, 20, 60, 60);

    // RAM Slots
    g.fillStyle(0x57606f);
    g.fillRect(120, 20, 10, 80);
    g.fillRect(135, 20, 10, 80);

    // PCIe Slot (GPU)
    g.fillStyle(0xeccc68);
    g.fillRect(20, 120, 120, 15);

    g.generateTexture('mobo_sprite', 160, 200);
    g.destroy();
  }

  private createCPUTesture() {
    const g = this.add.graphics();
    g.fillStyle(0x2f3542);
    g.fillRect(0, 0, 40, 40);
    
    g.fillStyle(0xdfe4ea);
    g.fillRect(4, 4, 32, 32);

    g.fillStyle(0xced6e0);
    g.fillCircle(20, 20, 8);

    g.generateTexture('cpu_sprite', 40, 40);
    g.destroy();
  }

  private createRAMTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x2ed573); // Green PCB
    g.fillRect(0, 0, 10, 60);
    
    g.fillStyle(0x1e272e); // Black chips
    g.fillRect(2, 5, 6, 10);
    g.fillRect(2, 20, 6, 10);
    g.fillRect(2, 35, 6, 10);
    
    g.fillStyle(0xeccc68); // Gold pins
    g.fillRect(0, 50, 10, 10);

    g.generateTexture('ram_sprite', 10, 60);
    g.destroy();
  }

  private createPSUTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x2f3542);
    g.fillRect(0, 0, 80, 80);

    // Fan circle
    g.fillStyle(0x1e272e);
    g.fillCircle(40, 40, 30);
    
    // Fan grill
    g.lineStyle(2, 0x747d8c);
    g.strokeCircle(40, 40, 25);
    
    // Cables coming out
    g.fillStyle(0xff4757);
    g.fillRect(70, 10, 20, 5);
    g.fillStyle(0x2ed573);
    g.fillRect(70, 20, 20, 5);
    g.fillStyle(0x1e272e);
    g.fillRect(70, 30, 20, 5);

    g.generateTexture('psu_sprite', 90, 80);
    g.destroy();
  }
}
