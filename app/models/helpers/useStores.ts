import { createContext, useContext, useEffect, useState } from "react"
import { RootStore, RootStoreModel } from "../RootStore"
import { setupRootStore } from "./setupRootStore"

/**
 * Create the initial (empty) global RootStore instance here.
 *
 * Later, rehydrate it in app.tsx with the setupRootStore function.
 *
 * If the RootStore requires specific properties to be instantiated,
 * instantiate them here.
 *
 * If the RootStore has a lot of sub-stores and properties (the tree is
 * very large), consider using a different strategy than immediately
 * instantiating it, although that should be rare.
 */
const _rootStore = RootStoreModel.create({})

/**
 * The RootStoreContext provides a way to access the RootStore in any
 * screen or component.
 */
const RootStoreContext = createContext<RootStore>(_rootStore)

/**
 * Use this Provider to specify a *different* RootStore than the singleton
 * version above if needed. Generally speaking, use this Provider & custom
 * RootStore instances only in testing scenarios.
 */
export const RootStoreProvider = RootStoreContext.Provider

/**
 * A hook that screens and other components can use to gain access to the stores:
 *
 * const rootStore = useStores()
 *
 * or:
 *
 * const { someStore, someOtherStore } = useStores()
 */
export const useStores = () => useContext(RootStoreContext)

/**
 * Used only in the app.tsx file, this hook sets up the RootStore
 * and then rehydrates it. It lets the app know that everything
 * is ready to go.
 * @param {() => void | Promise<void>} callback - an optional callback that's invoked once the store is ready
 * @returns {object} - the RootStore and rehydrated state
 */
export const useInitialRootStore = (callback?: () => void | Promise<void>) => {
  const rootStore = useStores()
  const [rehydrated, setRehydrated] = useState(false)

  // Kick off initial async loading actions, like loading fonts and rehydrating RootStore
  useEffect(() => {
    let _unsubscribe: () => void | undefined
    ;(async () => {
      // set up the RootStore (returns the state restored from AsyncStorage)
      const { unsubscribe } = await setupRootStore(rootStore)
      _unsubscribe = unsubscribe

      // let the app know it's finished rehydrating
      setRehydrated(true)

      // invoke the callback, if provided
      if (callback) callback()
    })()

    return () => {
      // cleanup
      if (_unsubscribe !== undefined) _unsubscribe()
    }
    // only runs on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { rootStore, rehydrated }
}
