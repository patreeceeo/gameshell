export type TIterator<TEntry, TReturn = TEntry> = (entry: TEntry) => TReturn;
export type TTabularMap<TKey extends keyof TEntry, TEntry> = Map<
  TEntry[TKey],
  TEntry
>;

export function create<TKey extends keyof TEntry, TEntry>(
  entries: TEntry[],
  key: TKey
) {
  return new Map(entries.map((entry) => [entry[key], entry]));
}

export function add<TKey extends keyof TEntry, TEntry>(
  map: TTabularMap<TKey, TEntry>,
  entries: TEntry[],
  key: TKey
) {
  return create([...map.values(), ...entries] as TEntry[], key);
}

export type TUpdateOpts<TKey extends keyof TEntry, TEntry> = {
  subset?: TEntry[TKey][];
};

export function update<TKey extends keyof TEntry, TEntry>(
  map: TTabularMap<TKey, TEntry>,
  it: TIterator<TEntry>,
  key: TKey,
  opts: TUpdateOpts<TKey, TEntry> = {}
) {
  const values = [...map.values()];
  return create(
    opts.subset
      ? values.map((entry: TEntry) => {
          const id = entry[key];
          return opts.subset?.includes(id) ? it(entry) : entry;
        }, [])
      : values.map(it),
    key
  );
}

export function drop<TKey extends keyof TEntry, TEntry>(
  map: TTabularMap<TKey, TEntry>,
  ids: TEntry[TKey][],
  key: TKey
) {
  return filter(map, (entry) => !ids.includes(entry[key]), key);
}

export function filter<TKey extends keyof TEntry, TEntry>(
  map: TTabularMap<TKey, TEntry>,
  test: TIterator<TEntry, boolean> | TEntry[TKey][],
  key: TKey
) {
  const filterCallback =
    typeof test === "function"
      ? test
      : (entry: TEntry) => test.includes(entry[key]);

  return create([...map.values()].filter(filterCallback), key);
}
