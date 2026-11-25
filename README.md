# m3-vue

Material 3 styles, components and helpers for Vue 3, shared by
[ErgScan](https://github.com/nickknissen/ergscan) and garmin-dashboard. They started in ErgScan
and were copied into garmin-dashboard. This package replaces both copies.

- `m3-vue/style.css`: tokens (light and dark, with a `-tracking` token per type role), the app
  shell, screen transitions, buttons and state layers, grouped lists, segmented buttons, colour
  swatches, banners, snackbar, dropdown menu, dialog, disclosure, small text button, filled text
  field, checkbox, loading bar, navigation bar and rail, wider screens, print
- `m3-vue/components/MdIcon.vue`, `MdDialog.vue`, `MdMenu.vue`, `MdSelect.vue`, `MdListDetail.vue`, `MdSnackbar.vue`
- `m3-vue/ui/confirm`, `menu`, `popoverMenu`, `keyboardNav`, `mediaQuery`, `ripple`, `listPane`, `snackbar`, `theme`, `palette`
- `m3-vue/icons`: the icon registry `MdIcon` draws from

## Using it

It ships its source (`.vue`, `.ts`, `?raw` SVG imports), so the app's Vite build compiles it.
Install a tag:

```sh
npm install github:nickknissen/m3-vue#v0.1.0
```

In `vite.config.ts`, keep Vite from pre-bundling it, and let vitest compile it. Its colour
library, `@material/material-color-utilities`, imports without file extensions, which Node
won't load, so vitest compiles that too:

```ts
optimizeDeps: { exclude: ['m3-vue'] },
test: { server: { deps: { inline: ['@material/material-color-utilities', 'm3-vue'] } } },
```

Import the styles before the app's own, so the app's rules win:

```ts
import 'm3-vue/style.css';
import './style.css';
```

### Icons

`MdIcon` draws icons from `@material-symbols/svg-400` (rounded). The package has the few its
own components use. The app lists the rest, declares their names so `name` is type-checked, and
registers them before mounting:

```ts
// src/ui/icons.ts
import { icon } from 'm3-vue/icons';
import add from '@material-symbols/svg-400/rounded/add.svg?raw';
import history from '@material-symbols/svg-400/rounded/history.svg?raw';
import historyFill from '@material-symbols/svg-400/rounded/history-fill.svg?raw';

export const ICONS = { add: icon(add), history: icon(history, historyFill) };

type AppIcons = typeof ICONS;
declare module 'm3-vue/icons' {
  interface Icons extends AppIcons {}
}

// src/main.ts
import { registerIcons } from 'm3-vue/icons';
import { ICONS } from './ui/icons';

registerIcons(ICONS);
```

### Dialog

`MdDialog` shows what `createConfirm()` (`m3-vue/ui/confirm`) is waiting on. Its cancel
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

Mount `MdSnackbar` once in the app shell, then call `snackbar()` (`m3-vue/ui/snackbar`) from
anywhere. A new snackbar replaces the one showing. It stays 5 s, or 8 s with an action, and
waits while the pointer or focus is on it. The promise says how it ended: `'action'`,
`'timeout'` or `'replaced'`.

```ts
if ((await snackbar('Step deleted', { action: 'Undo' })) === 'action') restore();
// Stays until Reload is tapped (or another snackbar replaces it):
void snackbar('Update available', { action: 'Reload', duration: Infinity }).then((how) => how === 'action' && reload());
```

### Theme and accent colour

`m3-vue/ui/theme` keeps the light/dark choice (`system`, `light`, `dark`) and an accent colour
in storage under the app's keys, and `applyTheme` puts them on the page: `data-theme` on the
root, which style.css follows, and the colour tokens from a palette that `m3-vue/ui/palette`
generates from the accent's seed (Material 3 tonal spot), or style.css's own for `default`.
It also sets each `<meta name="theme-color">` to the matching surface. Apply the saved choice
before mounting, so the first paint is right:

```ts
import { applyTheme, loadAccent, loadTheme } from 'm3-vue/ui/theme';

try {
  applyTheme(document, loadTheme(localStorage, 'app.theme'), loadAccent(localStorage, 'app.accent'));
} catch {
  applyTheme(document, 'system');
}
```

For the settings, `.segmented` with `role="radio"` buttons picks the theme, and `.swatches`
with `.swatch` radio buttons the accent; give each swatch `accentSwatch(accent)` as
`--swatch-1`, `--swatch-2` and `--swatch-3`. `handleRadioKeydown` (`m3-vue/ui/keyboardNav`)
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
`::before`. `.compact` is a 32dp text button with a 48dp target.

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

Release by tagging (`v0.2.0`, …) and moving each app to the new tag. A change to the styles
shows in both apps, so look at both before tagging.

## License

[MIT](LICENSE).
