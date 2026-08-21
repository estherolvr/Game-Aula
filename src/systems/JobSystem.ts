import { DB_COMPONENTS, PCComponent } from './HardwareData';

export interface Job {
  id: string;
  clientName: string;
  description: string;
  budget: number;
  reward: number;
  brokenComponentType: string;
  basePC: { [key: string]: string }; // id of components
}

export class JobSystem {
  public money: number = 500;
  public reputation: number = 50; // 0 to 100
  public activeJob: Job | null = null;
  public inventory: PCComponent[] = [];
  
  public availableJobs: Job[] = [
    {
      id: 'job_1',
      clientName: 'Dona Benta',
      description: 'Meu computador parou de ligar após uma queda de luz. Acho que a Fonte de Alimentação (PSU) estourou. Pode trocar por uma igual ou melhor?',
      budget: 60,
      reward: 150,
      brokenComponentType: 'PSU',
      basePC: {
        'MOBO': 'mobo_1',
        'CPU': 'cpu_1',
        'RAM': 'ram_1',
        'PSU': 'psu_1'
      }
    }
  ];

  acceptJob(jobId: string) {
    const job = this.availableJobs.find(j => j.id === jobId);
    if (job) {
      this.activeJob = job;
      this.availableJobs = this.availableJobs.filter(j => j.id !== jobId);
    }
  }

  buyPart(compId: string) {
    const comp = DB_COMPONENTS.find(c => c.id === compId);
    if (comp && this.money >= comp.price) {
      this.money -= comp.price;
      // Copy component
      this.inventory.push(JSON.parse(JSON.stringify(comp)));
    }
  }

  finishJob(success: boolean) {
    if (this.activeJob) {
      if (success) {
        this.money += this.activeJob.reward;
        this.reputation += 10;
      } else {
        this.reputation -= 10;
      }
      this.activeJob = null;
    }
  }
}
