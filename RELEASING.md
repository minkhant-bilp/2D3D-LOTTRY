# Releasing

The app updates itself over the air (EAS Update) for anything that is only
JavaScript, styles, translations or images. Native changes — a new native
package, permissions, `app.json` plugins, an Expo SDK bump — change the
`fingerprint` runtime version and need a new binary instead.

Needs the EAS CLI: `npm install -g eas-cli`, then `eas login`.

## Normal update

1. `npm run update:preview -- --message "what changed"`
2. Open the **preview** build, background it and come back (or cold start) —
   the "Update ready" dialog appears. Restart and check the change.
3. `npm run update:prod -- --group <group id from step 1>`

Users get a "Restart / Later" dialog. "Later" applies it on the next cold start.

## Critical update

For a fix every user must be on now (wrong odds, a broken bet request, …).

1. Same preview test as above.
2. `npm run update:critical -- --group <group id> --message "what changed"`

This republishes to production and sets `ota_min_created_at` on the backend.
Every older bundle reloads onto it — during the splash on cold start, or as
soon as the user leaves the bet, deposit, withdrawal, bank and login screens.

Requires `OTA_PUBLISH_TOKEN` in `.env.local` (gitignored), equal to the
backend's. The admin dashboard (Settings → App update) can set or clear the
same value by hand, e.g. if the script published but the backend call failed.

## Rolling back

`eas update:rollback` (or republish an older group). To stop forcing, clear the
minimum in the dashboard.

## Native release

`eas build -p android --profile production-apk` (or `production` for an AAB).
Builds carry a new fingerprint, so OTA updates published before them never
reach them, and vice versa.
