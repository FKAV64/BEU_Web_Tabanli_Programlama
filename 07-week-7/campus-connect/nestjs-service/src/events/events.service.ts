import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const prisma = new PrismaClient();

@Injectable()
export class EventsService {
  async create(createEventDto: CreateEventDto) {
    const data = { ...createEventDto, date: new Date(createEventDto.date) };
    return prisma.event.create({ data });
  }

  async findAll(page: number = 1, limit: number = 10, category?: string, city?: string, sort: string = 'date', order: string = 'desc') {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (category) where.category = category;
    if (city) where.city = city;

    const [data, total] = await Promise.all([
      prisma.event.findMany({
        skip: Number(skip),
        take: Number(limit),
        where,
        orderBy: { [sort]: order.toLowerCase() },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException(`Event #${id} not found`);
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    try {
      const data = { ...updateEventDto };
      if (data.date) data.date = new Date(data.date);
      return await prisma.event.update({ where: { id }, data });
    } catch (error) {
      throw new NotFoundException(`Event #${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      await prisma.event.delete({ where: { id } });
      return { message: 'Event deleted' };
    } catch (error) {
      throw new NotFoundException(`Event #${id} not found`);
    }
  }
}