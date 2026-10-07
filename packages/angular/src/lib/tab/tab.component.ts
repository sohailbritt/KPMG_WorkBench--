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
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type TabSize = 'small' | 'large';
export type TabItemState = 'enabled' | 'hovered' | 'pressed' | 'disabled';
export type TabId = string | number;

export interface TabItemData {
  id?: TabId;
  value?: TabId;
  label: string;
  badge?: string | number;
  disabled?: boolean;
  selected?: boolean;
  state?: TabItemState;
  ariaControls?: string;
}

export interface TabChange {
  id: TabId;
  item: { id: TabId; label: string; badge?: string | number; disabled: boolean };
  event: Event;
}

/**
 * A single tab. Use as an attribute on a button inside `<kpmg-tab>`:
 * `<button kpmg-tab-item tabId="a" label="Overview"></button>`.
 * Mirrors `TabItem` in packages/ui/src/components/Tab/Tab.jsx.
 */
@Component({
  selector: 'button[kpmg-tab-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: 'button',
    '[attr.role]': 'role()',
    '[class]': 'classes()',
    '[disabled]': 'disabled()',
    '[attr.aria-selected]': 'isSelected()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.aria-controls]': 'ariaControls()',
    '[attr.tabindex]': 'isSelected() ? 0 : -1',
    '[attr.data-tab-id]': 'tabId()',
    '(click)': 'onClick($event)',
  },
  template: `
    <span class="kpmg-tab__item-label">@if (label() !== undefined) {{{ label() }}} @else {<ng-content />}</span>
    @if (hasBadge()) { <span class="kpmg-tab__badge" aria-hidden="true">{{ badge() }}</span> }
  `,
})
export class TabItemComponent {
  private readonly tab = inject(TabComponent, { optional: true });

  readonly tabId = input.required<TabId>();
  readonly label = input<string | undefined>(undefined);
  readonly badge = input<string | number | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Explicit selected state; otherwise derived from the parent tab's value. */
  readonly selected = input<boolean | undefined>(undefined);
  readonly state = input<TabItemState | undefined>(undefined);
  readonly role = input('tab');
  readonly ariaControls = input<string | undefined>(undefined);
  readonly className = input('');

  protected readonly isSelected = computed(
    () => this.selected() ?? (this.tab?.activeId() !== undefined && this.tab?.activeId() === this.tabId()),
  );
  protected readonly hasBadge = computed(() => {
    const b = this.badge();
    return b !== undefined && b !== null && b !== '';
  });

  protected readonly classes = computed(() =>
    [
      'kpmg-tab__item',
      this.hasBadge() ? 'kpmg-tab__item--with-badge' : '',
      this.isSelected() ? 'kpmg-tab__item--selected' : '',
      this.disabled() ? 'kpmg-tab__item--disabled' : '',
      this.state() ? `kpmg-tab__item--state-${this.state()!.toLowerCase()}` : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected onClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.tab?.select(this.tabId(), { id: this.tabId(), label: this.label() ?? '', badge: this.badge(), disabled: this.disabled() }, event);
  }
}

/**
 * WorkBench Tab — mirrors packages/ui/src/components/Tab/Tab.jsx.
 * Pass `items` (data-driven) or project `<button kpmg-tab-item>` children.
 * `value` is a model: `[(value)]`, or `defaultValue` for uncontrolled usage.
 * `actions` is an `<ng-template>` replacing the large size's default trailing buttons.
 */
@Component({
  selector: 'kpmg-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, TabItemComponent],
  host: { style: 'display: contents' },
  template: `
    <div [class]="classes()">
      <div class="kpmg-tab__nav">
        <div #list class="kpmg-tab__list" [attr.role]="role()" [attr.aria-label]="ariaLabel()" (keydown)="onKeydown($event)">
          @if (items(); as list) {
            @for (item of list; track item.id ?? item.value ?? $index; let i = $index) {
              <button
                kpmg-tab-item
                [tabId]="item.id ?? item.value ?? i"
                [label]="item.label"
                [badge]="item.badge"
                [disabled]="!!item.disabled"
                [selected]="item.selected"
                [state]="item.state"
                [ariaControls]="item.ariaControls"
              ></button>
            }
          } @else {
            <ng-content />
          }
        </div>
      </div>
      @if (actions() || sizeNorm() === 'large') {
        <div class="kpmg-tab__actions">
          @if (actions(); as tpl) {
            <ng-container [ngTemplateOutlet]="tpl" />
          } @else {
            <button type="button" class="kpmg-tab__action-btn" aria-label="List view" title="List view">
              <span class="kpmg-tab__action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </span>
            </button>
            <button type="button" class="kpmg-tab__action-btn" aria-label="Link actions" title="Link actions">
              <span class="kpmg-tab__action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </span>
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class TabComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly size = input<TabSize>('small');
  /** Active tab id. Two-way bindable: `[(value)]`. */
  readonly value = model<TabId | undefined>(undefined);
  /** Initial active id when `value` is not bound (defaults to the first item). */
  readonly defaultValue = input<TabId | undefined>(undefined);
  readonly items = input<TabItemData[] | undefined>(undefined);
  readonly actions = input<TemplateRef<unknown> | null>(null);
  readonly bordered = input(true, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly role = input('tablist');
  readonly ariaLabel = input('Navigation Tabs');
  readonly className = input('');

  /** Fires whenever a tab is selected. */
  readonly tabChange = output<TabChange>();

  private readonly current = linkedSignal<TabId | undefined>(() => {
    const v = this.value();
    if (v !== undefined) return v;
    const d = this.defaultValue();
    if (d !== undefined) return d;
    const first = this.items()?.[0];
    return first ? (first.id ?? first.value ?? 0) : undefined;
  });

  readonly activeId = this.current.asReadonly();
  protected readonly sizeNorm = computed(() => this.size().toLowerCase());

  protected readonly classes = computed(() =>
    [
      'kpmg-tab',
      `kpmg-tab--${this.sizeNorm()}`,
      this.sizeNorm() === 'large' && this.bordered() ? 'kpmg-tab--bordered' : '',
      this.fullWidth() ? 'kpmg-tab--full-width' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** Called by child items. */
  select(id: TabId, item: TabChange['item'], event: Event): void {
    this.current.set(id);
    this.value.set(id);
    this.tabChange.emit({ id, item, event });
  }

  /** Arrow/Home/End keyboard navigation across enabled tabs. */
  protected onKeydown(event: KeyboardEvent): void {
    const buttons = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLButtonElement>('.kpmg-tab__list .kpmg-tab__item:not(:disabled)'),
    );
    if (!buttons.length) return;
    const current = buttons.findIndex((b) => b === document.activeElement);
    let next = -1;
    if (event.key === 'ArrowRight') next = current < buttons.length - 1 ? current + 1 : 0;
    else if (event.key === 'ArrowLeft') next = current > 0 ? current - 1 : buttons.length - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    if (next === -1) return;
    event.preventDefault();
    buttons[next].focus();
    buttons[next].click();
  }
}
