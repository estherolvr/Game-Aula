export type ComponentType = 'CPU' | 'MOBO' | 'RAM' | 'PSU' | 'GPU';
export type SocketType = 'LGA-1' | 'AM-1';
export type RAMType = 'DDR4' | 'DDR5';

export interface PCComponent {
  id: string;
  name: string;
  brand: string;
  type: ComponentType;
  price: number;
  condition: number; // 0 to 100
  powerDraw: number; // Watts
}

export interface CPU extends PCComponent {
  type: 'CPU';
  socket: SocketType;
  baseClock: number;
}

export interface MOBO extends PCComponent {
  type: 'MOBO';
  socket: SocketType;
  ramType: RAMType;
}

export interface RAM extends PCComponent {
  type: 'RAM';
  ramType: RAMType;
  capacity: number; // GB
}

export interface PSU extends PCComponent {
  type: 'PSU';
  maxPower: number; // Watts
}

export interface GPU extends PCComponent {
  type: 'GPU';
}

export const DB_COMPONENTS: PCComponent[] = [
  // CPUs
  { id: 'cpu_1', name: 'Core i3 9th', brand: 'Voltix', type: 'CPU', price: 100, condition: 100, powerDraw: 65, socket: 'LGA-1', baseClock: 3.6 } as CPU,
  { id: 'cpu_2', name: 'Ryzen 5', brand: 'NexCore', type: 'CPU', price: 200, condition: 100, powerDraw: 95, socket: 'AM-1', baseClock: 4.2 } as CPU,
  // MOBOs
  { id: 'mobo_1', name: 'H310M', brand: 'TitanForge', type: 'MOBO', price: 80, condition: 100, powerDraw: 30, socket: 'LGA-1', ramType: 'DDR4' } as MOBO,
  { id: 'mobo_2', name: 'B450M', brand: 'TitanForge', type: 'MOBO', price: 120, condition: 100, powerDraw: 40, socket: 'AM-1', ramType: 'DDR4' } as MOBO,
  // RAMs
  { id: 'ram_1', name: '8GB DDR4 2400', brand: 'Voltix', type: 'RAM', price: 40, condition: 100, powerDraw: 5, ramType: 'DDR4', capacity: 8 } as RAM,
  { id: 'ram_2', name: '16GB DDR4 3200', brand: 'NexCore', type: 'RAM', price: 80, condition: 100, powerDraw: 8, ramType: 'DDR4', capacity: 16 } as RAM,
  // PSUs
  { id: 'psu_1', name: '400W Basic', brand: 'Voltix', type: 'PSU', price: 40, condition: 100, powerDraw: 0, maxPower: 400 } as PSU,
  { id: 'psu_2', name: '600W Gold', brand: 'TitanForge', type: 'PSU', price: 90, condition: 100, powerDraw: 0, maxPower: 600 } as PSU,
  // GPUs
  { id: 'gpu_1', name: 'GTX 1050', brand: 'PixelByte', type: 'GPU', price: 150, condition: 100, powerDraw: 75 } as GPU,
  { id: 'gpu_2', name: 'RTX 3060', brand: 'PixelByte', type: 'GPU', price: 350, condition: 100, powerDraw: 170 } as GPU,
];
