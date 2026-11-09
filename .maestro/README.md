# Maestro Android smoke test

The workflow `.github/workflows/maestro-android-smoke.yml` builds the Capacitor debug APK and exercises the pairing screen in an Android emulator.

## Flow

`.maestro/flows/smoke.yaml` checks that the app launches, the navigation drawer opens, the PC pairing dialog is available, and the dialog can be closed again.

This is a UI-shell smoke test only. It does not claim a real PC pairing, backend chat, provider response, or Motorola-device acceptance. Those remain covered by the Windows 10 + Android acceptance runbook in the DGM-MAT backend repository.

## Hosted CI resilience

- Uses Android API 30 and SwiftShader to reduce emulator resource pressure.
- Disables animations and caps the emulator at two cores.
- Raises Gradle wrapper distribution timeout to 120 seconds because hosted CI may have slow access to services.gradle.org.
- Retries the official Maestro installer when its release download transiently returns 5xx.
- Raises Maestro driver startup timeout to 300 seconds.
