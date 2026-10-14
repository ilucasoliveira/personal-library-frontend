import { expect, it } from "vitest";
import { bookKey } from "../utils/bookKey";

it("ignora acento, maiúsculas e espaços extras", () => {
  expect(bookKey("Memórias  Póstumas ", "Machado de ASSIS")).toBe(bookKey("memorias postumas", "machado de assis"));
});

it("título igual com autor diferente é outro livro", () => {
  expect(bookKey("Duna", "Frank Herbert")).not.toBe(bookKey("Duna", "Brian Herbert"));
});
