# getpaletto.com

The website for [Paletto](https://getpaletto.com), the iOS app that frames a photo with its colour palette.

The source lives in the Paletto app repo under `Marketing/website/` and is published here with `Marketing/publish-site.sh`. Edit it there, not here.

To switch the site from "coming soon" to the App Store download buttons, set `LIVE = true` in `site.js`.

`CNAME` (getpaletto.com) and `.well-known/apple-app-site-association` (look links open the app from Paletto 1.2) must stay; `publish-site.sh` refuses to publish without them, and `look.html` must stay at that path.
