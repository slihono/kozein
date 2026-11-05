# Security — Kozein

Report Kozein vulnerabilities through this repository’s private vulnerability reporting feature when it is enabled. Do not include passwords, tokens, private media, personal paths or full settings files in public issues. If private reporting is unavailable, open a minimal issue asking the maintainer for a private channel.

Kozein preserves Anix’s sandboxed extension runtime, loopback proxy guards, redacted account settings and dynamically replaceable LGPL video libraries. Read `AGENTS.md` for the trust boundaries. The browser interface does not execute extensions and accepts only user-selected image/video files.

Native updates are disabled unless the distributor defines `KOZEIN_SITE_URL` at build time. Never configure an update source you do not control. Keep native distribution credentials outside version control.

No security audit of the complete inherited Rust engine is claimed by this distribution. Consult `verification/REPORT.md` for checks actually performed.
