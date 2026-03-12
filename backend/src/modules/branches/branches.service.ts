import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch } from './schemas/branch.schema';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(@InjectModel(Branch.name) private branchModel: Model<Branch>) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    const newBranch = new this.branchModel(createBranchDto);
    return newBranch.save();
  }

  async findAll(activeOnly = false): Promise<Branch[]> {
    const query = activeOnly ? { isActive: true } : {};
    return this.branchModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Branch> {
    const branch = await this.branchModel.findById(id).exec();
    if (!branch) {
      throw new NotFoundException('Không tìm thấy chi nhánh');
    }
    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.branchModel
      .findByIdAndUpdate(id, { $set: updateBranchDto }, { new: true })
      .exec();
    if (!branch) {
      throw new NotFoundException('Không tìm thấy chi nhánh');
    }
    return branch;
  }

  async remove(id: string): Promise<Branch> {
    const branch = await this.branchModel.findByIdAndDelete(id).exec();
    if (!branch) {
      throw new NotFoundException('Không tìm thấy chi nhánh');
    }
    return branch;
  }
}
