import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { OrdersService, OrderFilter } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ChatGateway } from '../chat/chat.gateway';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  delivering: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    return { message: 'Đặt hàng thành công', order };
  }

  @Get('stats')
  async getStats() {
    return this.ordersService.getStats();
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filter: OrderFilter = {
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      startDate,
      endDate,
    };
    return this.ordersService.findByUserId(userId, filter);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const filter: OrderFilter = {
      status,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    };
    return this.ordersService.findAll(filter);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.ordersService.updateStatus(id, updateStatusDto.status);
    return { message: 'Cập nhật trạng thái thành công', order };
  }

  @Patch(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    const order = await this.ordersService.cancelOrder(id, userId);
    return { message: 'Đã hủy đơn hàng thành công', order };
  }

  @Patch(':id')
  async updateOrder(
    @Param('id') id: string,
    @Body() body: UpdateOrderDto & { userId: string },
  ) {
    const { userId, ...updateData } = body;
    const order = await this.ordersService.updateOrder(id, userId, updateData);
    return { message: 'Cập nhật đơn hàng thành công', order };
  }
}
