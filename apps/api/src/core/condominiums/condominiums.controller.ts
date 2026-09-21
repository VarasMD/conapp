import { Controller, Get, Param } from '@nestjs/common';
import { CondominiumsService } from './condominiums.service';

@Controller('condominiums')
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Get()
  findAll() {
    return this.condominiumsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.condominiumsService.findOne(Number(id));
  }
}
