import { Test, TestingModule } from '@nestjs/testing';
import { AzureQueueService } from './azure-queue.service';

describe('AzureQueueService', () => {
  let service: AzureQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AzureQueueService],
    }).compile();

    service = module.get<AzureQueueService>(AzureQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
