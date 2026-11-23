import arrowDropDown from '@material-symbols/svg-400/rounded/arrow_drop_down.svg?raw';
import check from '@material-symbols/svg-400/rounded/check.svg?raw';
import moreVert from '@material-symbols/svg-400/rounded/more_vert.svg?raw';

/** An icon as MdIcon draws it: the SVG's path markup, outlined and filled. */
export type IconMarkup = readonly [outlined: string, filled: string];

const inner = (svg: string) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

/**
 * An icon from `@material-symbols/svg-400`, imported with `?raw`. Pass the `-fill` file too
 * when the filled style differs.
 */
export const icon = (outlined: string, filled = outlined): IconMarkup => [inner(outlined), inner(filled)];

/** The icons this package's components draw. */
export const PACKAGE_ICONS = {
  arrow_drop_down: icon(arrowDropDown),
  check: icon(check),
  more_vert: icon(moreVert),
};

type PackageIcons = typeof PACKAGE_ICONS;

/**
 * Every icon MdIcon can draw: the package's own, and the app's. An app adds its own set here,
 * so a name it doesn't have is a type error:
 *
 *     export const ICONS = { add: icon(add), … };
 *     type AppIcons = typeof ICONS;
 *     declare module 'm3-vue/icons' {
 *       interface Icons extends AppIcons {}
 *     }
 *
 * and gives them to MdIcon with `registerIcons(ICONS)` before the app mounts.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Icons extends PackageIcons {}

export type IconName = keyof Icons & string;

const registry = new Map<string, IconMarkup>(Object.entries(PACKAGE_ICONS));

/** Make the app's icons drawable by MdIcon. */
export function registerIcons(icons: Record<string, IconMarkup>) {
  for (const [name, markup] of Object.entries(icons)) registry.set(name, markup);
}

/** An icon's markup, or '' (with a warning in development) for one that was never registered. */
export function iconMarkup(name: IconName, filled = false): string {
  const markup = registry.get(name);
  if (!markup) {
    if (import.meta.env?.DEV) console.warn(`MdIcon: no icon named "${name}". Add it to the app's icons and registerIcons() them.`);
    return '';
  }
  return markup[filled ? 1 : 0];
}
