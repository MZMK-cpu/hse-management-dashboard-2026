# HSE ONE — Portal HSE (Prototype)
Standalone, non-disruptive prototype inside `/hse-portal/` of `MZMK-cpu/hse-management-dashboard-2026`.

## URL
If GitHub Pages deploys from `main` / root:
https://mzmk-cpu.github.io/hse-management-dashboard-2026/hse-portal/

The original dashboard at the site root is unchanged.

## Functions in this prototype
- Navigation: NeMSO / Safety Observation, WPI, HIRARC, Incident & MVI, OVR, CAPAR, Toolbox Talk, Training, PTW
- Live counters calculated from browser-local records
- Reports by depot, search, status filter, detail view and closure workflow
- Form creation with category, PIC, due date, vehicle, driver and image evidence up to 500 KB
- HIRARC likelihood × severity score in record details
- Local JSON import/export, CSV export
- Responsive desktop/mobile layout

## Important limitations
This is a **front-end concept / demonstrator only**, not an operational company HSE system:
- Sample data is explicitly marked DEMO.
- Data, including images, stays in the local browser via localStorage. It is not centralized or shared.
- No real authentication, access control, audit trail, server-side file storage or automatic email.
- **Do not enter personal, confidential or actual HSE case data into the prototype.**
- GitHub Pages is a static host and should not be used alone to provide secure login or trusted form submission.
- Email routing desired for production: `zairullizam.mk@fgvholdings.com`.

## Production next steps
1. Confirm process and report field definitions.
2. Move storage to an authenticated backend (e.g., Supabase or an approved internal stack).
3. Set up company SSO/RBAC and authorization by depot and role.
4. Secure attachments on approved storage; virus scanning, retention policy, and restricted URLs.
5. Configure server-side email notifications and failure monitoring.
6. Add immutable action/audit history, master data and approval workflow.
7. Import validated existing HSE dashboard and OVR Excel datasets.
8. Security review, test environment, backups and UAT before employee rollout.

**Disclaimer:** Inspired by common OSH system workflows; not affiliated with the SHERMAN vendor.
