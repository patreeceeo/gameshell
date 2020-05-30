import * as sut from ".";

test("identifyUser", async () => {
  const result = await sut.identifyUser({ userName: "fred" });
  expect(result.success).toBe(true);
});

test("setStatus", async () => {
  const result = await sut.setStatus(
    {
      userName: "fred",
    },
    sut.UserStatus.custom("bustin' rocks")
  );
  expect(result.success).toBe(true);
});

test("startGame", async () => {
  const result = await sut.startGame(["fred"], "boggle");
  expect(result.success).toBe(true);
});
