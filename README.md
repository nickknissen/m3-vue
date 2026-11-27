# m3-vue

Material 3 styles, components and helpers for Vue 3, shared by
[ErgScan](https://github.com/nickknissen/ergscan) and garmin-dashboard. They started in ErgScan
and were copied into garmin-dashboard. This package replaces both copies.

- `@nickknissen/m3-vue/style.css`: tokens (light and dark, with a `-tracking` token per type role), the app
  shell, screen transitions, buttons and state layers, grouped lists, segmented buttons,
  connected button group, colour swatches, banners, snackbar, dropdown menu, dialog, disclosure,
  small text button, filled text field, checkbox, loading bar, loading indicator, navigation bar
  and rail, wider screens, print
- `@nickknissen/m3-vue/components/MdIcon.vue`, `MdDialog.vue`, `MdMenu.vue`, `MdSelect.vue`, `MdListDetail.vue`, `MdSnackbar.vue`
- `@nickknissen/m3-vue/ui/confirm`, `menu`, `popoverMenu`, `keyboardNav`, `mediaQuery`, `ripple`, `listPane`, `snackbar`, `theme`, `palette`
- `@nickknissen/m3-vue/icons`: the icon registry `MdIcon` draws from

## Using it

It ships its source (`.vue`, `.ts`, `?raw` SVG imports), so the app's Vite build compiles it.
Install it from npm, at an exact version:

```sh
npm install --save-exact @nickknissen/m3-vue
```

Not from GitHub (`github:nickknissen/m3-vue#v0.8.0`): Renovate can't update the lockfile for
a git dependency, and `npm ci` then needs git, which slim Docker images don't have. The
unscoped `m3-vue` on npm is the old name, only ever at 0.8.0.

In `vite.config.ts`, keep Vite from pre-bundling it, and let vitest compile it. Its colour
library, `@material/material-color-utilities`, imports without file extensions, which Node
won't load, so vitest compiles that too:

```ts
optimizeDeps: { exclude: ['@nickknissen/m3-vue'] },
test: { server: { deps: { inline: ['@material/material-color-utilities', '@nickknissen/m3-vue'] } } },
```

Import the styles before the app's own, so the app's rules win:

```ts
import '@nickknissen/m3-vue/style.css';
import './style.css';
```

### Icons

`MdIcon` draws icons from `@material-symbols/svg-400` (rounded). The package has the few its
own components use. The app lists the rest, declares their names so `name` is type-checked, and
registers them before mounting:

```ts
// src/ui/icons.ts
import { icon } from '@nickknissen/m3-vue/icons';
import add from '@material-symbols/svg-400/rounded/add.svg?raw';
import history from '@material-symbols/svg-400/rounded/history.svg?raw';
import historyFill from '@material-symbols/svg-400/rounded/history-fill.svg?raw';

export const ICONS = { add: icon(add), history: icon(history, historyFill) };

type AppIcons = typeof ICONS;
declare module '@nickknissen/m3-vue/icons' {
  interface Icons extends AppIcons {}
}

// src/main.ts
import { registerIcons } from '@nickknissen/m3-vue/icons';
import { ICONS } from './ui/icons';

registerIcons(ICONS);
```

### Dialog

`MdDialog` shows what `createConfirm()` (`@nickknissen/m3-vue/ui/confirm`) is waiting on. Its cancel
button says "Cancel"; pass `cancel-label` for another language.

### List-detail

`MdListDetail` puts a list beside the open item, with a divider to drag (or move with the arrow
keys) and a button to hide the list. The width is kept in localStorage under `storage-key`, or
in the app's own state with `v-model:pane` (see `ui/listPane` to load and save it). Without
`split`, only the item shows and the wrappers take no part in the layout, so pass whether the
window is wide enough:

```vue
<MdListDetail :split="large" storage-key="app.activityList" list-label="Recent activities" :width="{ min: 280, max: 600, initial: 420 }">
  <template #list><ActivityList /></template>
  <ActivityDetail />
</MdListDetail>
```

### Snackbar

Mount `MdSnackbar` once in the app shell, then call `snackbar()` (`@nickknissen/m3-vue/ui/snackbar`) from
anywhere. A new snackbar replaces the one showing. It stays 5 s, or 8 s with an action, and
waits while the pointer or focus is on it. The promise says how it ended: `'action'`,
`'timeout'` or `'replaced'`.

```ts
if ((await snackbar('Step deleted', { action: 'Undo' })) === 'action') restore();
// Stays until Reload is tapped (or another snackbar replaces it):
void snackbar('Update available', { action: 'Reload', duration: Infinity }).then((how) => how === 'action' && reload());
```

### Theme and accent colour

`@nickknissen/m3-vue/ui/theme` keeps the light/dark choice (`system`, `light`, `dark`) and an accent colour
in storage under the app's keys, and `applyTheme` puts them on the page: `data-theme` on the
root, which style.css follows, and the colour tokens from a palette that `@nickknissen/m3-vue/ui/palette`
generates from the accent's seed (Material 3 tonal spot), or style.css's own for `default`.
It also sets each `<meta name="theme-color">` to the matching surface. Apply the saved choice
before mounting, so the first paint is right:

```ts
import { applyTheme, loadAccent, loadTheme } from '@nickknissen/m3-vue/ui/theme';

try {
  applyTheme(document, loadTheme(localStorage, 'app.theme'), loadAccent(localStorage, 'app.accent'));
} catch {
  applyTheme(document, 'system');
}
```

Colours of the app's own, outside the scheme's roles (chart series, kinds of sport), go in as a
fourth argument, keyed by custom property. `applyTheme` sets them on the root, and with an
accent turns each hue toward its seed (Material 3 harmonization: at most 15°, tone kept), so
they sit with the accent's palette. Pass the same ones on every call, and keep them out of the
stylesheet, so there's one source:

```ts
const COLORS = { '--c-hr': { light: '#c62828', dark: '#ff8a80' } };
applyTheme(document, theme, accent, COLORS);
```

For the settings, `.connected` with `role="radio"` buttons picks the theme, and `.swatches`
with `.swatch` radio buttons the accent; give each swatch `accentSwatch(accent)` as
`--swatch-1`, `--swatch-2` and `--swatch-3`. `handleRadioKeydown` (`@nickknissen/m3-vue/ui/keyboardNav`)
moves between the options with the arrow keys.

### Buttons

A bare `<button>` (or `class="button"` on a link) is a text button; `.primary` is filled and
`.tonal` filled tonal. An icon before the label gets the M3 padding by itself. An icon after the
label needs `.icon-end`, since CSS can't see the order:

```html
<button type="button"><MdIcon name="refresh" />Try again</button>
<a class="button tonal icon-end" href="/older">Older<MdIcon name="chevron_right" /></a>
```

Every button reaches 48dp on a touch screen through an `::after` (`--hit-outset`), so a
component that needs its button's `::after` for something else should override `inset`, or use
`::before`. `.compact` is a 32dp text button with a 48dp target, and `.large` a 56dp one.

Pressed, a button squares its corners off and springs back (M3 Expressive's shape morph). That
works through the button's radius being `var(--button-shape, <half its height>)`, which a press
sets; a component with its own `border-radius` doesn't morph. To give your own button the morph,
round it the same way: `border-radius: var(--button-shape, 24px)`.

### Connected button group

M3 Expressive's replacement for the segmented button: pick one of a few options (or several,
with `aria-pressed`). It keeps to one line, and in a block it fills the width.

```html
<nav class="connected" aria-label="Range">
  <a class="tappable" href="?days=7" aria-current="true">7 days</a>
  <a class="tappable" href="?days=28">28 days</a>
</nav>
```

`.segmented` stays for whoever still uses it; Material no longer recommends it.

### Loading indicator

For a wait of 200ms to 5s: a shape morphing through seven Material shapes as it turns. Put it
where the content will appear; `.page` centres it on a page loading its data, `.contained` puts
it on a circle for over other content, and width and height size it (24 to 240dp, 48 by default).
With reduced motion it stays still and fades in and out.

```html
<span class="loading-indicator page" role="progressbar" aria-label="Loading"></span>
```

Its shapes are generated: change them in `scripts/loadingIndicator.ts`, then
`npm run loading-indicator` rewrites them in `style.css`.

### Text field

```html
<label class="field floating">
  <span class="field-label">Email</span>
  <input type="email" placeholder=" " />
</label>
```

Without `floating`, the label is plain text that stays small above the value
(`<label class="field">Email <input /></label>`). `.dense` makes a 48dp field for rows of
fields. Put supporting text under it with `.field-wrap` and `.field-support`.

## Changing it

```sh
npm install
npm run check    # type-check and test
```

To release, set the version in `package.json` (`npm version minor --no-git-tag-version`), merge
it, then tag main with it and push the tag (`git tag v0.10.0 && git push origin v0.10.0`). The
Publish workflow checks the tag matches `package.json`, runs `npm run check` and publishes to
npm. Renovate then opens a PR in ErgScan and garmin-dashboard that moves to it. A change to the
styles shows in both apps, so look at both before tagging.

## License

[MIT](LICENSE).
