package com.ResidenceConnect.myapp

import android.app.Application
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.Context
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.ResidenceConnect.myapp.TTLockPackage
import com.ttlock.bl.sdk.api.TTLockClient

class MainApplication : Application(), ReactApplication {

  companion object {
    private const val TAG = "MainApplication"
  }

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(TTLockPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()

    // ------------------------------------------------------------------
    // 1. TTLock SDK initialization — MUST run exactly once, app-wide.
    //    Do NOT call prepareBTService() again anywhere else in the app.
    // ------------------------------------------------------------------
    initTTLockSDK()

    // ------------------------------------------------------------------
    // 2. Boot React Native.
    // ------------------------------------------------------------------
    loadReactNative(this)

    // ------------------------------------------------------------------
    // 3. Post-boot sanity check.
    // ------------------------------------------------------------------
    logBluetoothState("after RN boot")
  }

  // ======================================================================
  // TTLock SDK lifecycle helpers
  // ======================================================================

  private fun initTTLockSDK() {
    try {
      TTLockClient.getDefault().prepareBTService(applicationContext)
      Log.i(TAG, "TTLock prepareBTService OK")
      logBluetoothState("after prepareBTService")
    } catch (e: Exception) {
      Log.e(TAG, "TTLock prepareBTService FAILED", e)
    }
  }

  /**
   * Logs Bluetooth state from BOTH sources:
   *   - OS-level BluetoothAdapter (via BluetoothManager)
   *   - TTLock SDK's public isBLEEnabled() API
   *
   * If OS says enabled=true but TTLock says enabled=false, the SDK's
   * internal service is uninitialized — prepareBTService() didn't run,
   * or stopBTService() was called somewhere.
   */
  private fun logBluetoothState(stage: String) {
    try {
      // --- OS-level adapter ---
      val btManager =
        applicationContext.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
      val osAdapter: BluetoothAdapter? = btManager?.adapter
      val osEnabled = osAdapter?.isEnabled ?: false

      // --- TTLock SDK's view ---
      val sdkEnabled = try {
        TTLockClient.getDefault().isBLEEnabled(applicationContext)
      } catch (t: Throwable) {
        Log.e(TAG, "TTLock isBLEEnabled() threw", t)
        false
      }

      Log.i(
        TAG,
        "BT state [$stage]  osAdapter=${if (osAdapter == null) "NULL" else "present"}  " +
                "osEnabled=$osEnabled  sdkEnabled=$sdkEnabled"
      )

      if (osEnabled && !sdkEnabled) {
        Log.e(
          TAG,
          "BT state [$stage] MISMATCH: OS Bluetooth is ON but TTLock SDK " +
                  "reports disabled. The SDK's internal service is uninitialized. " +
                  "Check for a stopBTService() call elsewhere in the app."
        )
      }
    } catch (t: Throwable) {
      Log.e(TAG, "BT state [$stage] check failed", t)
    }
  }

  // ======================================================================
  // App termination — the ONLY place stopBTService() should ever be called.
  // Note: onTerminate() is NOT called on real devices in production;
  // it only fires on emulators / in some dev scenarios. This is intentional.
  // ======================================================================

  override fun onTerminate() {
    super.onTerminate()
    try {
      TTLockClient.getDefault().stopBTService()
      Log.i(TAG, "TTLock stopBTService called on app terminate")
    } catch (e: Exception) {
      Log.e(TAG, "TTLock stopBTService FAILED", e)
    }
  }
}