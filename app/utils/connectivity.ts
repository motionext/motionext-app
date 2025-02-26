import { AppState, AppStateStatus } from "react-native"
import { useEffect, useState } from "react"
import NetInfo from "@react-native-community/netinfo"
import { showMessage } from "@/utils/showMessage"
import { translate } from "@/i18n"

// Simplified Connectivity Manager
class ConnectivityManager {
  private listeners: Set<(isConnected: boolean) => void> = new Set()
  private isConnected: boolean | null = null
  private appStateSubscription: any = null
  private netInfoUnsubscribe: (() => void) | null = null
  private lastToastTime: number = 0

  constructor() {
    // Initialize NetInfo listener
    this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      this.updateConnectionState(state.isConnected)
    })

    // Check connectivity when the app comes to the foreground
    this.appStateSubscription = AppState.addEventListener("change", this.handleAppStateChange)

    // Initial check
    this.checkConnectivity()
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      this.checkConnectivity()
    }
  }

  private showConnectivityToast(isConnected: boolean) {
    const now = Date.now()
    if (now - this.lastToastTime > 3000) {
      this.lastToastTime = now

      if (isConnected) {
        showMessage({
          title: translate("common:connectedToInternet"),
          type: "success",
          duration: 3000,
        })
      } else {
        showMessage({
          title: translate("common:noInternetConnection"),
          type: "error",
          duration: 3000,
        })
      }
    }
  }

  private updateConnectionState(isConnected: boolean | null) {
    if (this.isConnected !== isConnected) {
      // Show toast only if it's not the initial check
      if (this.isConnected !== null) {
        this.showConnectivityToast(!!isConnected)
      }

      this.isConnected = isConnected
      this.notifyListeners()
    }
  }

  private async checkConnectivity() {
    const netInfo = await NetInfo.fetch()
    this.updateConnectionState(netInfo.isConnected)
  }

  private notifyListeners() {
    if (this.isConnected !== null) {
      this.listeners.forEach((listener) => {
        listener(this.isConnected as boolean)
      })
    }
  }

  public addListener(listener: (isConnected: boolean) => void): () => void {
    this.listeners.add(listener)

    // Notify the new listener of the current state immediately
    if (this.isConnected !== null) {
      listener(this.isConnected)
    }

    return () => this.listeners.delete(listener)
  }

  public getCurrentState(): boolean | null {
    return this.isConnected
  }
}

// Export singleton instance
export const connectivityManager = new ConnectivityManager()

// Custom hook for use in components
export function useConnectivity() {
  const [isConnected, setIsConnected] = useState<boolean | null>(
    connectivityManager.getCurrentState(),
  )

  useEffect(() => {
    const unsubscribe = connectivityManager.addListener(setIsConnected)
    return unsubscribe
  }, [])

  return {
    isConnected,
  }
}
