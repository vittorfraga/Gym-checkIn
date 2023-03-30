import { InMemoryGymsRepository } from "@/repositorires/in-memory/in-memory-gyms-repository";

import { expect, describe, it, beforeEach } from "vitest";
import { CreateGymUseCase } from "./create-gym";

let gymsRepository: InMemoryGymsRepository;
let sut: CreateGymUseCase;

describe("Create Gym Use Case", () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository();
    sut = new CreateGymUseCase(gymsRepository);
  });

  it("should be able to create a new gym", async () => {
    const { gym } = await sut.execute({
      title: "TypeScript Gym",
      description: null,
      phone: null,
      latitude: -29.9271038,
      longitude: -50.1112439,
    });

    expect(gym.id).toEqual(expect.any(String));
  });
});
