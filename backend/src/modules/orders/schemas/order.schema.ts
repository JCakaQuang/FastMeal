import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Dish' })
  dishId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop()
  image: string;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ default: '' })
  note: string;

  @Prop({
    required: true,
    enum: ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Index for efficient queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
