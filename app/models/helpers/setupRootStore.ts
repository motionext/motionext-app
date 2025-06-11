/**
 * Rehydrate the RootStore from AsyncStorage in this file.
 * This allows to persist the state between app launches.
 *
 * Handle navigation state persistence in navigationUtilities.tsx.
 *
 * Note that Fast Refresh doesn't work well with this file, so edit this,
 * and do a full refresh of the app instead.
 *
 * @refresh reset
 */
import { applySnapshot, IDisposer, onSnapshot } from "mobx-state-tree"

import { RootStore, RootStoreSnapshot } from "../RootStore"
import * as storage from "../../utils/storage"

/**
 * Save the key to store the state within async storage.
 */
const ROOT_STATE_STORAGE_KEY = "root-v1"

/**
 * Setup the root state.
 */
let _disposer: IDisposer | undefined
export async function setupRootStore(rootStore: RootStore) {
  let restoredState: RootStoreSnapshot | undefined | null

  try {
    // load the last known state from AsyncStorage
    restoredState = ((await storage.load(ROOT_STATE_STORAGE_KEY)) ?? {}) as RootStoreSnapshot
    applySnapshot(rootStore, restoredState)
  } catch (e) {
    // if there's any problems loading, then inform the dev what happened
    if (__DEV__) {
      if (e instanceof Error) console.error(e.message)
    }
  }

  // stop tracking state changes if already setup
  if (_disposer) _disposer()

  // track changes & save to AsyncStorage
  _disposer = onSnapshot(rootStore, (snapshot) => storage.save(ROOT_STATE_STORAGE_KEY, snapshot))

  const unsubscribe = () => {
    _disposer?.()
    _disposer = undefined
  }

  return { rootStore, restoredState, unsubscribe }
}
