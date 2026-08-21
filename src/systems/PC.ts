import { PCComponent, CPU, MOBO, RAM, PSU, GPU } from './HardwareData';

export class PC {
  cpu: CPU | null = null;
  mobo: MOBO | null = null;
  ram: RAM | null = null;
  psu: PSU | null = null;
  gpu: GPU | null = null;

  powerOn(): { success: boolean; message: string; diagnostic: string } {
    if (!this.psu) return { success: false, message: 'Nenhum sinal de energia.', diagnostic: 'Fonte (PSU) não instalada.' };
    if (!this.mobo) return { success: false, message: 'Nenhum sinal.', diagnostic: 'Placa-mãe não instalada.' };
    
    // Check compatibility
    if (this.cpu && this.cpu.socket !== this.mobo.socket) {
      return { success: false, message: 'Erro de Encaixe.', diagnostic: `O Socket do processador (${this.cpu.socket}) não é suportado pela placa-mãe (${this.mobo.socket}).` };
    }
    
    if (this.ram && this.ram.ramType !== this.mobo.ramType) {
      return { success: false, message: '3 Bipes Longos.', diagnostic: `Memória RAM (${this.ram.ramType}) incompatível com a placa-mãe (${this.mobo.ramType}).` };
    }

    if (!this.cpu) return { success: false, message: 'Liga, Tela Preta.', diagnostic: 'Processador (CPU) ausente.' };
    if (!this.ram) return { success: false, message: '3 Bipes Curtos.', diagnostic: 'Memória RAM ausente.' };

    // Check broken parts
    if (this.psu.condition <= 0) return { success: false, message: 'Não Liga.', diagnostic: 'Fonte de alimentação queimada ou em curto.' };
    if (this.mobo.condition <= 0) return { success: false, message: 'Não Liga (Curto).', diagnostic: 'Placa-mãe danificada.' };
    if (this.cpu.condition <= 0) return { success: false, message: 'Tela Azul (BSOD).', diagnostic: 'Processador (CPU) falhou no teste de estresse.' };
    if (this.ram.condition <= 0) return { success: false, message: 'Tela Azul (Memory Management).', diagnostic: 'Módulo de memória (RAM) corrompido.' };
    if (this.gpu && this.gpu.condition <= 0) return { success: false, message: 'Artefatos na Tela.', diagnostic: 'Processador gráfico (GPU) danificado.' };

    // Check power capacity
    let totalDraw = (this.cpu?.powerDraw || 0) + (this.mobo?.powerDraw || 0) + (this.ram?.powerDraw || 0) + (this.gpu?.powerDraw || 0);
    if (totalDraw > this.psu.maxPower) {
      return { success: false, message: 'Crash instantâneo sob carga.', diagnostic: `A fonte (${this.psu.maxPower}W) não suporta o consumo do sistema (${totalDraw}W).` };
    }

    return { success: true, message: 'SISTEMA INICIADO.', diagnostic: 'Todos os testes de diagnóstico passaram. O computador está saudável.' };
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
