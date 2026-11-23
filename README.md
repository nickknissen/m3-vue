# m3-vue

Material 3 styles, components and helpers for Vue 3, shared by
[ErgScan](https://github.com/nickknissen/ergscan) and garmin-dashboard. They started in ErgScan
and were copied into garmin-dashboard. This package replaces both copies.

- `m3-vue/style.css`: tokens (light and dark), the app shell, screen transitions, buttons and
  state layers, grouped lists, banners, snackbar, dropdown menu, dialog, disclosure, navigation
  bar and rail, wider screens, print
- `m3-vue/components/MdIcon.vue`, `MdDialog.vue`, `MdMenu.vue`, `MdSelect.vue`, `MdListDetail.vue`, `MdSnackbar.vue`
- `m3-vue/ui/confirm`, `menu`, `popoverMenu`, `keyboardNav`, `mediaQuery`, `ripple`, `listPane`, `snackbar`
- `m3-vue/icons`: the icon registry `MdIcon` draws from

## Using it

It ships its source (`.vue`, `.ts`, `?raw` SVG imports), so the app's Vite build compiles it.
Install a tag:

```sh
npm install github:nickknissen/m3-vue#v0.1.0
```

In `vite.config.ts`, keep Vite from pre-bundling it, and let vitest compile it:

```ts
optimizeDeps: { exclude: ['m3-vue'] },
test: { server: { deps: { inline: ['m3-vue'] } } },
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

## Changing it

```sh
npm install
npm run check    # type-check and test
```

Release by tagging (`v0.2.0`, …) and moving each app to the new tag. A change to the styles
shows in both apps, so look at both before tagging.

## License

[MIT](LICENSE).
