import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Branch extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: '' })
  openingHours: string;

  @Prop({ default: '' })
  district: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
