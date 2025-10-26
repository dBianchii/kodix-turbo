"use server";

export async function testError() {
  throw new Error("teste error server");
}
