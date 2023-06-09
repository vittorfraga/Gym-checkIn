import { Checkin, Prisma, User } from "@prisma/client";
import { randomUUID } from "node:crypto";
import dayjs from "dayjs";
import { ICheckinsRepository } from "../ICheck-ins-repository";

export class InMemoryCheckInsRepository implements ICheckinsRepository {
  public checkIns: Checkin[] = [];

  async findByUserIdOnDate(userId: string, date: Date) {
    const startOfTheDay = dayjs(date).startOf("date");
    const endOfTheDay = dayjs(date).endOf("date");

    const checkOnsameDate = this.checkIns.find((checkIn) => {
      const checkInDate = dayjs(checkIn.created_at);
      const isOnSameDate =
        checkInDate.isAfter(startOfTheDay) && checkInDate.isBefore(endOfTheDay);
      return checkIn.user_id === userId && isOnSameDate;
    });

    if (!checkOnsameDate) return null;

    return checkOnsameDate;
  }

  async create(data: Prisma.CheckinUncheckedCreateInput) {
    const checkIn = {
      id: randomUUID(),
      user_id: data.user_id,
      gym_id: data.gym_id,
      validated_at: data.validated_at ? new Date(data.validated_at) : null,
      created_at: new Date(),
    };
    this.checkIns.push(checkIn);

    return checkIn;
  }

  async findManyByUserId(userId: string, page: number) {
    return this.checkIns
      .filter((checkIn) => checkIn.user_id === userId)
      .slice((page - 1) * 20, page * 20);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.checkIns.filter((checkIn) => checkIn.user_id === userId).length;
  }

  async findById(id: string) {
    const checkIn = this.checkIns.find((item) => item.id === id);

    if (!checkIn) {
      return null;
    }
    return checkIn;
  }

  async save(checkIn: Checkin) {
    const checkInIndex = this.checkIns.findIndex(
      (item) => item.id === checkIn.id
    );

    if (checkInIndex >= 0) this.checkIns[checkInIndex] = checkIn;

    return checkIn;
  }
}
