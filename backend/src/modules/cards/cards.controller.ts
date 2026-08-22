import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Get()
  findAll(@Request() req) {
    return this.cardsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.cardsService.findOne(id, req.user.id);
  }

  @Get(':id/bill')
  getBill(
    @Param('id') id: string,
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req,
  ) {
    return this.cardsService.getBill(id, req.user.id, month, year);
  }

  @Post()
  create(@Body() dto: CreateCardDto, @Request() req) {
    return this.cardsService.create(req.user.id, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCardDto, @Request() req) {
    return this.cardsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.cardsService.remove(id, req.user.id);
  }
}
