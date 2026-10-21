# DGM-MAT-Mobile — Remote Chat Cockpit

## Purpose
A lightweight mobile chat/PWA surface for sending requests to and viewing responses from the DGM-MAT brain on the PC.

## Canonical end-to-end contract

The governing workflow and department model is documented in [DGM-MAT Canonical Operating Model — End-to-End and Departments](https://github.com/AndreVazao/DGM-MAT/blob/main/docs/architecture/DGM-MAT-CANONICAL-OPERATING-MODEL-END-TO-END-AND-DEPARTMENTS-2026-10-21.md). The mobile app must display the PC brain's persisted, verified mission state from request intake through execution, independent validation and final response. UI scaffolding or an APK build does not prove end-to-end operation; unavailable endpoints/capabilities must be shown as unavailable, never simulated as success.

## Authority boundary
- The PC DGM-MAT runtime is the sole execution authority and source of truth.
- Mobile is a client/cockpit, not a second brain, agent orchestrator or policy engine.
- It may display verified state and send user requests through authenticated interfaces; it must not silently approve privileged actions.
- HQ characters and animations, if shown, must reflect actual runtime events.

## Allowed contents
Mobile UI/PWA, conversation presentation, connectivity/discovery client, offline request queue and client-side usability tests.

## Must remain in DGM-MAT core
Reasoning, durable execution state, agent orchestration, governance decisions, memory retrieval and privileged tool execution.

## Connectivity and privacy
Use the documented rendezvous/Tailscale flow. Discovery is not an execution plane. Do not send normal conversation content or secrets to the rendezvous service.

## Validation
Test disconnected/reconnected behavior, authentication, request deduplication, error display, mobile usability and that the client cannot bypass core authorization.


## Android APK build (one-shot)

The mobile client remains a lightweight web/PWA client. The repository defines a reproducible Capacitor Android wrapper and a **manual one-shot APK build workflow**. The workflow is designed to disable itself after a successful APK build and artifact upload, conserving Actions minutes. Failed builds do not disable it, so the failure can be fixed and retried.

## Secure PC pairing and USB recovery

The Android cockpit now includes **Ligação ao PC e recuperação USB**. To authorize remote controls, open `http://127.0.0.1:8181/auth/pairing-code` in a browser on the DGM-MAT PC itself, then enter the one-time code in the mobile panel. The code expires after five minutes and can only be used once; the operator session expires after 30 minutes. Never copy the PC bootstrap token into the APK.

The PC-side DGM-MAT monitor checks USB/ADB every 30 seconds by default and automatically attempts only reversible recovery for offline ADB devices. It does not bypass Android's USB debugging authorization, clear app data, or silently reinstall the APK. Reinstallation requires explicit confirmation and a valid local APK.

The native wrapper must use rendezvous discovery instead of assuming the Android WebView's `localhost` is the DGM-MAT PC. An APK build only proves packaging; actual connection to the PC still depends on a reachable endpoint, valid authentication, and Android network-security compatibility.
