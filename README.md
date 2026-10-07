# KPMG WorkBench Design System

React + Angular component libraries on a shared token/CSS layer, laid out like the KRAFT design system so each can be deployed as its own Storybook and linked from the KPMG storybook portal.

```text
.
├── packages/
│   ├── tokens/    @designkpmg/tokens   CSS custom properties (src/tokens.css → dist/tokens.css)
│   ├── ui/        @designkpmg/ui       React components — source of truth for markup + CSS
│   ├── styles/    @designkpmg/styles   tokens + every component CSS bundled (dist/index.css)
│   └── angular/   @designkpmg/angular  Angular 20 standalone components mirroring ui
├── apps/
│   ├── react/     Vite demo app consuming @designkpmg/ui
│   └── angular/   Dependency manifest for the Angular/Storybook toolchain (no code)
├── .storybook/           React Storybook   (port 6006)
├── .storybook-angular/   Angular Storybook (port 6007)
└── angular.json          Angular workspace (library build + Storybook targets)
```

Component CSS lives next to the React component (`packages/ui/src/components/<Name>/<Name>.css`). `@designkpmg/styles` collects it, so the Angular components render byte-identical styles with zero duplicated CSS.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Installs all workspaces |
| `npm run storybook` | React Storybook → http://localhost:6006 |
| `npm run storybook:angular` | Builds tokens + styles + Angular lib, then Angular Storybook → http://localhost:6007 |
| `npm run build-storybook` | Static React Storybook → `storybook-static/` |
| `npm run build-storybook:angular` | Static Angular Storybook → `storybook-static-angular/` |
| `npm run build:angular-lib` | Library only → `packages/angular/dist/` |
| `npm run dev` | React demo app |

Deploy `storybook-static/` and `storybook-static-angular/` as two sites. Both use the story titles `Components/<Name>`, so story ids match (`components-<slug>--docs`) and the portal can build the React and Angular URLs from one slug.

## Angular components

Standalone, `OnPush`, signal inputs; selectors are `kpmg-<name>`. Each mirrors its React counterpart's DOM and `kpmg-*` classes. All 18 React components are ported.

| Selector | Mirrors | Notes |
|---|---|---|
| `<kpmg-button>` | `Button` | Label is projected content; `iconLeft`/`icon`/`iconRight` take an `<ng-template>` ref |
| `<kpmg-icon-button>` | `IconButton` | Icon is projected content |
| `<kpmg-badge>` | `Badge` | Set `anchored` when wrapping an element (React infers it from `children`) |
| `<kpmg-chip>` | `Chip` | `interactive` / `deletable` inputs replace React's `onClick` / `onDelete` presence checks; outputs `chipClick`, `chipDelete` |
| `<kpmg-checkbox>` | `Checkbox` | `[(checked)]`; `id` is `inputId` |
| `<kpmg-switch>` | `Switch` | `[(checked)]` or `defaultChecked`; label/helper are strings |
| `<kpmg-textarea>` | `Textarea` | `[(value)]` or `defaultValue`; `id` is `textareaId` |
| `<kpmg-tooltip>` | `Tooltip` | Anchor is projected content; `static` for standalone; custom body via `contentTemplate`; `[(open)]` |
| `<kpmg-banner>` | `Banner` | `icon`/`action` are templates; `iconClickable` / `dismissible` inputs; outputs `iconClick`, `closed` |
| `<kpmg-breadcrumbs>` | `Breadcrumbs` | Outputs `itemClick`, `routeToggle`, `bookmarkToggle`; icon overrides are templates |
| `<kpmg-divider>` | `Dividers` | Same case-insensitive `orientation` / `theme` / `width` values |
| `<kpmg-file-uploader>` | `FileUploader` | Outputs `filesSelected`, `filesDropped`; `id` is `inputId` |
| `<kpmg-list>` + `<li kpmg-list-item>` | `List` / `ListItem` | `items` data or projected rows; `interactive` replaces `onClick` presence |
| `<kpmg-progress-indicator>` | `ProgressIndicator` | Linear/circular, determinate/indeterminate |
| `<kpmg-slider>` | `Slider` | `[(value)]` or `defaultValue`; output `changed` |
| `<kpmg-snackbar>`, `<kpmg-snackbar-container>`, `SnackbarService` + `<kpmg-snackbar-outlet>` | `Snackbar`, `SnackbarContainer`, `SnackbarProvider`/`useSnackbar` | Imperative API is an injectable service |
| `<kpmg-tab>` + `<button kpmg-tab-item>` | `Tab` / `TabItem` | `items` data or projected tabs; `[(value)]`; arrow/Home/End navigation |
| `<kpmg-menu>` + `button[kpmg-menu-item]`, `div[kpmg-menu-group]`, `hr[kpmg-menu-divider]` | `Menu`, `MenuItem`, `MenuGroup`, `MenuDivider` | Trigger via `kpmgMenuTrigger` slot or `trigger` template (`{ open, toggle }`); `[(open)]` |
| `<kpmg-dropdown-menu>`, `<kpmg-dropdown-item-group>`, `button[kpmg-dropdown-base]` | `DropdownMenu`, `DropdownItemGroup`, `DropdownBase` | |
| `<kpmg-navigation-menu>` | `NavigationMenu` | Items support `group` / `divider` entries |
| `<kpmg-overflow-menu>` | `OverflowMenu` | Set `customContent` to project your own popover body |
| `<kpmg-assistant-menu>`, `<kpmg-assistant-card>` | `AssistantMenu`, `AssistantCard` | Set `customContent` to project your own body |

Usage:

```ts
import { ButtonComponent, ChipComponent } from '@designkpmg/angular';

@Component({
  imports: [ButtonComponent, ChipComponent],
  template: `<kpmg-button variant="tonal">Save</kpmg-button>`,
})
export class Demo {}
```

Load `@designkpmg/styles/index.css` once at the app root.

### Adding the next component

1. Read `packages/ui/src/components/<Name>/<Name>.jsx` and `.css`.
2. Create `packages/angular/src/lib/<name>/<name>.component.ts` (+ `.stories.ts`, title `Components/<Name>`), keeping the `kpmg-<name>` selector, input names and CSS classes.
3. Export it from `packages/angular/src/public-api.ts`.
