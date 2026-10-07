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
} from '@angular/core';
import { MenuIconComponent } from './menu-icon.component';
import { MenuPlacement } from './menu.component';
import { DropdownItemData, DropdownItemGroupComponent } from './dropdown-menu.component';

/**
 * Ellipsis trigger + popover item group — mirrors `OverflowMenu` in Menu.jsx.
 * Project your own content to replace the default `DropdownItemGroup`.
 * `onSelect` → `itemSelect`, `onClose` → `closed`, `open` is a model.
 */
@Component({
  selector: 'kpmg-overflow-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MenuIconComponent, DropdownItemGroupComponent],
  host: {
    style: 'display: contents',
    '(document:mousedown)': 'onDocumentMouseDown($event)',
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    <div [class]="'kpmg-menu-wrapper ' + className()">
      <button
        type="button"
        [class]="'kpmg-menu-overflow-trigger kpmg-menu-overflow-trigger--' + size() + (isOpen() ? ' kpmg-menu-overflow-trigger--open' : '')"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel()"
        aria-haspopup="menu"
        [attr.aria-expanded]="isOpen()"
        (click)="toggle()"
      >
        <kpmg-menu-icon name="ellipsis" [size]="size() === 'small' ? 16 : 20" />
      </button>
      @if (isOpen()) {
        <div [class]="'kpmg-menu-overflow-popover kpmg-menu--placement-' + placement()">
          @if (hasProjected) {
            <ng-content />
          } @else {
            <kpmg-dropdown-item-group
              [density]="density()"
              [type]="resolvedGroupType()"
              [items]="items()"
              [selectedValues]="selectedValues()"
              [defaultSelectedValues]="defaultSelectedValues()"
              (itemSelect)="onItemSelect($event)"
            />
          }
        </div>
      }
    </div>
  `,
})
export class OverflowMenuComponent {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly size = input<'small' | 'large'>('large');
  readonly density = input<'small' | 'medium' | 'large'>('medium');
  readonly groupType = input<'checklist' | 'item-list'>('checklist');
  /** Alias for `groupType`. */
  readonly type = input<'checklist' | 'item-list' | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly items = input<DropdownItemData[] | undefined>(undefined);
  readonly selectedValues = input<string[] | undefined>(undefined);
  readonly defaultSelectedValues = input<string[] | undefined>(undefined);
  readonly placement = input<MenuPlacement>('bottom-left');
  /** Open state. Two-way bindable: `[(open)]`. */
  readonly open = model<boolean | undefined>(undefined);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  readonly closeOnSelect = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('More options');
  /** Set when projecting custom popover content instead of the default group. */
  readonly customContent = input(false, { transform: booleanAttribute });
  readonly className = input('');

  readonly itemSelect = output<{ value: string; selectedValues: string[]; item: DropdownItemData; event: Event }>();
  readonly closed = output<void>();

  protected get hasProjected(): boolean {
    return this.customContent();
  }

  protected readonly isOpen = linkedSignal(() => this.open() ?? this.defaultOpen());
  protected readonly resolvedGroupType = computed(() => this.type() || this.groupType() || 'checklist');

  private setOpen(next: boolean): void {
    this.isOpen.set(next);
    this.open.set(next);
    if (!next) this.closed.emit();
  }

  protected toggle(): void {
    if (this.disabled()) return;
    this.setOpen(!this.isOpen());
  }

  protected onItemSelect(e: { value: string; selectedValues: string[]; item: DropdownItemData; event: Event }): void {
    this.itemSelect.emit(e);
    if (this.closeOnSelect()) this.setOpen(false);
  }

  protected onDocumentMouseDown(event: MouseEvent): void {
    if (this.isOpen() && !this.hostEl.nativeElement.contains(event.target as Node)) this.setOpen(false);
  }

  protected onEscape(): void {
    if (this.isOpen()) this.setOpen(false);
  }
}
