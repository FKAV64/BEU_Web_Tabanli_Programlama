import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => [Event], { nullable: true })
  joinedEvents?: Event[];
}

@ObjectType()
export class Event {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  category: string;

  @Field()
  city: string;

  @Field()
  date: Date;

  @Field(() => Int)
  maxParticipants: number;

  @Field(() => [User], { nullable: true })
  participants?: User[];
}
