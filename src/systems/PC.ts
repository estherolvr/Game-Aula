import { PCComponent, CPU, MOBO, RAM, PSU, GPU } from './HardwareData';

export class PC {
  cpu: CPU | null = null;
  mobo: MOBO | null = null;
  ram: RAM | null = null;
  psu: PSU | null = null;
  gpu: GPU | null = null;

  powerOn(): { success: boolean; message: string; diagnostic: string } {
    if (!this.psu) return { success: false, message: 'Não liga', diagnostic: 'Sem fonte de alimentação.' };
    if (!this.mobo) return { success: false, message: 'Não liga', diagnostic: 'Sem placa-mãe.' };
    
    // Check compatibility
    if (this.cpu && this.cpu.socket !== this.mobo.socket) {
      return { success: false, message: 'Liga, tela preta', diagnostic: `CPU socket ${this.cpu.socket} incompatível com MOBO socket ${this.mobo.socket}.` };
    }
    
    if (this.ram && this.ram.ramType !== this.mobo.ramType) {
      return { success: false, message: 'Beeps contínuos', diagnostic: `RAM ${this.ram.ramType} incompatível com MOBO ${this.mobo.ramType}.` };
    }

    if (!this.cpu) return { success: false, message: 'Liga, tela preta', diagnostic: 'Sem processador.' };
    if (!this.ram) return { success: false, message: '3 Beeps curtos', diagnostic: 'Sem memória RAM.' };

    // Check broken parts
    if (this.psu.condition <= 0) return { success: false, message: 'Não liga', diagnostic: 'Fonte queimada.' };
    if (this.mobo.condition <= 0) return { success: false, message: 'Não liga', diagnostic: 'Placa-mãe em curto.' };
    if (this.cpu.condition <= 0) return { success: false, message: 'Tela Azul', diagnostic: 'CPU com defeito.' };
    if (this.ram.condition <= 0) return { success: false, message: 'Tela Azul (Memory Management)', diagnostic: 'RAM corrompida.' };
    if (this.gpu && this.gpu.condition <= 0) return { success: false, message: 'Artefatos na tela', diagnostic: 'GPU com artefatos de vídeo.' };

    // Check power capacity
    let totalDraw = (this.cpu?.powerDraw || 0) + (this.mobo?.powerDraw || 0) + (this.ram?.powerDraw || 0) + (this.gpu?.powerDraw || 0);
    if (totalDraw > this.psu.maxPower) {
      return { success: false, message: 'Desliga sozinho sob estresse', diagnostic: `Fonte (${this.psu.maxPower}W) não suporta carga (${totalDraw}W).` };
    }

    return { success: true, message: 'Boot com Sucesso! OS carregado.', diagnostic: 'Computador está saudável.' };
  }

  installComponent(comp: PCComponent): boolean {
    switch (comp.type) {
      case 'CPU': this.cpu = comp as CPU; return true;
      case 'MOBO': this.mobo = comp as MOBO; return true;
      case 'RAM': this.ram = comp as RAM; return true;
      case 'PSU': this.psu = comp as PSU; return true;
      case 'GPU': this.gpu = comp as GPU; return true;
    }
    return false;
  }

  removeComponent(type: string): PCComponent | null {
    let removed = null;
    switch (type) {
      case 'CPU': removed = this.cpu; this.cpu = null; break;
      case 'MOBO': removed = this.mobo; this.mobo = null; break;
      case 'RAM': removed = this.ram; this.ram = null; break;
      case 'PSU': removed = this.psu; this.psu = null; break;
      case 'GPU': removed = this.gpu; this.gpu = null; break;
    }
    return removed;
  }
}
