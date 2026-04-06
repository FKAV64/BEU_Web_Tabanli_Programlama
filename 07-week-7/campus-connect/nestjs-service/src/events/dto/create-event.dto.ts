export class CreateEventDto {
  title!: string;
  description?: string;
  category!: string;
  city!: string;
  date!: string | Date;
  maxParticipants!: number;
}