import { expect, it } from "vitest";
import { userMessage } from "./userMessage";
it("never echoes unknown provider messages, database paths or secrets", () => {
  for (const message of [
    "SQL failed with password=PRIVATE_SECRET",
    "Prisma error at /home/private/server.ts:42",
    "AccessDenied R2 PRIVATE_SECRET",
    "Unrecognized server response PRIVATE_SECRET",
  ]) {
    const safe = userMessage(new Error(message));
    expect(safe).not.toContain("PRIVATE_SECRET");
    expect(safe).not.toContain("server.ts");
    expect(safe).not.toContain("SQL");
  }
});
it("gives a useful next step for a missing receipt and permission errors", () => {
  expect(
    userMessage(new Error("Receipt file is missing from private storage")),
  ).toContain("upload it again");
  expect(
    userMessage(
      Object.assign(new Error("PRIVATE_DETAIL"), { statusCode: 403 }),
    ),
  ).toContain("manager");
  expect(
    userMessage(
      Object.assign(new Error("PRIVATE_DETAIL"), { statusCode: 429 }),
    ),
  ).toContain("wait");
  expect(
    userMessage(
      Object.assign(new Error("PRIVATE_DETAIL"), { statusCode: 409 }),
    ),
  ).toContain("Refresh");
});
