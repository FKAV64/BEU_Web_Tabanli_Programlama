import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Event, User } from './models';
import { PrismaClient } from '@prisma/client';
import { JwtGuard } from '../auth/jwt.guard';

const prisma = new PrismaClient();

@Resolver(() => Event)
export class AppResolver {

  @Query(() => [Event])
  async events() {
    return prisma.event.findMany({
      include: { participants: true },
    });
  }

  @Query(() => Event)
  async event(@Args('id') id: string) {
    return prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: { participants: true },
    });
  }

  @UseGuards(JwtGuard)
  @Query(() => [Event])
  async myEvents(@Context() context: any) {
    const user = context.req.user;
    if (!user) throw new UnauthorizedException();

    return prisma.event.findMany({
      where: { participants: { some: { id: user.sub } } },
      include: { participants: true },
    });
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Event)
  async joinEvent(@Args('eventId') eventId: string, @Context() context: any) {
    const user = context.req.user;
    if (!user) throw new UnauthorizedException();

    const eventIdInt = parseInt(eventId);
    const event = await prisma.event.findUnique({
      where: { id: eventIdInt },
      include: { participants: true },
    });

    if (!event) throw new BadRequestException('Event not found');

    if (event.participants.length >= event.maxParticipants) {
      throw new BadRequestException('Event is already full');
    }

    // Connect user
    return prisma.event.update({
      where: { id: eventIdInt },
      data: {
        participants: {
          connect: { id: user.sub }
        }
      },
      include: { participants: true },
    });
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async leaveEvent(@Args('eventId') eventId: string, @Context() context: any) {
    const user = context.req.user;
    if (!user) throw new UnauthorizedException();

    const eventIdInt = parseInt(eventId);

    await prisma.event.update({
      where: { id: eventIdInt },
      data: {
        participants: {
          disconnect: { id: user.sub }
        }
      }
    });

    return true;
  }
}
