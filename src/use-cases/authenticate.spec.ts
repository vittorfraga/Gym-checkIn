import { InMemoryUsersRepository } from "@/repositorires/in-memory/in-memory-users-repository";
import { hash } from "bcryptjs";
import { expect, describe, it, beforeEach } from "vitest";
import { AuthenticateUseCase } from "./authenticate";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";

let usersRepository: InMemoryUsersRepository;
let sut: AuthenticateUseCase;

describe("Authenticate Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new AuthenticateUseCase(usersRepository);
  });

  it("should be able to authenticate", async () => {
    await usersRepository.create({
      name: "John Does",
      email: "jdoe@example.com",
      password_hash: await hash("123456", 8),
    });

    const { user } = await sut.execute({
      email: "jdoe@example.com",
      password: "123456",
    });

    expect(user.id).toEqual(expect.any(String));
  });

  it("should not be able to authenticate with invalid email", async () => {
    await expect(() =>
      sut.execute({
        email: "jdoe@example.com",
        password: "123456",
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("should not be able to authenticate with invalid password", async () => {
    await usersRepository.create({
      name: "John Does",
      email: "jdoe@example.com",
      password_hash: await hash("123456", 8),
    });

    await expect(() =>
      sut.execute({
        email: "jdoe@example.com",
        password: "1234567",
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
