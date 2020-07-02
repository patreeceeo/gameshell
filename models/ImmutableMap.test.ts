import * as IM from "./ImmutableMap";

describe("add", () => {
  it("appends to the end with effecting existing entries", () => {
    const calvin = {
      userName: "calvin",
      isInvited: true,
      hasAcceptedInvite: false,
    };
    const hobbes = {
      userName: "hobbes",
      isInvited: true,
      hasAcceptedInvite: false,
    };
    const map = IM.create([calvin], "userName");

    const newMap = IM.add(map, [hobbes], "userName");

    expect([...newMap.values()]).toEqual([calvin, hobbes]);
  });
});

describe("update", () => {
  it("returns a new collection with the updates specified by the iterator", () => {
    const calvin = {
      userName: "calvin",
      isInvited: true,
      hasAcceptedInvite: false,
    };
    const hobbes = {
      userName: "hobbes",
      isInvited: true,
      hasAcceptedInvite: false,
    };
    const map = IM.create([calvin, hobbes], "userName");

    const newMap = IM.update(
      map,
      (entry) => ({
        ...entry,
        hasAcceptedInvite: true,
      }),
      "userName"
    );

    expect(newMap.get("calvin")?.hasAcceptedInvite).toBe(true);
    expect(newMap.get("hobbes")?.hasAcceptedInvite).toBe(true);
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

    const map = IM.create([calvin, hobbes], "userName");

    const idIterator = (x: any) => x;

    const newMap = IM.update(map, idIterator, "userName");

    expect(newMap).not.toBe(map);
    expect([...newMap.entries()]).toEqual([...map.entries()]);
  });

  it("can be limited to specified subset of entries", () => {
    const calvin = {
      userName: "calvin",
      isInvited: false,
      hasAcceptedInvite: false,
    };
    const hobbes = {
      userName: "hobbes",
      isInvited: false,
      hasAcceptedInvite: false,
    };

    const map = IM.create([calvin, hobbes], "userName");

    const newMap = IM.update(
      map,
      (entry) => ({ ...entry, isInvited: true }),
      "userName",
      {
        subset: ["hobbes"],
      }
    );

    expect([...newMap.values()]).toEqual([
      calvin,
      { ...hobbes, isInvited: true },
    ]);
  });
});

describe("drop", () => {
  it("returns a new collection with the entries identified by 1st arg removed", () => {
    const calvin = {
      userName: "calvin",
      isInvited: true,
      hasAcceptedInvite: false,
    };
    const hobbes = {
      userName: "hobbes",
      isInvited: true,
      hasAcceptedInvite: false,
    };
    const map = IM.create([calvin, hobbes], "userName");

    const newMap = IM.drop(map, ["calvin"], "userName");

    expect(newMap.get("calvin")).not.toBeDefined();
  });
});

describe("filter", () => {
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
    const map = IM.create([calvin, hobbes], "userName");

    const isTiger = (x: any) => x.userName === "hobbes";
    const newMap = IM.filter(map, isTiger, "userName");

    expect([...newMap.values()]).toEqual([hobbes]);
  });
});
