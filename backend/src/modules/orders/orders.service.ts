import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

export interface OrderFilter {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = new this.orderModel(createOrderDto);
    return newOrder.save();
  }

  async findByUserId(userId: string, filter: OrderFilter = {}): Promise<{ orders: Order[]; total: number }> {
    const query: Record<string, unknown> = { userId };
    this.applyFilters(query, filter);

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query).exec(),
    ]);

    return { orders, total };
  }

  async findAll(filter: OrderFilter = {}): Promise<{ orders: Order[]; total: number }> {
    const query: Record<string, unknown> = {};
    this.applyFilters(query, filter);

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .populate('userId', 'fullName email')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query).exec(),
    ]);

    return { orders, total };
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).populate('userId', 'fullName email').exec();
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('userId', 'fullName email')
      .exec();
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  async updateOrder(id: string, userId: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    if (order.userId.toString() !== userId) {
      throw new BadRequestException('Bạn không có quyền chỉnh sửa đơn hàng này');
    }
    if (order.status !== 'pending') {
      throw new BadRequestException('Chỉ có thể chỉnh sửa đơn hàng đang chờ xác nhận');
    }
    const updated = await this.orderModel
      .findByIdAndUpdate(id, { $set: updateOrderDto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return updated;
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    if (order.userId.toString() !== userId) {
      throw new BadRequestException('Bạn không có quyền hủy đơn hàng này');
    }
    if (order.status !== 'pending') {
      throw new BadRequestException('Chỉ có thể hủy đơn hàng đang chờ xác nhận');
    }
    const cancelled = await this.orderModel
      .findByIdAndUpdate(id, { status: 'cancelled' }, { new: true })
      .exec();
    if (!cancelled) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return cancelled;
  }

  async getStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    statusCounts: Record<string, number>;
    todayOrders: number;
    todayRevenue: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, totalRevenueResult, statusCounts, todayOrders, todayRevenueResult] = await Promise.all([
      this.orderModel.countDocuments().exec(),
      this.orderModel.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      this.orderModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.orderModel.countDocuments({ createdAt: { $gte: today } }).exec(),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const statusCountsMap: Record<string, number> = {};
    statusCounts.forEach((item: { _id: string; count: number }) => {
      statusCountsMap[item._id] = item.count;
    });

    return {
      totalOrders,
      totalRevenue: totalRevenueResult[0]?.total || 0,
      statusCounts: statusCountsMap,
      todayOrders,
      todayRevenue: todayRevenueResult[0]?.total || 0,
    };
  }

  private applyFilters(query: Record<string, unknown>, filter: OrderFilter): void {
    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      query.createdAt = {};
      if (filter.startDate) {
        (query.createdAt as Record<string, unknown>).$gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        (query.createdAt as Record<string, unknown>).$lte = endDate;
      }
    }

    if (filter.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      query.$or = [
        { customerName: searchRegex },
        { phone: searchRegex },
        { address: searchRegex },
      ];
    }
  }
}
