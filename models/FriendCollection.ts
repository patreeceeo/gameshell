interface TFriend {
  isInvited: boolean;
  hasAcceptedInvite: boolean;
}

export interface TFriendCollection {
  [userName: string]: TFriend;
}

type TFriendCollectionData = readonly (TFriend & { userName: string })[];

type TIterator<T> = (f: TFriend & { userName: string }) => T;

interface IFriendCollection {
  hereMap: Map<string, TFriend>;

  get(userName: string): TFriend;

  serialize(): TFriendCollectionData;

  map<T>(it: TIterator<T>): FriendCollectionImpl;

  filter(test: TIterator<boolean>): FriendCollectionImpl;
}

class FriendCollectionImpl implements IFriendCollection {
  hereMap: Map<string, TFriend>;

  constructor(data: TFriendCollectionData) {
    this.hereMap = FriendCollectionImpl.createMap(data);
  }

  private static createMap(data: TFriendCollectionData) {
    return new Map(data.map(({ userName, ...stuff }) => [userName, stuff]));
  }

  get(userName: string): TFriend {
    return this.hereMap.get(userName);
  }

  serialize(): TFriendCollectionData {
    return iterateOverMap(this.hereMap, (x) => x);
  }

  map<T>(it: TIterator<T>): FriendCollectionImpl {
    return new FriendCollectionImpl(iterateOverMap(this.hereMap, it));
  }

  filter(test: TIterator<boolean>): FriendCollectionImpl {
    const data = iterateOverMap(this.hereMap, (x) => x).filter(test);
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
