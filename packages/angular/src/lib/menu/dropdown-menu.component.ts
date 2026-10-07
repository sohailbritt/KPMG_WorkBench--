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
  MenuDensity,
  MenuDividerComponent,
  MenuItemComponent,
  MenuItemType,
  MenuPlacement,
  MenuTriggerContext,
} from './menu.component';

export type DropdownStyle = 'default' | 'gradient' | 'branded' | 'card';
export type DropdownSize = 'small' | 'medium' | 'large' | 'branded' | 'none';
export type DropdownBaseState = 'enabled' | 'pressed' | 'filled';

export interface DropdownItemData {
  type?: 'divider' | MenuItemType;
  label?: string;
  value?: string;
  description?: string;
  disabled?: boolean;
  error?: boolean;
  selected?: boolean;
  prefix?: TemplateRef<unknown>;
  suffix?: TemplateRef<unknown>;
}

/**
 * The dropdown trigger button — mirrors `DropdownBase` in Menu.jsx.
 * Use as `<button kpmg-dropdown-base label="Options" [open]="open"></button>`.
 */
@Component({
  selector: 'button[kpmg-dropdown-base]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MenuIconComponent],
  host: {
    type: 'button',
    '[class]': 'classes()',
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'open()',
  },
  template: `
    @if (isBranded()) {
      <span style="letter-spacing: 0.5px">{{ label() || 'KPMG' }}</span>
      <kpmg-menu-icon name="chevron" [direction]="open() ? 'up' : 'down'" [size]="18" />
    } @else {
      <span>{{ label() }}</span>
      <kpmg-menu-icon name="chevron" [direction]="open() ? 'up' : 'down'" [size]="isCard() ? 20 : 16" />
    }
  `,
})
export class DropdownBaseComponent {
  readonly styleType = input<DropdownStyle>('default');
  readonly size = input<DropdownSize>('medium');
  /** `true` = pill/card container; `false` = ghost text. */
  readonly background = input(true, { transform: booleanAttribute });
  readonly state = input<DropdownBaseState>('enabled');
  readonly open = input(false, { transform: booleanAttribute });
  readonly label = input('Options');
  readonly className = input('');

  protected readonly isCard = computed(() => this.styleType() === 'card');
  protected readonly isBranded = computed(() => this.styleType() === 'branded' || this.size() === 'branded');

  protected readonly classes = computed(() => {
    const card = this.isCard();
    const branded = this.isBranded();
    let style: string;
    if (card) style = this.state() === 'filled' ? 'kpmg-dropdown-base--card-filled' : 'kpmg-dropdown-base--card-outlined';
    else if (branded) style = 'kpmg-dropdown-base--branded';
    else if (this.styleType() === 'gradient') style = 'kpmg-dropdown-base--gradient';
    else style = this.background() ? 'kpmg-dropdown-base--default-pill' : 'kpmg-dropdown-base--default-ghost';
    return [
      'kpmg-dropdown-base',
      style,
      !card && !branded ? `kpmg-dropdown-base--size-${this.size()}` : '',
      this.open() ? 'kpmg-dropdown-base--open' : '',
      this.state() === 'pressed' ? 'kpmg-dropdown-base--pressed' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' ');
  });
}

const DEFAULT_GROUP_ITEMS: DropdownItemData[] = [
  { label: 'Option 1', value: 'Option 1', selected: true },
  { type: 'divider' },
  { label: 'Option 2', value: 'Option 2', selected: true },
  { label: 'Option 3', value: 'Option 3', selected: true },
  { label: 'Option 4', value: 'Option 4', selected: true },
  { label: 'Option 5', value: 'Option 5', selected: true },
  { type: 'divider' },
  { label: 'Option 6', value: 'Option 6', selected: true },
];

/**
 * Checklist / item-list group — mirrors `DropdownItemGroup` in Menu.jsx.
 * `selectedValues` is a model (`[(selectedValues)]`); `defaultSelectedValues` seeds uncontrolled use.
 */
@Component({
  selector: 'kpmg-dropdown-item-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MenuItemComponent, MenuDividerComponent],
  host: { style: 'display: contents' },
  template: `
    <div [class]="'kpmg-dropdown-item-group kpmg-dropdown-item-group--' + density() + ' ' + className()" role="group">
      @for (item of groupItems(); track $index; let i = $index) {
        @if (item.type === 'divider') {
          <hr kpmg-menu-divider />
        } @else {
          <button
            kpmg-menu-item
            [label]="item.label"
            [value]="item.value || item.label"
            [density]="density()"
            [type]="isItemList() ? 'icon' : 'checklist'"
            [showTrailingIcon]="isItemList()"
            [selected]="isSelected(item)"
            [disabled]="!!item.disabled"
            [error]="!!item.error"
            (click)="onItemClick(item, $event)"
          ></button>
        }
      }
    </div>
  `,
})
export class DropdownItemGroupComponent {
  readonly density = input<'small' | 'medium' | 'large'>('medium');
  readonly type = input<'checklist' | 'item-list'>('checklist');
  readonly items = input<DropdownItemData[] | undefined>(undefined);
  /** Selected values. Two-way bindable. */
  readonly selectedValues = model<string[] | undefined>(undefined);
  readonly defaultSelectedValues = input<string[] | undefined>(undefined);
  readonly className = input('');

  readonly itemSelect = output<{ value: string; selectedValues: string[]; item: DropdownItemData; event: Event }>();

  protected readonly isItemList = computed(() => this.type() === 'item-list');
  protected readonly groupItems = computed(() => this.items() ?? DEFAULT_GROUP_ITEMS);

  private readonly current = linkedSignal<string[]>(
    () =>
      this.selectedValues() ??
      this.defaultSelectedValues() ??
      this.groupItems()
        .filter((i) => i.type !== 'divider' && !i.disabled && i.selected !== false)
        .map((i) => (i.value || i.label) as string),
  );

  protected isSelected(item: DropdownItemData): boolean {
    return this.current().includes((item.value || item.label) as string);
  }

  protected onItemClick(item: DropdownItemData, event: Event): void {
    if (item.disabled) return;
    const value = (item.value || item.label) as string;
    const next = this.current().includes(value) ? this.current().filter((v) => v !== value) : [...this.current(), value];
    this.current.set(next);
    this.selectedValues.set(next);
    this.itemSelect.emit({ value, selectedValues: next, item, event });
  }
}

/**
 * Trigger button + popover menu — mirrors `DropdownMenu` in Menu.jsx.
 * Data-driven via `items`, or project `kpmg-menu-item` rows. Replace the trigger
 * with `customTrigger` (context `{ open, toggle }`). `open` is a model;
 * `onSelect` → `itemSelect`, `onClose` → `closed`.
 */
@Component({
  selector: 'kpmg-dropdown-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MenuComponent, MenuItemComponent, MenuDividerComponent, DropdownBaseComponent],
  host: { style: 'display: contents' },
  template: `
    <kpmg-menu
      type="dropdown"
      [open]="isOpen()"
      [trigger]="triggerTpl"
      [density]="density()"
      [placement]="computedPlacement()"
      [width]="width() ?? (isCard() ? 450 : undefined)"
      [header]="header()"
      [className]="menuClass()"
      [closeOnSelect]="closeOnSelect()"
      (closed)="onMenuClosed()"
    >
      @if (items().length) {
        @for (item of items(); track $index) {
          @if (item.type === 'divider') {
            <hr kpmg-menu-divider />
          } @else {
            <button
              kpmg-menu-item
              [label]="item.label"
              [description]="item.description"
              [type]="item.type ?? 'checklist'"
              [prefix]="item.prefix ?? null"
              [suffix]="item.suffix ?? null"
              [showTrailingIcon]="item.type === 'icon'"
              [selected]="isSelected(item)"
              [disabled]="!!item.disabled"
              [error]="!!item.error"
              (click)="itemSelect.emit({ value: item.value || item.label, item: item })"
            ></button>
          }
        }
      } @else {
        <ng-content />
      }
    </kpmg-menu>

    <ng-template #triggerTpl let-open="open">
      @if (customTrigger(); as tpl) {
        <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ open: isOpen(), toggle: toggleFn }" />
      } @else {
        <button
          kpmg-dropdown-base
          [styleType]="resolvedStyle()"
          [size]="resolvedSize()"
          [background]="baseBackground()"
          [state]="isOpen() ? 'pressed' : baseState()"
          [open]="isOpen()"
          [label]="triggerLabel() || (isCard() ? 'Header' : 'Options')"
          (click)="toggle()"
        ></button>
      }
    </ng-template>
  `,
})
export class DropdownMenuComponent {
  readonly triggerLabel = input('Options');
  /** Backward-compat alias: `'card'` forces the card base style. */
  readonly triggerType = input<'default' | 'card' | 'custom' | undefined>(undefined);
  readonly triggerDensity = input<DropdownSize | undefined>(undefined);
  readonly baseStyle = input<DropdownStyle>('default');
  readonly baseSize = input<DropdownSize>('medium');
  readonly baseBackground = input(true, { transform: booleanAttribute });
  readonly baseState = input<DropdownBaseState>('enabled');
  readonly orientation = input<'bottom' | 'top'>('bottom');
  readonly alignment = input<'left' | 'right' | 'center'>('left');
  readonly customTrigger = input<TemplateRef<MenuTriggerContext> | null>(null);
  readonly density = input<MenuDensity>('medium');
  readonly items = input<DropdownItemData[]>([]);
  readonly selectedValues = input<string[]>([]);
  readonly placement = input<MenuPlacement | undefined>(undefined);
  readonly width = input<number | string | undefined>(undefined);
  readonly header = input<string | TemplateRef<unknown> | null>(null);
  /** Open state. Two-way bindable: `[(open)]`. */
  readonly open = model<boolean | undefined>(undefined);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  readonly closeOnSelect = input(true, { transform: booleanAttribute });
  readonly className = input('');

  readonly itemSelect = output<{ value: string | undefined; item: DropdownItemData }>();
  readonly closed = output<void>();

  protected readonly isOpen = linkedSignal(() => this.open() ?? this.defaultOpen());
  protected readonly toggleFn = () => this.toggle();

  protected readonly resolvedStyle = computed<DropdownStyle>(() => (this.triggerType() === 'card' ? 'card' : this.baseStyle() || 'default'));
  protected readonly isCard = computed(() => this.resolvedStyle() === 'card');
  protected readonly resolvedSize = computed<DropdownSize>(
    () => this.triggerDensity() || this.baseSize() || (this.isCard() ? 'none' : 'medium'),
  );
  protected readonly computedPlacement = computed<MenuPlacement>(
    () => this.placement() ?? (`${this.orientation()}-${this.alignment()}` as MenuPlacement),
  );
  protected readonly menuClass = computed(() => (this.isCard() ? `kpmg-menu--dropdown-card ${this.className()}`.trim() : this.className()));

  protected isSelected(item: DropdownItemData): boolean {
    return this.selectedValues().includes((item.value || item.label) as string);
  }

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
