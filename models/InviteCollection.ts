import * as generic from "./ImmutableMap";

export const KEY = "userNameRemote";

export interface TInvite {
  userNameRemote: string;
  hasBeenAccepted?: boolean;
  gameId?: string;
}

export type TTabularMap = generic.TTabularMap<typeof KEY, TInvite>;

export function create(entries: TInvite[]): TTabularMap {
  return generic.create(entries, KEY);
}

export function add(map: TTabularMap, entries: TInvite[]) {
  return generic.add(map, entries, KEY);
}

export function update(
  map: TTabularMap,
  it: generic.TIterator<TInvite>,
  opts: generic.TUpdateOpts<typeof KEY, TInvite> = {}
) {
  return generic.update(map, it, KEY, opts);
}

export function drop(map: TTabularMap, ids: string[]) {
  return generic.drop(map, ids, KEY);
}

export function filter(
  map: TTabularMap,
  test: generic.TIterator<TInvite, boolean> | string[]
) {
  return generic.filter(map, test, KEY);
}
