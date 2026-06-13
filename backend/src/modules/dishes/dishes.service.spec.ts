import { NotFoundException } from '@nestjs/common';
import { DishesService } from './dishes.service';

type DishModelMock = jest.Mock & {
  find: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
};

describe('DishesService', () => {
  let service: DishesService;
  let dishModel: DishModelMock;
  const saveMock = jest.fn();

  beforeEach(() => {
    dishModel = jest.fn().mockImplementation((doc) => ({
      ...doc,
      save: saveMock,
    })) as unknown as DishModelMock;

    dishModel.find = jest.fn();
    dishModel.findById = jest.fn();
    dishModel.findByIdAndUpdate = jest.fn();
    saveMock.mockReset();

    service = new DishesService(dishModel as any);
  });

  it('creates a dish', async () => {
    const dto = { name: 'Phở bò', price: 45000, category: 'Noodle' };
    saveMock.mockResolvedValue({ _id: 'd1', ...dto });

    const result = await service.create(dto as any);

    expect(dishModel).toHaveBeenCalledWith(dto);
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual({ _id: 'd1', ...dto });
  });

  it('finds only available dishes by default', async () => {
    const execMock = jest.fn().mockResolvedValue([{ _id: 'd1', isAvailable: true }]);
    dishModel.find.mockReturnValue({ exec: execMock });

    const result = await service.findAll();

    expect(dishModel.find).toHaveBeenCalledWith({ isAvailable: true });
    expect(result).toEqual([{ _id: 'd1', isAvailable: true }]);
  });

  it('finds all dishes when onlyAvailable is false', async () => {
    const execMock = jest.fn().mockResolvedValue([{ _id: 'd1' }, { _id: 'd2' }]);
    dishModel.find.mockReturnValue({ exec: execMock });

    const result = await service.findAll(false);

    expect(dishModel.find).toHaveBeenCalledWith({});
    expect(result).toEqual([{ _id: 'd1' }, { _id: 'd2' }]);
  });

  it('finds one dish by id', async () => {
    const execMock = jest.fn().mockResolvedValue({ _id: 'd1' });
    dishModel.findById.mockReturnValue({ exec: execMock });

    const result = await service.findOne('d1');

    expect(dishModel.findById).toHaveBeenCalledWith('d1');
    expect(result).toEqual({ _id: 'd1' });
  });

  it('throws NotFoundException when dish does not exist', async () => {
    const execMock = jest.fn().mockResolvedValue(null);
    dishModel.findById.mockReturnValue({ exec: execMock });

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates a dish', async () => {
    const dto = { name: 'Cơm gà', price: 50000 };
    const execMock = jest.fn().mockResolvedValue({ _id: 'd1', ...dto });
    dishModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

    const result = await service.update('d1', dto as any);

    expect(dishModel.findByIdAndUpdate).toHaveBeenCalledWith('d1', dto, { new: true });
    expect(result).toEqual({ _id: 'd1', ...dto });
  });

  it('soft deletes a dish by setting isAvailable to false', async () => {
    dishModel.findByIdAndUpdate.mockResolvedValue({ _id: 'd1', isAvailable: false });

    const result = await service.remove('d1');

    expect(dishModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'd1',
      { isAvailable: false },
      { new: true },
    );
    expect(result).toEqual({ _id: 'd1', isAvailable: false });
  });

  it('throws NotFoundException when removing missing dish', async () => {
    dishModel.findByIdAndUpdate.mockResolvedValue(null);

    await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
