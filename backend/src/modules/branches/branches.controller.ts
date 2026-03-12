import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  async create(@Body() createBranchDto: CreateBranchDto) {
    const branch = await this.branchesService.create(createBranchDto);
    return { message: 'Tạo chi nhánh thành công', branch };
  }

  @Get()
  async findAll(@Query('active') active?: string) {
    const activeOnly = active === 'true';
    return this.branchesService.findAll(activeOnly);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.branchesService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    const branch = await this.branchesService.update(id, updateBranchDto);
    return { message: 'Cập nhật chi nhánh thành công', branch };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const branch = await this.branchesService.remove(id);
    return { message: 'Xóa chi nhánh thành công', branch };
  }
}
