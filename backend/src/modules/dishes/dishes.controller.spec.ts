import { Test, TestingModule } from '@nestjs/testing';
import { DishesController } from './dishes.controller';
import { DishesService } from './dishes.service';

describe('DishesController', () => {
  let controller: DishesController;
  let dishesService: jest.Mocked<DishesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DishesController],
      providers: [
        {
          provide: DishesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DishesController>(DishesController);
    dishesService = module.get(DishesService);
  });

  it('findAll returns only available dishes by default', async () => {
    dishesService.findAll.mockResolvedValue([{ _id: 'd1', isAvailable: true }] as any);

    const result = await controller.findAll();

    expect(dishesService.findAll).toHaveBeenCalledWith(true);
    expect(result).toEqual([{ _id: 'd1', isAvailable: true }]);
  });

  it('findAll returns all dishes when all=true', async () => {
    dishesService.findAll.mockResolvedValue([{ _id: 'd1' }, { _id: 'd2' }] as any);

    const result = await controller.findAll('true');

    expect(dishesService.findAll).toHaveBeenCalledWith(false);
    expect(result).toEqual([{ _id: 'd1' }, { _id: 'd2' }]);
  });

  it('findOne delegates to DishesService', async () => {
    dishesService.findOne.mockResolvedValue({ _id: 'd1' } as any);

    const result = await controller.findOne('d1');

    expect(dishesService.findOne).toHaveBeenCalledWith('d1');
    expect(result).toEqual({ _id: 'd1' });
  });

  it('create delegates to DishesService', async () => {
    const dto = { name: 'Bún bò', price: 55000 };
    dishesService.create.mockResolvedValue({ _id: 'd1', ...dto } as any);

    const result = await controller.create(dto as any);

    expect(dishesService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ _id: 'd1', ...dto });
  });

  it('update delegates to DishesService', async () => {
    const dto = { name: 'Bún bò Huế', price: 60000 };
    dishesService.update.mockResolvedValue({ _id: 'd1', ...dto } as any);

    const result = await controller.update('d1', dto as any);

    expect(dishesService.update).toHaveBeenCalledWith('d1', dto);
    expect(result).toEqual({ _id: 'd1', ...dto });
  });

  it('remove delegates to DishesService', async () => {
    dishesService.remove.mockResolvedValue({ _id: 'd1', isAvailable: false } as any);

    const result = await controller.remove('d1');

    expect(dishesService.remove).toHaveBeenCalledWith('d1');
    expect(result).toEqual({ _id: 'd1', isAvailable: false });
  });
});
