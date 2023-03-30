import { InMemoryCheckInsRepository } from "@/repositorires/in-memory/in-memory-check-ins-repository";
import { InMemoryGymsRepository } from "@/repositorires/in-memory/in-memory-gyms-repository";
import { Decimal } from "@prisma/client/runtime";

import { expect, describe, it, beforeEach, vi, afterEach } from "vitest";
import { CheckInUseCase } from "./check-in";
import { MaxDistanceError } from "./errors/max-distance-error";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error";

let checkInsRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;

describe("Check in Use Case", () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository();
    gymsRepository = new InMemoryGymsRepository();
    sut = new CheckInUseCase(checkInsRepository, gymsRepository);

    gymsRepository.gyms.push({
      id: "gym-01",
      title: "TypeScript Gym",
      description: "",
      phone: "",
      latitude: new Decimal(-29.9271038),
      longitude: new Decimal(-50.1112439),
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should be able to check-in", async () => {
    const { checkIn } = await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -29.9271038,
      userLongitude: -50.1112439,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check in twice in the same day", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -29.9271038,
      userLongitude: -50.1112439,
    });

    await expect(() =>
      sut.execute({
        gymId: "gym-01",
        userId: "user-01",
        userLatitude: -29.9271038,
        userLongitude: -50.1112439,
      })
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError);
  });

  it("should be able to check  twice but in different days", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -29.9271038,
      userLongitude: -50.1112439,
    });

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0));

    const { checkIn } = await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -29.9271038,
      userLongitude: -50.1112439,
    });
  });

  it("should not be able to check in far from gym", async () => {
    gymsRepository.gyms.push({
      id: "gym-02",
      title: "TypeScript Gym",
      description: "",
      phone: "",
      latitude: new Decimal(-28.7295063),
      longitude: new Decimal(-49.3376351),
    });

    await expect(() =>
      sut.execute({
        gymId: "gym-02",
        userId: "user-01",
        userLatitude: -29.9271038,
        userLongitude: -50.1112439,
      })
    ).rejects.toBeInstanceOf(MaxDistanceError);
  });
});
