import { FriendCollection } from ".";

describe("FriendCollection#get", () => {
  it("returns the item corresponding to first arg", () => {
    const calvin = {
      isInvited: true,
      hasAcceptedInvite: true,
    };
    const sut = FriendCollection([{ userName: "calvin", ...calvin }]);

    expect(sut.get("calvin")).toStrictEqual(calvin);
  });
});

describe("FriendCollection#map", () => {
  it("iterates in insertion order", () => {
    const calvin = {
      userName: "calvin",
      isInvited: true,
      hasAcceptedInvite: true,
    };
    const hobbes = {
      userName: "hobbes",
      isInvited: true,
      hasAcceptedInvite: true,
    };

    const sut = FriendCollection([calvin, hobbes]);

    const spyIterator = jest.fn(() => ({}));

    sut.map(spyIterator);

    expect(spyIterator).toHaveBeenCalledWith(calvin);
    expect(spyIterator).toHaveBeenNthCalledWith(2, hobbes);
  });
  it("returns a new instance using results of iteration", () => {
    const calvin = {
      userName: "calvin",
      isInvited: true,
      hasAcceptedInvite: true,
    };
    const hobbes = {
      userName: "hobbes",
      isInvited: true,
      hasAcceptedInvite: true,
    };

    const sut = FriendCollection([calvin, hobbes]);

    const idIterator = (x: any) => x;

    const newSut = sut.map(idIterator);

    expect(newSut).not.toBe(sut);
    expect(newSut.serialize()).toEqual(sut.serialize());
  });
});

describe("FriendCollection#filter", () => {
  it("returns a new instance with only items which pass the test function", () => {
    const calvin = {
      userName: "calvin",
      isInvited: true,
      hasAcceptedInvite: true,
    };
    const hobbes = {
      userName: "hobbes",
      isInvited: true,
      hasAcceptedInvite: true,
    };
    const sut = FriendCollection([calvin, hobbes]);

    const isTiger = (x: any) => x.userName === "hobbes";
    const result = sut.filter(isTiger);

    expect(result.serialize()).toEqual([hobbes]);
  });
});

describe("FriendCollection#resolveConflicts", () => {
  it("adds items found in `ahead`", () => {
    const calvin = {
      userName: "calvin",
      isInvited: true,
      hasAcceptedInvite: true,
    };
    const hobbes = {
      userName: "hobbes",
      isInvited: true,
      hasAcceptedInvite: true,
    };
    const ahead = FriendCollection([calvin, hobbes]);
    const behind = FriendCollection([calvin]);

    const result = behind.resolveConflicts(ahead);

    expect(result.serialize()).toEqual([calvin, hobbes]);
  });

  it("removes items not found in `ahead`", () => {
    const calvin = {
      userName: "calvin",
      isInvited: true,
      hasAcceptedInvite: true,
    };
    const hobbes = {
      userName: "hobbes",
      isInvited: true,
      hasAcceptedInvite: true,
    };
    const ahead = FriendCollection([calvin]);
    const behind = FriendCollection([calvin, hobbes]);

    const result = behind.resolveConflicts(ahead);

    expect(result.serialize()).toEqual([calvin]);
  });
});
