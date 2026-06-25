// ============================================================================
// DISPATCH / NOTIFICATION CONFIG
// Single source of truth for where alerts are sent. The address below is a
// PLACEHOLDER for demonstration only - replace DISPATCH_EMAIL with the secure
// hospital distribution address (e.g. an institutional, access-controlled
// mailbox) before any real deployment. Centralizing it here means there is
// exactly one line to change, and no personal address is scattered through
// the UI.
//
// IMPORTANT: regardless of how secure the RECIPIENT is, no message assembled
// for this address may contain patient data. The transmit path scrubs and
// asserts (see phiGuard.assertTransmitSafe) before composing anything. A
// secure mailbox protects data in transit and at rest on the hospital side;
// it does NOT make it acceptable to put PHI in an inventory notification in
// the first place.
// ============================================================================

export const DISPATCH_EMAIL = "REPLACE_WITH_SECURE_HOSPITAL_ADDRESS@example.org";

// Display label shown in the UI in place of the raw address, so the actual
// mailbox isn't rendered into screenshots/printouts unnecessarily.
export const DISPATCH_LABEL = "Secure Hospital Inventory Coordinator";

// Whether dispatch is currently configured. While the placeholder is in place,
// the UI can warn that real dispatch is not yet wired up rather than silently
// emailing a non-existent address.
export const DISPATCH_CONFIGURED = !DISPATCH_EMAIL.startsWith("REPLACE_WITH");
