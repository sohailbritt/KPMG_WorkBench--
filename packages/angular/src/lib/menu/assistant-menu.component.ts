import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  model,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MenuIconComponent } from './menu-icon.component';
import { MenuComponent, MenuPlacement, MenuTriggerContext } from './menu.component';

export interface AssistantCardData {
  title?: string;
  subtitle?: string;
  thumbnail?: TemplateRef<unknown>;
}

export interface AssistantSection {
  title?: string;
  cards?: AssistantCardData[];
}

const DEFAULT_CARDS: AssistantCardData[] = [1, 2, 3].map(() => ({ title: 'Header', subtitle: 'Supporting line text lorem ipsu...' }));
const DEFAULT_SECTIONS: AssistantSection[] = [
  { title: 'Title', cards: DEFAULT_CARDS },
  { title: 'Title', cards: DEFAULT_CARDS },
];

/**
 * Card used in the assistant menu — mirrors `AssistantCard` in Menu.jsx.
 * `onClick` → `cardClick`, `onActionClick` → `actionClick`. The thumbnail is an `<ng-template>` ref.
 */
@Component({
  selector: 'kpmg-assistant-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MenuIconComponent],
  host: { style: 'display: contents' },
  template: `
    <div
      [class]="'kpmg-assistant-card ' + className()"
      role="button"
      tabindex="0"
      (click)="cardClick.emit($event)"
      (keydown.enter)="cardClick.emit($event)"
      (keydown.space)="$event.preventDefault(); cardClick.emit($event)"
    >
      <div class="kpmg-assistant-card__thumbnail">
        @if (thumbnail(); as tpl) { <ng-container [ngTemplateOutlet]="tpl" /> }
      </div>
      <div class="kpmg-assistant-card__info">
        <span class="kpmg-assistant-card__title">{{ title() }}</span>
        <span class="kpmg-assistant-card__subtitle">{{ subtitle() }}</span>
      </div>
      <button type="button" class="kpmg-assistant-card__action" aria-label="Card options" (click)="$event.stopPropagation(); actionClick.emit($event)">
        <kpmg-menu-icon name="ellipsis" [size]="24" />
      </button>
    </div>
  `,
})
export class AssistantCardComponent {
  readonly title = input('Header');
  readonly subtitle = input('Supporting line text lorem ipsu...');
  readonly thumbnail = input<TemplateRef<unknown> | null>(null);
  readonly className = input('');

  readonly cardClick = output<Event>();
  readonly actionClick = output<Event>();
}

/**
 * Assistant popover with prompt bar, verification line, card sections and CTA —
 * mirrors `AssistantMenu` in Menu.jsx. Sections are data-driven; set
 * `customContent` and project content to replace them. `open` is a model.
 * `onCtaClick` → `ctaClick`, `onSearchSubmit` → `searchSubmit`, `onClose` → `closed`.
 */
@Component({
  selector: 'kpmg-assistant-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MenuComponent, MenuIconComponent, AssistantCardComponent],
  host: { style: 'display: contents' },
  template: `
    <div [class]="anchorClasses()" [style.width]="widthValue()">
      <kpmg-menu
        type="assistant"
        [open]="isOpen()"
        [trigger]="triggerTpl"
        [closeOnSelect]="false"
        [placement]="resolvedPlacement()"
        [width]="width()"
        (closed)="onMenuClosed()"
      >
        <form class="kpmg-assistant-menu__search-bar" (submit)="onSubmit($event)">
          <button type="button" class="kpmg-assistant-menu__search-icon-btn" aria-label="Attach file"><kpmg-menu-icon name="paperclip" [size]="16" /></button>
          <input type="text" class="kpmg-assistant-menu__search-input" [placeholder]="searchPlaceholder()" [value]="searchVal()" (input)="searchVal.set($any($event.target).value)" />
          <div class="kpmg-assistant-menu__search-actions">
            <button type="button" class="kpmg-assistant-menu__search-icon-btn" aria-label="Voice input"><kpmg-menu-icon name="mic" [size]="16" /></button>
            <button type="submit" class="kpmg-assistant-menu__search-icon-btn" aria-label="Send query"><kpmg-menu-icon name="send" [size]="16" /></button>
          </div>
        </form>
        @if (verifiedText()) { <div class="kpmg-assistant-menu__verification">{{ verifiedText() }}</div> }
        <hr class="kpmg-assistant-menu__divider" />
        @if (customContent()) {
          <ng-content />
        } @else {
          @for (sec of sections(); track $index; let sIdx = $index) {
            <div class="kpmg-assistant-menu__section">
              @if (sec.title) { <div class="kpmg-assistant-menu__section-title">{{ sec.title }}</div> }
              <div style="display: flex; flex-direction: column; gap: 12px">
                @for (card of sec.cards ?? []; track $index) {
                  <kpmg-assistant-card [title]="card.title ?? 'Header'" [subtitle]="card.subtitle ?? 'Supporting line text lorem ipsu...'" [thumbnail]="card.thumbnail ?? null" (cardClick)="cardClick.emit(card)" (actionClick)="cardAction.emit(card)" />
                }
              </div>
              @if (sIdx < sections().length - 1) { <hr class="kpmg-assistant-menu__divider" /> }
            </div>
          }
        }
        @if (ctaLabel()) {
          <div class="kpmg-assistant-menu__footer">
            <button type="button" class="kpmg-assistant-menu__cta-btn" (click)="ctaClick.emit($event)">{{ ctaLabel() }}</button>
          </div>
        }
      </kpmg-menu>
    </div>

    <ng-template #triggerTpl>
      @if (customTrigger(); as tpl) {
        <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ open: isOpen(), toggle: toggleFn }" />
      } @else {
        <button
          type="button"
          [class]="'kpmg-menu-assistant-trigger' + (isOpen() ? ' kpmg-menu-assistant-trigger--open' : '')"
          aria-label="Open Assistant Menu"
          aria-haspopup="menu"
          [attr.aria-expanded]="isOpen()"
          (click)="toggle($event)"
        >
          <kpmg-menu-icon name="robot" [size]="24" />
        </button>
      }
    </ng-template>
  `,
})
export class AssistantMenuComponent {
  readonly alignment = input<'right' | 'left'>('right');
  readonly placement = input<MenuPlacement | undefined>(undefined);
  readonly searchPlaceholder = input('Ask me anything');
  readonly verifiedText = input('Verified by KPMG Trusted AI');
  readonly ctaLabel = input('Longer action');
  readonly sections = input<AssistantSection[]>(DEFAULT_SECTIONS);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  /** Open state. Two-way bindable: `[(open)]`. */
  readonly open = model<boolean | undefined>(undefined);
  readonly width = input<number | string>(400);
  readonly customTrigger = input<TemplateRef<MenuTriggerContext> | null>(null);
  /** Set when projecting custom body content instead of `sections`. */
  readonly customContent = input(false, { transform: booleanAttribute });
  readonly className = input('');

  readonly ctaClick = output<Event>();
  readonly searchSubmit = output<string>();
  readonly cardClick = output<AssistantCardData>();
  readonly cardAction = output<AssistantCardData>();
  readonly closed = output<void>();

  protected readonly searchVal = signal('');
  protected readonly isOpen = linkedSignal(() => this.open() ?? this.defaultOpen());
  protected readonly toggleFn = () => this.toggle();

  protected readonly resolvedPlacement = computed<MenuPlacement>(
    () => this.placement() ?? (this.alignment() === 'left' ? 'bottom-left' : 'bottom-right'),
  );
  protected readonly widthValue = computed(() => (typeof this.width() === 'number' ? `${this.width()}px` : (this.width() as string)));
  protected readonly anchorClasses = computed(() =>
    [
      'kpmg-assistant-menu-anchor',
      `kpmg-assistant-menu-anchor--${this.alignment()}`,
      this.isOpen() ? 'kpmg-assistant-menu-anchor--open' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected toggle(event?: Event): void {
    event?.stopPropagation();
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

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.searchSubmit.emit(this.searchVal());
  }
}
