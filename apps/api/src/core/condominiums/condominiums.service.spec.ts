import { Test } from '@nestjs/testing';
import { CondominiumsService } from './condominiums.service';

describe('CondominiumsService', () => {
  let service: CondominiumsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CondominiumsService],
    }).compile();
    service = moduleRef.get(CondominiumsService);
  });

  it('findAll devuelve una lista vacía mientras no haya acceso a datos', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('findOne devuelve el id pedido', () => {
    expect(service.findOne(7)).toEqual({ id: 7 });
  });
});
