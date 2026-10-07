import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  model,
  output,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MenuIconComponent } from './menu-icon.component';
import {
  MenuComponent,
  MenuDividerComponent,
  MenuGroupComponent,
  MenuItemComponent,
  MenuPlacement,
  MenuTriggerContext,
} from './menu.component';

export interface NavigationItemData {
  type?: 'divider' | 'group' | 'item';
  label?: string;
  value?: string;
  /** Group heading. */
  title?: string;
  items?: NavigationItemData[];
  icon?: TemplateRef<unknown>;
  prefix?: TemplateRef<unknown>;
  suffix?: TemplateRef<unknown>;
  badge?: string | number;
  actionButton?: boolean | TemplateRef<unknown>;
  disabled?: boolean;
}

/**
 * Navigation menu with a brand-pill trigger — mirrors `NavigationMenu` in Menu.jsx.
 * Data-driven via `items` (with `group` / `divider` entries), or project menu items.
 * `onSelect` → `itemSelect`, `onClose` → `closed`, `open` is a model.
 */
@Component({
  selector: 'kpmg-navigation-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MenuComponent, MenuItemComponent, MenuGroupComponent, MenuDividerComponent, MenuIconComponent],
  host: { style: 'display: contents' },
  template: `
    <kpmg-menu
      type="navigation"
      density="navigation"
      [open]="inline() ? true : isOpen()"
      [inline]="inline()"
      [trigger]="showTrigger() ? triggerTpl : null"
      [placement]="placement()"
      [width]="width()"
      [header]="header()"
      [className]="className()"
      [closeOnSelect]="closeOnSelect()"
      (closed)="onMenuClosed()"
    >
      @if (items().length) {
        @for (item of items(); track $index) {
          @if (item.type === 'divider') {
            <hr kpmg-menu-divider />
          } @else if (item.type === 'group') {
            <div kpmg-menu-group [title]="item.title">
              @for (sub of item.items ?? []; track $index) {
                <ng-container [ngTemplateOutlet]="row" [ngTemplateOutletContext]="{ item: sub }" />
              }
            </div>
          } @else {
            <ng-container [ngTemplateOutlet]="row" [ngTemplateOutletContext]="{ item: item }" />
          }
        }
      } @else {
        <ng-content />
      }
    </kpmg-menu>

    <ng-template #row let-item="item">
      <button
        kpmg-menu-item
        density="navigation"
        [label]="item.label"
        [prefix]="item.prefix ?? item.icon ?? null"
        [suffix]="item.suffix ?? null"
        [badge]="item.badge"
        [actionButton]="item.actionButton ?? false"
        [selected]="activeItem() === (item.value || item.label)"
        [disabled]="!!item.disabled"
        (click)="itemSelect.emit({ value: item.value || item.label, item: item })"
      ></button>
    </ng-template>

    <ng-template #triggerTpl>
      @if (customTrigger(); as tpl) {
        <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ open: isOpen(), toggle: toggleFn }" />
      } @else {
        <button type="button" class="kpmg-nav-brand-pill" aria-haspopup="menu" [attr.aria-expanded]="isOpen()" (click)="toggle()">
          <span>{{ brandLabel() }}</span>
          <kpmg-menu-icon name="chevron" [direction]="isOpen() ? 'up' : 'down'" [size]="18" />
        </button>
      }
    </ng-template>
  `,
})
export class NavigationMenuComponent {
  readonly brandLabel = input('KPMG');
  /** 'brand-pill' | 'custom' | 'none' (inline). */
  readonly triggerType = input<'brand-pill' | 'custom' | 'none'>('brand-pill');
  readonly customTrigger = input<TemplateRef<MenuTriggerContext> | null>(null);
  readonly header = input<string | TemplateRef<unknown> | null>('Header');
  readonly inline = input(false, { transform: booleanAttribute });
  /** Open state. Two-way bindable: `[(open)]`. */
  readonly open = model<boolean | undefined>(undefined);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  readonly closeOnSelect = input(true, { transform: booleanAttribute });
  readonly items = input<NavigationItemData[]>([]);
  readonly activeItem = input<string | undefined>(undefined);
  readonly placement = input<MenuPlacement>('bottom-left');
  readonly width = input<number | string>(263);
  readonly className = input('');

  readonly itemSelect = output<{ value: string | undefined; item: NavigationItemData }>();
  readonly closed = output<void>();

  protected readonly isOpen = linkedSignal(() => this.open() ?? this.defaultOpen());
  protected readonly toggleFn = () => this.toggle();
  protected readonly showTrigger = computed(() => !(this.inline() || this.triggerType() === 'none'));

  protected toggle(): void {
    const next = !this.isOpen();
    this.isOpen.set(next);
    this.open.set(next);
    if (!next) this.closed.emit();
  }

  protected onMenuClosed(): void {
    this.isOpen.set(false);
    this.open.set(false);
    this.closed.emit();
  }
}
