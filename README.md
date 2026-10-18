# DGM-MAT-Mobile — Remote Chat Cockpit

## Purpose
A lightweight mobile chat/PWA surface for sending requests to and viewing responses from the DGM-MAT brain on the PC.

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
