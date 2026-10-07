import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MenuIconComponent } from './menu-icon.component';

export type MenuType = 'dropdown' | 'navigation' | 'overflow' | 'assistant';
export type MenuDensity = 'small' | 'medium' | 'large' | 'navigation';
export type MenuPlacement = 'bottom-left' | 'bottom-right' | 'bottom-center' | 'top-left' | 'top-right' | 'top-center';
export type MenuItemType = 'item' | 'checklist' | 'icon' | 'navigation';
export type MenuItemState = 'enabled' | 'hovered' | 'pressed' | 'disabled' | 'error';

/** Context a `trigger` template receives. */
export interface MenuTriggerContext {
  open: boolean;
  toggle: () => void;
}

/**
 * WorkBench Menu — mirrors packages/ui/src/components/Menu/Menu.jsx (core `Menu`).
 *
 * - Items are projected `<button kpmg-menu-item>`, `<div kpmg-menu-group>` and
 *   `<hr kpmg-menu-divider>` elements.
 * - Triggers: project any element with the `kpmgMenuTrigger` attribute, or pass a
 *   `trigger` template (context: `{ open, toggle }`, React's function form).
 * - `open` is a model (`[(open)]`). `onSelect` → `itemSelected`, `onClose` → `closed`.
 */
@Component({
  selector: 'kpmg-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    style: 'display: contents',
    '(document:mousedown)': 'onDocumentMouseDown($event)',
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    @if (inline()) {
      <ng-container [ngTemplateOutlet]="menuBody" />
    } @else {
      <div class="kpmg-menu-wrapper">
        @if (trigger(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ open: isOpen(), toggle: toggleFn }" />
        } @else {
          <div role="button" tabindex="0" (click)="toggle()" (keydown.enter)="toggle()" (keydown.space)="$event.preventDefault(); toggle()">
            <ng-content select="[kpmgMenuTrigger]" />
          </div>
        }
        @if (isOpen()) {
          <ng-container [ngTemplateOutlet]="menuBody" />
        }
      </div>
    }

    <ng-template #menuBody>
      <div #menu [class]="classes()" [style.width]="widthValue()" [attr.role]="role()" tabindex="-1" (keydown)="onMenuKeydown($event)">
        @if (headerTemplate(); as tpl) {
          <div class="kpmg-menu__header"><ng-container [ngTemplateOutlet]="tpl" /></div>
        } @else if (headerText()) {
          <div class="kpmg-menu__header">{{ headerText() }}</div>
        }
        <ng-content />
      </div>
    </ng-template>
  `,
})
export class MenuComponent {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly menuEl = viewChild<ElementRef<HTMLElement>>('menu');

  /** Open state. Two-way bindable: `[(open)]`. */
  readonly open = model(true);
  readonly trigger = input<TemplateRef<MenuTriggerContext> | null>(null);
  readonly placement = input<MenuPlacement>('bottom-left');
  readonly type = input<MenuType>('dropdown');
  readonly density = input<MenuDensity>('medium');
  /** Header as plain text… */
  readonly header = input<string | TemplateRef<unknown> | null>(null);
  readonly width = input<number | string | undefined>(undefined);
  readonly elevation = input(true, { transform: booleanAttribute });
  /** Render in place (no popover wrapper, trigger or outside-click handling). */
  readonly inline = input(false, { transform: booleanAttribute });
  readonly closeOnSelect = input(true, { transform: booleanAttribute });
  readonly role = input('menu');
  readonly className = input('');

  /** A menu item was chosen: its `value` (or label). */
  readonly itemSelected = output<{ value: unknown; event: Event }>();
  readonly closed = output<void>();

  protected readonly isOpen = linkedSignal(() => this.open());
  protected readonly toggleFn = () => this.toggle();

  protected readonly headerTemplate = computed(() => {
    const h = this.header();
    return h instanceof TemplateRef ? h : null;
  });
  protected readonly headerText = computed(() => {
    const h = this.header();
    return typeof h === 'string' ? h : null;
  });
  protected readonly widthValue = computed(() => {
    const w = this.width();
    return w === undefined ? null : typeof w === 'number' ? `${w}px` : w;
  });

  protected readonly classes = computed(() =>
    [
      'kpmg-menu',
      `kpmg-menu--${this.type()}`,
      this.inline() ? 'kpmg-menu--inline' : `kpmg-menu--popover kpmg-menu--placement-${this.placement()}`,
      !this.elevation() ? 'kpmg-menu--flat' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected toggle(): void {
    const next = !this.isOpen();
    this.setOpen(next);
  }

  private setOpen(next: boolean): void {
    this.isOpen.set(next);
    this.open.set(next);
    if (!next) this.closed.emit();
  }

  protected onDocumentMouseDown(event: MouseEvent): void {
    if (this.inline() || !this.isOpen()) return;
    if (!this.hostEl.nativeElement.contains(event.target as Node)) this.setOpen(false);
  }

  protected onEscape(): void {
    if (!this.inline() && this.isOpen()) this.setOpen(false);
  }

  /** Called by child items. */
  select(value: unknown, event: Event): void {
    this.itemSelected.emit({ value, event });
    if (!this.inline() && this.closeOnSelect()) this.setOpen(false);
  }

  /** Resolved density for child items. */
  resolvedDensity(): string {
    return this.type() === 'navigation' ? 'navigation' : this.density();
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    const root = this.menuEl()?.nativeElement;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>('.kpmg-menu-item:not(:disabled):not(.kpmg-menu-item--disabled)'));
    if (!items.length) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (event.key === 'ArrowDown') next = current < items.length - 1 ? current + 1 : 0;
    else if (event.key === 'ArrowUp') next = current > 0 ? current - 1 : items.length - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    if (next === -1) return;
    event.preventDefault();
    items[next].focus();
  }
}

/**
 * A menu row: `<button kpmg-menu-item label="Open"></button>`.
 * Mirrors `MenuItem` in Menu.jsx. `icon`/`prefix`/`suffix` are `<ng-template>`
 * refs; `actionButton` is `true` (plus icon) or a template, and emits `actionClick`.
 */
@Component({
  selector: 'button[kpmg-menu-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MenuIconComponent],
  host: {
    type: 'button',
    '[class]': 'classes()',
    '[disabled]': 'isDisabled()',
    '[attr.aria-checked]': 'isChecklist() ? isSelected() : null',
    '[attr.aria-disabled]': 'isDisabled()',
    '[attr.role]': 'itemRole()',
    '[attr.tabindex]': 'isDisabled() ? -1 : 0',
    '(click)': 'onClick($event)',
  },
  template: `
    @if (isChecklist()) {
      @if (showCheckmark()) {
        <span class="kpmg-menu-item__checkbox-indicator" aria-hidden="true">
          <kpmg-menu-icon [name]="isSelected() ? 'checkbox-circle' : 'checkbox-unchecked'" [size]="16" />
        </span>
      }
    } @else if (type() === 'icon') {
      @if (showLeadingIcon()) {
        <span class="kpmg-menu-item__prefix" aria-hidden="true">
          @if (itemPrefix(); as tpl) { <ng-container [ngTemplateOutlet]="tpl" /> } @else { <kpmg-menu-icon name="star" [size]="16" /> }
        </span>
      }
    } @else if (itemPrefix(); as tpl) {
      <span class="kpmg-menu-item__prefix" aria-hidden="true"><ng-container [ngTemplateOutlet]="tpl" /></span>
    }
    <span class="kpmg-menu-item__content">
      <span class="kpmg-menu-item__label">@if (label()) {{{ label() }}} @else {<ng-content />}</span>
      @if (description()) { <span class="kpmg-menu-item__description">{{ description() }}</span> }
    </span>
    @if (badge() !== undefined) {
      <span class="kpmg-menu-item__badge">{{ badge() }}</span>
    } @else if (actionButton()) {
      <span class="kpmg-menu-item__action-btn" (click)="onActionClick($event)">
        @if (actionTemplate(); as tpl) { <ng-container [ngTemplateOutlet]="tpl" /> } @else { <kpmg-menu-icon name="plus" [size]="16" /> }
      </span>
    } @else if (suffix(); as tpl) {
      <span class="kpmg-menu-item__suffix" aria-hidden="true"><ng-container [ngTemplateOutlet]="tpl" /></span>
    } @else if (type() === 'icon' && showTrailingIcon() && isSelected()) {
      <span class="kpmg-menu-item__suffix" aria-hidden="true"><kpmg-menu-icon name="check" [size]="16" /></span>
    }
  `,
})
export class MenuItemComponent {
  private readonly menu = inject(MenuComponent, { optional: true });

  readonly label = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly icon = input<TemplateRef<unknown> | null>(null);
  readonly prefix = input<TemplateRef<unknown> | null>(null);
  readonly suffix = input<TemplateRef<unknown> | null>(null);
  /** Defaults to the menu's density (`navigation` inside a navigation menu). */
  readonly density = input<MenuDensity | undefined>(undefined);
  readonly type = input<MenuItemType>('item');
  readonly selected = input(false, { transform: booleanAttribute });
  readonly state = input<MenuItemState>('enabled');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly destructive = input(false, { transform: booleanAttribute });
  readonly badge = input<string | number | undefined>(undefined);
  /** `true` for the default plus button, or a template for custom content. */
  readonly actionButton = input<boolean | TemplateRef<unknown>>(false);
  readonly value = input<unknown>(undefined);
  readonly roleOverride = input<string | undefined>(undefined, { alias: 'itemRole' });
  readonly showCheckmark = input(true, { transform: booleanAttribute });
  readonly showLeadingIcon = input(true, { transform: booleanAttribute });
  readonly showTrailingIcon = input(true, { transform: booleanAttribute });
  readonly className = input('');

  readonly actionClick = output<Event>();

  protected readonly isChecklist = computed(() => this.type() === 'checklist');
  protected readonly isSelected = computed(() => this.selected());
  protected readonly isDisabled = computed(() => this.disabled() || this.state() === 'disabled');
  private readonly isError = computed(() => this.error() || this.destructive() || this.state() === 'error');
  protected readonly itemPrefix = computed(() => this.prefix() ?? this.icon());
  protected readonly itemRole = computed(() => this.roleOverride() || (this.isChecklist() ? 'menuitemcheckbox' : 'menuitem'));
  protected readonly actionTemplate = computed(() => {
    const a = this.actionButton();
    return a instanceof TemplateRef ? a : null;
  });

  protected readonly classes = computed(() => {
    const density = this.density() || this.menu?.resolvedDensity() || 'medium';
    return [
      'kpmg-menu-item',
      `kpmg-menu-item--${density}`,
      `kpmg-menu-item--type-${this.type()}`,
      this.isSelected() ? 'kpmg-menu-item--selected' : '',
      this.state() === 'hovered' ? 'kpmg-menu-item--hovered' : '',
      this.state() === 'pressed' ? 'kpmg-menu-item--pressed' : '',
      this.isDisabled() ? 'kpmg-menu-item--disabled' : '',
      this.isError() ? 'kpmg-menu-item--error' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' ');
  });

  protected onClick(event: Event): void {
    if (this.isDisabled()) {
      event.preventDefault();
      return;
    }
    this.menu?.select(this.value() !== undefined ? this.value() : this.label(), event);
  }

  protected onActionClick(event: Event): void {
    event.stopPropagation();
    this.actionClick.emit(event);
  }
}

/** `<div kpmg-menu-group title="Recent">…</div>` — mirrors `MenuGroup`. */
@Component({
  selector: 'div[kpmg-menu-group]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "'kpmg-menu-group ' + className()", role: 'group' },
  template: `
    @if (title()) { <div class="kpmg-menu__group-header">{{ title() }}</div> }
    <ng-content />
  `,
})
export class MenuGroupComponent {
  readonly title = input<string | undefined>(undefined);
  readonly className = input('');
}

/** `<hr kpmg-menu-divider />` — mirrors `MenuDivider`. */
@Component({
  selector: 'hr[kpmg-menu-divider]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "'kpmg-menu-divider ' + className()", role: 'separator' },
  template: '',
})
export class MenuDividerComponent {
  readonly className = input('');
}
