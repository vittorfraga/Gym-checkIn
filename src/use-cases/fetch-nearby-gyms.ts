import { IGymsRepository } from "@/repositorires/IGyms-repository";
import { Gym } from "@prisma/client";

interface FetchNearbyUseCaseRequest {
  userLatitude: number;
  userLongitude: number;
}

interface FetchNearbyUseCaseReponse {
  gyms: Gym[];
}

export class FetchNearbyGymsUseCase {
  constructor(private gymsRepository: IGymsRepository) {}

  async execute({
    userLatitude,
    userLongitude,
  }: FetchNearbyUseCaseRequest): Promise<FetchNearbyUseCaseReponse> {
    const gyms = await this.gymsRepository.findManyNearby({
      latitude: userLatitude,
      longitude: userLongitude,
    });

    return { gyms };
  }
}
