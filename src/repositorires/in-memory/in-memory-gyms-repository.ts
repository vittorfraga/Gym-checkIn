import { getDistanceBetweenCoordinates } from "@/use-cases/utils/get-distance-between-coordinates";
import { Gym, Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { FindManyNearbyParams, IGymsRepository } from "../IGyms-repository";

export class InMemoryGymsRepository implements IGymsRepository {
  public gyms: Gym[] = [];

  async findById(id: string): Promise<Gym | null> {
    const gym = this.gyms.find((gym) => gym.id === id);

    if (!gym) {
      return null;
    }
    return gym;
  }

  async create(data: Prisma.GymCreateInput): Promise<Gym> {
    const gym = {
      id: data.id ?? randomUUID(),
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Prisma.Decimal(data.latitude.toString()),
      longitude: new Prisma.Decimal(data.longitude.toString()),
      created_at: new Date(),
    };

    this.gyms.push(gym);

    return gym;
  }

  async searchMany(query: string, page: number) {
    return this.gyms
      .filter((gym) => gym.title.includes(query))
      .slice((page - 1) * 20, page * 20);
  }

  async findManyNearby(params: FindManyNearbyParams) {
    return this.gyms.filter((gym) => {
      const distance = getDistanceBetweenCoordinates(
        {
          latitude: params.latitude,
          longitude: params.longitude,
        },
        {
          latitude: gym.latitude.toNumber(),
          longitude: gym.longitude.toNumber(),
        }
      );

      return distance < 10;
    });
  }
}
