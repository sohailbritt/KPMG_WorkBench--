import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type BreadcrumbsSize = 'sm' | 'md' | 'lg' | string;

export interface BreadcrumbItem {
  id?: string | number;
  label: string;
  href?: string;
  isCurrent?: boolean;
  /** Collapsed-menu items: render a circle checkbox instead of a bookmark star. */
  useCircleCheckbox?: boolean;
  isCheckbox?: boolean;
  isChecked?: boolean;
  isStar?: boolean;
  hasDivider?: boolean;
  leadingIcon?: TemplateRef<unknown>;
  trailingIcon?: TemplateRef<unknown>;
}

export interface BreadcrumbItemEvent {
  item: BreadcrumbItem;
  event: Event;
}

/**
 * WorkBench Breadcrumbs — mirrors packages/ui/src/components/Breadcrumbs/Breadcrumbs.jsx.
 *
 * Per-item `onClick` becomes the `itemClick` output; `onRouteToggle` /
 * `onBookmarkToggle` become `routeToggle` / `bookmarkToggle`. Custom icons are
 * `<ng-template>` refs (context: the item as `$implicit`).
 */
@Component({
  selector: 'kpmg-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { style: 'display: contents' },
  template: `
    <nav aria-label="Breadcrumb" [class]="classes()">
      @if (toastMessage(); as msg) {
        <div class="kpmg-breadcrumbs__toast" role="status">{{ msg }}</div>
      }
      <ol class="kpmg-breadcrumbs__list">
        @for (item of parts().start; track item.id ?? $index; let i = $index) {
          <li class="kpmg-breadcrumbs__item">
            <ng-container [ngTemplateOutlet]="link" [ngTemplateOutletContext]="{ item: item, isLast: !parts().collapse && i === parts().start.length - 1 }" />
          </li>
          @if (parts().collapse || i < parts().start.length - 1) {
            <li class="kpmg-breadcrumbs__separator" aria-hidden="true">{{ separator() }}</li>
          }
        }

        @if (parts().collapse) {
          <li
            class="kpmg-breadcrumbs__item"
            (mouseenter)="overflowTrigger() === 'hover' && isOverflowOpen.set(true)"
            (mouseleave)="overflowTrigger() === 'hover' && isOverflowOpen.set(false)"
          >
            <button
              type="button"
              aria-label="Show collapsed breadcrumbs"
              [attr.aria-expanded]="isOverflowOpen()"
              [class]="'kpmg-breadcrumbs__overflow-trigger' + (isOverflowOpen() ? ' kpmg-breadcrumbs__overflow-trigger--open' : '')"
              (click)="isOverflowOpen.set(!isOverflowOpen())"
            >...</button>
            @if (isOverflowOpen()) {
              <ul class="kpmg-breadcrumbs__dropdown-card" role="menu">
                @for (c of parts().collapsed; track c.id ?? $index) {
                  @if (c.hasDivider) { <li class="kpmg-breadcrumbs__dropdown-divider" aria-hidden="true"></li> }
                  <li role="none">
                    <a [attr.href]="c.href || '#'" class="kpmg-breadcrumbs__dropdown-item" role="menuitem" (click)="onCollapsedClick($event, c)">
                      <span class="kpmg-breadcrumbs__dropdown-left">
                        @if (c.useCircleCheckbox || c.isCheckbox) {
                          <span class="kpmg-breadcrumbs__circle-checkbox" [attr.title]="c.isChecked !== false ? 'Uncheck route' : 'Check route'" (click)="toggleChecked($event, c)">
                            @if (c.leadingIcon ?? circleCheckboxIcon(); as tpl) {
                              <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: c }" />
                            } @else {
                              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                @if (c.isChecked !== false) {
                                  <circle cx="12" cy="12" r="10" fill="#3D405B" />
                                  <polyline points="8 12 11 15 16 9" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                                } @else {
                                  <circle cx="12" cy="12" r="9" fill="none" stroke="#9090A2" stroke-width="2" />
                                }
                              </svg>
                            }
                          </span>
                        } @else {
                          <span
                            [class]="'kpmg-breadcrumbs__star-button' + (c.isStar ? ' kpmg-breadcrumbs__star-button--active' : '')"
                            [attr.title]="c.isStar ? 'Remove bookmark' : 'Bookmark route'"
                            (click)="toggleStar($event, c)"
                          >
                            @if (c.leadingIcon ?? starIcon(); as tpl) {
                              <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: c }" />
                            } @else if (c.isStar) {
                              <svg viewBox="0 0 24 24" width="18" height="18" fill="#F4D533" stroke="#F4D533" stroke-width="1" aria-hidden="true">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            } @else {
                              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#5D5D6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            }
                          </span>
                        }
                        <span>{{ c.label }}</span>
                      </span>
                      @if (c.trailingIcon || (c.isChecked !== false && !c.useCircleCheckbox)) {
                        <span class="kpmg-breadcrumbs__dropdown-right">
                          <span class="kpmg-breadcrumbs__trailing-check">
                            @if (c.trailingIcon ?? checkIcon(); as tpl) {
                              <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: c }" />
                            } @else {
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#454554" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            }
                          </span>
                        </span>
                      }
                    </a>
                  </li>
                }
              </ul>
            }
          </li>
          @for (item of parts().end; track item.id ?? $index; let i = $index) {
            <li class="kpmg-breadcrumbs__item">
              <ng-container [ngTemplateOutlet]="link" [ngTemplateOutletContext]="{ item: item, isLast: i === parts().end.length - 1 }" />
            </li>
            @if (i < parts().end.length - 1) {
              <li class="kpmg-breadcrumbs__separator" aria-hidden="true">{{ separator() }}</li>
            }
          }
        }
      </ol>
    </nav>

    <ng-template #link let-item="item" let-isLast="isLast">
      @if (isLast || item.isCurrent) {
        <span class="kpmg-breadcrumbs__link kpmg-breadcrumbs__link--current" aria-current="page">{{ item.label }}</span>
      } @else if (item.href) {
        <a [attr.href]="item.href" class="kpmg-breadcrumbs__link" (click)="itemClick.emit({ item: item, event: $event })">{{ item.label }}</a>
      } @else {
        <button type="button" class="kpmg-breadcrumbs__link" (click)="itemClick.emit({ item: item, event: $event })">{{ item.label }}</button>
      }
    </ng-template>
  `,
  // The outside-click listener lives on the host to close the overflow card.
})
export class BreadcrumbsComponent {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  readonly items = input<BreadcrumbItem[]>([]);
  readonly maxItems = input<number | undefined>(undefined);
  readonly itemsBeforeCollapse = input<number | undefined>(undefined);
  readonly itemsAfterCollapse = input(1);
  readonly separator = input('/');
  readonly size = input<BreadcrumbsSize>('md');
  readonly overflowTrigger = input<'click' | 'hover'>('click');
  readonly circleCheckboxIcon = input<TemplateRef<unknown> | null>(null);
  readonly starIcon = input<TemplateRef<unknown> | null>(null);
  readonly checkIcon = input<TemplateRef<unknown> | null>(null);
  readonly className = input('');

  readonly itemClick = output<BreadcrumbItemEvent>();
  readonly routeToggle = output<{ item: BreadcrumbItem; checked: boolean }>();
  readonly bookmarkToggle = output<{ item: BreadcrumbItem; starred: boolean }>();

  protected readonly isOverflowOpen = signal(false);
  protected readonly toastMessage = signal<string | null>(null);
  /** Local copy so route/bookmark toggles update the UI, like React's state. */
  private readonly itemsState = linkedSignal(() => this.items());

  constructor() {
    const onDown = (e: MouseEvent) => {
      if (!this.hostEl.nativeElement.contains(e.target as Node)) this.isOverflowOpen.set(false);
    };
    document.addEventListener('mousedown', onDown);
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('mousedown', onDown);
      clearTimeout(this.toastTimer);
    });
  }

  protected readonly classes = computed(() =>
    ['kpmg-breadcrumbs', `kpmg-breadcrumbs--${this.size()}`, this.className()].filter(Boolean).join(' '),
  );

  protected readonly parts = computed(() => {
    const items = this.itemsState();
    const total = items.length;
    const max = this.maxItems();
    const afterCount = this.itemsAfterCollapse();
    const collapse = !!max && total > max && total > 1 + afterCount;
    if (!collapse) return { collapse, start: items, collapsed: [] as BreadcrumbItem[], end: [] as BreadcrumbItem[] };
    const endCount = afterCount || 1;
    const before = this.itemsBeforeCollapse();
    const startCount = typeof before === 'number' ? before : Math.max(1, total - endCount - (total - max!));
    return {
      collapse,
      start: items.slice(0, startCount),
      collapsed: items.slice(startCount, total - endCount),
      end: items.slice(total - endCount),
    };
  });

  protected onCollapsedClick(event: Event, item: BreadcrumbItem): void {
    this.itemClick.emit({ item, event });
    this.isOverflowOpen.set(false);
  }

  private update(target: BreadcrumbItem, patch: Partial<BreadcrumbItem>): BreadcrumbItem | null {
    const list = [...this.itemsState()];
    const idx = list.findIndex((i) => (i.id ? i.id === target.id : i.label === target.label));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    this.itemsState.set(list);
    return list[idx];
  }

  protected toggleChecked(event: Event, item: BreadcrumbItem): void {
    event.stopPropagation();
    event.preventDefault();
    const checked = item.isChecked === false;
    const updated = this.update(item, { isChecked: checked });
    if (updated) this.routeToggle.emit({ item: updated, checked });
  }

  protected toggleStar(event: Event, item: BreadcrumbItem): void {
    event.stopPropagation();
    event.preventDefault();
    const starred = !item.isStar;
    const updated = this.update(item, { isStar: starred });
    if (!updated) return;
    this.toastMessage.set(starred ? `★ Bookmarked "${item.label}"` : `Removed bookmark for "${item.label}"`);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), 2500);
    this.bookmarkToggle.emit({ item: updated, starred });
  }
}
