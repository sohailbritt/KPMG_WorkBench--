import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type ListStyleType = 'outlined' | 'elevated' | 'filled';
export type ListSize = 'small' | 'medium' | 'large';
export type ListLeading = 'avatar' | 'image' | 'checkbox' | 'radio' | 'icon' | 'none';
export type ListTrailing = 'checkbox' | 'arrow' | 'chevron' | 'none';

/** Options for the built-in leading/trailing elements (React: `leadingProps` / `trailingProps`). */
export interface ListElementProps {
  initials?: string;
  src?: string;
  alt?: string;
  checked?: boolean;
  icon?: TemplateRef<unknown>;
}

export interface ListItemData {
  id?: string | number;
  size?: ListSize;
  title?: string;
  supportingText?: string;
  secondaryText?: string;
  leading?: ListLeading | TemplateRef<unknown>;
  leadingProps?: ListElementProps;
  trailing?: ListTrailing | TemplateRef<unknown>;
  trailingProps?: ListElementProps;
  selected?: boolean;
  disabled?: boolean;
  interactive?: boolean;
}

/**
 * A list row. Use as an attribute on an `li` inside `<kpmg-list>`:
 * `<li kpmg-list-item title="Inbox" supportingText="3 new"></li>`.
 * Mirrors `ListItem` in packages/ui/src/components/List/ListItem.jsx.
 * React's `onClick` presence check is the `interactive` input; the row's own
 * `(click)` event works as usual.
 */
@Component({
  selector: 'li[kpmg-list-item]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'role()',
    '[attr.tabindex]': 'isInteractive() ? 0 : null',
    '[attr.aria-selected]': 'selected() ? true : null',
    '[attr.aria-disabled]': 'disabled() ? true : null',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    <div class="kpmg-list-item__main">
      @if (leadingTemplate(); as tpl) {
        <div class="kpmg-list-item__leading"><ng-container [ngTemplateOutlet]="tpl" /></div>
      } @else {
        @switch (leading()) {
          @case ('avatar') {
            <div class="kpmg-list-item__leading">
              <div class="kpmg-list-avatar">
                @if (leadingProps().src) { <img [src]="leadingProps().src" [alt]="leadingProps().alt ?? ''" /> }
                @else { <span>{{ leadingProps().initials ?? 'AZ' }}</span> }
              </div>
            </div>
          }
          @case ('image') {
            <div class="kpmg-list-item__leading">
              <div class="kpmg-list-thumbnail">
                @if (leadingProps().src) { <img [src]="leadingProps().src" [alt]="leadingProps().alt ?? ''" /> }
              </div>
            </div>
          }
          @case ('checkbox') {
            <div class="kpmg-list-item__leading kpmg-list-control">
              <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" style="cursor: pointer" [style.color]="leadingProps().checked ? 'var(--color-primary-action, #1e49e2)' : 'var(--color-neutral-100, #454554)'">
                <circle cx="10" cy="10" r="10" fill="currentColor" />
                <path d="M6 10.2L8.7 13L14 7" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
              </svg>
            </div>
          }
          @case ('radio') {
            <div class="kpmg-list-item__leading kpmg-list-control">
              <div [class]="'kpmg-list-radio-indicator ' + (leadingProps().checked ? 'kpmg-list-radio-indicator--checked' : 'kpmg-list-radio-indicator--unchecked')"></div>
            </div>
          }
          @case ('icon') {
            <div class="kpmg-list-item__leading kpmg-list-icon">
              @if (leadingProps().icon; as tpl) { <ng-container [ngTemplateOutlet]="tpl" /> }
            </div>
          }
        }
      }
      <div class="kpmg-list-item__content">
        @if (title()) { <div class="kpmg-list-item__title">{{ title() }}</div> }
        @if (sizeNorm() !== 'small' && supportingText()) { <div class="kpmg-list-item__supporting">{{ supportingText() }}</div> }
        @if (sizeNorm() === 'large' && secondaryText()) { <div class="kpmg-list-item__secondary">{{ secondaryText() }}</div> }
        <ng-content />
      </div>
    </div>
    @if (trailingTemplate(); as tpl) {
      <div class="kpmg-list-item__trailing"><ng-container [ngTemplateOutlet]="tpl" /></div>
    } @else {
      @switch (trailing()) {
        @case ('checkbox') {
          <div class="kpmg-list-item__trailing">
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" [style.color]="(trailingProps().checked ?? true) ? 'var(--color-neutral-100, #454554)' : 'var(--color-neutral-300, #b8b8c4)'">
              <circle cx="10" cy="10" r="10" fill="currentColor" />
              <path d="M6 10.2L8.7 13L14 7" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            </svg>
          </div>
        }
        @case ('arrow') { <ng-container [ngTemplateOutlet]="chevron" /> }
        @case ('chevron') { <ng-container [ngTemplateOutlet]="chevron" /> }
      }
    }

    <ng-template #chevron>
      <div class="kpmg-list-item__trailing kpmg-list-chevron">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg>
      </div>
    </ng-template>
  `,
})
export class ListItemComponent {
  private readonly list = inject(ListComponent, { optional: true });

  /** Defaults to the parent list's `size`. */
  readonly size = input<ListSize | undefined>(undefined);
  readonly title = input<string | undefined>('List item');
  readonly supportingText = input<string | undefined>(undefined);
  readonly secondaryText = input<string | undefined>(undefined);
  readonly leading = input<ListLeading | TemplateRef<unknown>>('none');
  readonly leadingProps = input<ListElementProps>({});
  readonly trailing = input<ListTrailing | TemplateRef<unknown>>('none');
  readonly trailingProps = input<ListElementProps>({});
  readonly selected = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Makes the row focusable and keyboard-activatable (React: `onClick` provided). */
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly role = input('listitem');
  readonly className = input('');

  protected readonly sizeNorm = computed(() => (this.size() ?? this.list?.size() ?? 'medium').toLowerCase());
  protected readonly isInteractive = computed(() => this.interactive() && !this.disabled());
  protected readonly leadingTemplate = computed(() => {
    const l = this.leading();
    return l instanceof TemplateRef ? l : null;
  });
  protected readonly trailingTemplate = computed(() => {
    const t = this.trailing();
    return t instanceof TemplateRef ? t : null;
  });

  protected readonly classes = computed(() =>
    [
      'kpmg-list-item',
      `kpmg-list-item--${this.sizeNorm()}`,
      this.isInteractive() ? 'kpmg-list-item--interactive' : '',
      this.selected() ? 'kpmg-list-item--selected' : '',
      this.disabled() ? 'kpmg-list-item--disabled' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** Enter/Space activate an interactive row by dispatching a click. */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.isInteractive() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    }
  }
}

/**
 * WorkBench List — mirrors packages/ui/src/components/List/List.jsx.
 * Pass `items` (data-driven) or project `<li kpmg-list-item>` rows.
 */
@Component({
  selector: 'kpmg-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ListItemComponent],
  host: { style: 'display: contents' },
  template: `
    <ul [class]="classes()" [attr.role]="role()">
      @if (items(); as rows) {
        @for (item of rows; track item.id ?? $index) {
          <li
            kpmg-list-item
            [size]="item.size ?? sizeNorm()"
            [title]="item.title ?? 'List item'"
            [supportingText]="item.supportingText"
            [secondaryText]="item.secondaryText"
            [leading]="item.leading ?? 'none'"
            [leadingProps]="item.leadingProps ?? {}"
            [trailing]="item.trailing ?? 'none'"
            [trailingProps]="item.trailingProps ?? {}"
            [selected]="!!item.selected"
            [disabled]="!!item.disabled"
            [interactive]="!!item.interactive"
            (click)="!item.disabled && itemClick.emit(item)"
          ></li>
        }
      } @else {
        <ng-content />
      }
    </ul>
  `,
})
export class ListComponent {
  /** outlined (bordered), elevated (shadow) or filled (tinted). */
  readonly styleType = input<ListStyleType>('outlined');
  /** Alias for `styleType`. */
  readonly styleVariant = input<ListStyleType | undefined>(undefined);
  /** Default density for rows: small (1-line), medium (2-line), large (3-line). */
  readonly size = input<ListSize>('medium');
  readonly divided = input(false, { transform: booleanAttribute });
  readonly items = input<ListItemData[] | undefined>(undefined);
  readonly role = input('list');
  readonly className = input('');

  /** Emitted when a data-driven row is clicked. */
  readonly itemClick = output<ListItemData>();

  protected readonly sizeNorm = computed(() => (this.size() || 'medium').toLowerCase() as ListSize);

  protected readonly classes = computed(() =>
    [
      'kpmg-list',
      `kpmg-list--${(this.styleVariant() || this.styleType() || 'outlined').toLowerCase()}`,
      this.divided() ? 'kpmg-list--divided' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' '),
  );
}
