import * as generic from "./ImmutableMap";

export const KEY = "userName";

export interface TFriend {
  userName: string;
  isInvited: boolean;
  hasAcceptedInvite: boolean;
}

export type TTabularMap = generic.TTabularMap<typeof KEY, TFriend>;

export function create(entries: TFriend[]): TTabularMap {
  return generic.create(entries, KEY);
}

export function add(map: TTabularMap, entries: TFriend[]) {
  return generic.add(map, entries, KEY);
}

export function update(
  map: TTabularMap,
  it: generic.TIterator<TFriend>,
  opts: generic.TUpdateOpts<typeof KEY, TFriend> = {}
) {
  return generic.update(map, it, KEY, opts);
}

export function drop(map: TTabularMap, ids: string[]) {
  return generic.drop(map, ids, KEY);
}

export function filter(
  map: TTabularMap,
  test: generic.TIterator<TFriend, boolean> | string[]
) {
  return generic.filter(map, test, KEY);
}

