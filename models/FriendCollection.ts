export interface TFriend {
  isInvited: boolean;
  hasAcceptedInvite: boolean;
}

export interface TFriendCollection {
  [userName: string]: TFriend;
}

type TEntry = TFriend & { userName: string };

type TFriendCollectionData = readonly TEntry[];

type TIterator<T> = (entry: TEntry) => T;

export interface IFriendCollection {
  hereMap: Map<string, TFriend>;
  size: number;

  add(userNames: string[]): IFriendCollection;
  byUserNameGet(userName: string): TFriend;

  byUserNameSet(userNames: string[], it: TIterator<TEntry>): IFriendCollection;

  serialize(): TFriendCollectionData;

  map<T>(it: TIterator<T>): IFriendCollection;

  filter(test: TIterator<boolean>): IFriendCollection;
  filter(test: string[]): IFriendCollection;
  resolveConflicts(other: IFriendCollection): IFriendCollection;
}

class FriendCollectionImpl implements IFriendCollection {
  hereMap: Map<string, TFriend>;
  size: number;

  constructor(data: TFriendCollectionData) {
    this.hereMap = FriendCollectionImpl.createMap(data);
    Object.defineProperty(this, "size", {
      get: () => this.hereMap.size,
    });
  }

  private static createMap(data: TFriendCollectionData) {
    return new Map(data.map(({ userName, ...stuff }) => [userName, stuff]));
  }

  add(userNames: string[]) {
    return new FriendCollectionImpl(
      userNames.map((userName) => ({
        userName,
        isInvited: false,
        hasAcceptedInvite: false,
      }))
    );
  }

  byUserNameGet(userName: string) {
    return this.hereMap.get(userName);
  }

  byUserNameSet(userNames: string[], it: TIterator<TEntry>) {
    return new FriendCollectionImpl(
      this.serialize().map((entry) => {
        if (userNames.includes(entry.userName)) {
          return it(entry);
        } else {
          return entry;
        }
      })
    );
  }

  serialize(): TFriendCollectionData {
    return iterateOverMap(this.hereMap);
  }

  map<T>(it: TIterator<T>) {
    return new FriendCollectionImpl(iterateOverMap(this.hereMap, it));
  }

  filter(test: TIterator<boolean> | string[]) {
    const filterCallback =
      typeof test === "function"
        ? test
        : ({ userName }: { userName: string }) => test.includes(userName);

    const data = iterateOverMap(this.hereMap).filter(filterCallback);
    return new FriendCollectionImpl(data);
  }

  resolveConflicts(other: IFriendCollection) {
    const mapClone = new Map(this.hereMap.entries());
    resolveConflictsInMap(mapClone, other.hereMap);
    return new FriendCollectionImpl(iterateOverMap(mapClone));
  }
}

function iterateOverMap<TReturn>(
  map: Map<any, any>,
  it: TIterator<TReturn> = (x: any) => x
) {
  const results = [];
  for (const entry of map.entries()) {
    results.push(callIterator(it, entry));
  }
  return results;
}

function callIterator<T>(
  it: TIterator<T>,
  [userName, stuff]: [string, TFriend]
) {
  return it.call(null, { userName, ...stuff });
}

function resolveConflictsInMap<K, V>(
  behind: Map<K, V>,
  ahead: Map<K, V>
): void {
  for (const [key, value] of ahead.entries()) {
    if (!behind.has(key)) {
      behind.set(key, value);
    }
  }
  for (const [key] of behind.entries()) {
    if (!ahead.has(key)) {
      behind.delete(key);
    }
  }
}

export function FriendCollection(data: TFriendCollectionData) {
  return new FriendCollectionImpl(data);
}
