export const storage = {
  get: (keys: string | string[] | object | null) => chrome.storage.sync.get(keys),
  set: (items: object) => chrome.storage.sync.set(items),
  remove: (keys: string | string[]) => chrome.storage.sync.remove(keys),
  clear: () => chrome.storage.sync.clear()
}