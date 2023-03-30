import { ICheckinsRepository } from "@/repositorires/ICheck-ins-repository";
import { IGymsRepository } from "@/repositorires/IGyms-repository";
import { Checkin } from "@prisma/client";
import dayjs from "dayjs";
import { LateCheckInValidationError } from "./errors/late-check-in-validation-error";
import { MaxDistanceError } from "./errors/max-distance-error";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { getDistanceBetweenCoordinates } from "./utils/get-distance-between-coordinates";

interface ValidateCheckInUseCaseRequest {
  checkInId: string;
}

interface ValidateCheckInUseCaseResponse {
  checkIn: Checkin;
}

export class ValidateCheckInUseCase {
  constructor(private checkInsRepository: ICheckinsRepository) {}

  async execute({
    checkInId,
  }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
    const checkIn = await this.checkInsRepository.findById(checkInId);

    if (!checkIn) {
      throw new ResourceNotFoundError();
    }

    const distanceInMinutesFromCheckInCreation = dayjs(new Date()).diff(
      checkIn.created_at,
      "minutes"
    );

    if (distanceInMinutesFromCheckInCreation > 20)
      throw new LateCheckInValidationError();

    checkIn.validated_at = new Date();

    await this.checkInsRepository.save(checkIn);

    return { checkIn };
  }
}
