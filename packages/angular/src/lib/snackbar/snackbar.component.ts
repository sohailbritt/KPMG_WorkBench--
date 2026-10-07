import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  input,
  linkedSignal,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type SnackbarSize = 'single-line' | 'two-line' | 'extended' | 'extended-header' | 'extended-media';
export type SnackbarPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right';

export interface SnackbarMediaItem {
  id?: string | number;
  title: string;
  subtitle?: string;
}

const DEFAULT_COPY =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

/**
 * WorkBench Snackbar — mirrors packages/ui/src/components/Snackbar/Snackbar.jsx.
 *
 * `action` is the label string; pass a template via `actionTemplate` for custom
 * markup. Events: `actionClick`, `closed`, `mediaAction` (React: `onAction`,
 * `onClose`, per-item `onAction`). `open` shows/hides it; the close button and
 * `autoHideDuration` hide it and emit `closed`.
 */
@Component({
  selector: 'kpmg-snackbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { style: 'display: contents' },
  template: `
    @if (isVisible()) {
      <div
        [class]="classes()"
        [attr.role]="role()"
        aria-live="polite"
        (mouseenter)="pauseTimer()"
        (mouseleave)="startTimer()"
      >
        @switch (size()) {
          @case ('single-line') { <p class="kpmg-snackbar__message">{{ message() || 'Snackbar text goes here' }}</p> }
          @case ('two-line') { <p class="kpmg-snackbar__message">{{ message() || 'Snackbar text goes here' }}</p> }
          @case ('extended') {
            <div class="kpmg-snackbar__content">
              <p class="kpmg-snackbar__description">{{ description() || message() || defaultCopy }}</p>
            </div>
          }
          @case ('extended-header') {
            <div class="kpmg-snackbar__content">
              <h4 class="kpmg-snackbar__header">{{ header() || 'Header' }}</h4>
              <p class="kpmg-snackbar__description">{{ description() || message() || defaultCopy }}</p>
            </div>
          }
          @case ('extended-media') {
            <div class="kpmg-snackbar__content">
              <h4 class="kpmg-snackbar__header">{{ header() || 'Header' }}</h4>
              @if (description() || message()) {
                <p class="kpmg-snackbar__description">{{ description() || message() }}</p>
              }
              <div class="kpmg-snackbar__media-list">
                @for (item of mediaItems(); track item.id ?? $index; let i = $index) {
                  <div class="kpmg-snackbar__media-item">
                    <div class="kpmg-snackbar__media-thumb"></div>
                    <div class="kpmg-snackbar__media-info">
                      <span class="kpmg-snackbar__media-title">{{ item.title }}</span>
                      @if (item.subtitle) { <span class="kpmg-snackbar__media-subtitle">{{ item.subtitle }}</span> }
                    </div>
                    <button type="button" class="kpmg-snackbar__media-action" aria-label="More media options" (click)="mediaAction.emit(item)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>
                  </div>
                }
              </div>
            </div>
          }
          @default { <p class="kpmg-snackbar__message">{{ message() }}</p> }
        }
        @if (action() || actionTemplate() || closeable()) {
          <div class="kpmg-snackbar__actions">
            @if (actionTemplate(); as tpl) {
              <ng-container [ngTemplateOutlet]="tpl" />
            } @else if (action()) {
              <button type="button" class="kpmg-snackbar__action-btn" (click)="actionClick.emit($event)">{{ action() }}</button>
            }
            @if (closeable()) {
              <button type="button" class="kpmg-snackbar__close-btn" aria-label="Dismiss notification" (click)="close()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            }
          </div>
        }
      </div>
    }
  `,
})
export class SnackbarComponent {
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly open = input(true, { transform: booleanAttribute });
  readonly message = input<string | undefined>(undefined);
  readonly header = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly size = input<SnackbarSize>('single-line');
  readonly outlined = input(false, { transform: booleanAttribute });
  /** Action button label. */
  readonly action = input<string | undefined>(undefined);
  /** Custom action markup (replaces the action button). */
  readonly actionTemplate = input<TemplateRef<unknown> | null>(null);
  readonly closeable = input(true, { transform: booleanAttribute });
  /** Milliseconds before auto-dismiss; paused while hovered. */
  readonly autoHideDuration = input<number | null>(null);
  readonly items = input<SnackbarMediaItem[] | undefined>(undefined);
  readonly role = input('status');
  readonly className = input('');

  readonly actionClick = output<Event>();
  readonly closed = output<void>();
  readonly mediaAction = output<SnackbarMediaItem>();

  protected readonly defaultCopy = DEFAULT_COPY;
  protected readonly isVisible = linkedSignal(() => this.open());

  protected readonly mediaItems = computed<SnackbarMediaItem[]>(
    () =>
      this.items() ??
      (this.size() === 'extended-media'
        ? [
            { id: '1', title: 'Header' },
            { id: '2', title: 'Header' },
            { id: '3', title: 'Header' },
          ]
        : []),
  );

  protected readonly classes = computed(() =>
    ['kpmg-snackbar', `kpmg-snackbar--${this.size()}`, this.outlined() ? 'kpmg-snackbar--outlined' : 'kpmg-snackbar--elevated', this.className()]
      .filter(Boolean)
      .join(' '),
  );

  constructor() {
    effect(() => {
      // Restart the auto-hide timer whenever visibility or duration changes.
      this.isVisible();
      this.autoHideDuration();
      this.startTimer();
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected startTimer(): void {
    clearTimeout(this.timer);
    const ms = this.autoHideDuration();
    if (this.isVisible() && ms) this.timer = setTimeout(() => this.close(), ms);
  }

  protected pauseTimer(): void {
    clearTimeout(this.timer);
  }

  protected close(): void {
    this.isVisible.set(false);
    this.closed.emit();
  }
}

/** Fixed-position viewport that stacks snackbars. Mirrors `SnackbarContainer`. */
@Component({
  selector: 'kpmg-snackbar-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class SnackbarContainerComponent {
  readonly position = input<SnackbarPosition>('bottom-left');
  readonly className = input('');

  protected readonly classes = computed(() =>
    ['kpmg-snackbar-container', `kpmg-snackbar-container--${this.position()}`, this.className()].filter(Boolean).join(' '),
  );
}

export interface SnackbarOptions {
  id?: string;
  message?: string;
  header?: string;
  description?: string;
  size?: SnackbarSize;
  outlined?: boolean;
  action?: string;
  closeable?: boolean;
  autoHideDuration?: number | null;
  items?: SnackbarMediaItem[];
  onAction?: (event: Event) => void;
  onClose?: () => void;
}

/**
 * Imperative API — Angular's equivalent of React's `SnackbarProvider` /
 * `useSnackbar`. Inject the service, call `show()`, and render a single
 * `<kpmg-snackbar-outlet>` near the app root.
 */
@Injectable({ providedIn: 'root' })
export class SnackbarService {
  readonly snackbars = signal<(SnackbarOptions & { id: string })[]>([]);

  show(options: SnackbarOptions): string {
    const id = options.id ?? Date.now().toString() + Math.random().toString(36).slice(2, 6);
    this.snackbars.update((list) => [...list, { ...options, id }]);
    return id;
  }

  hide(id: string): void {
    this.snackbars.update((list) => list.filter((s) => s.id !== id));
  }
}

/** Renders the snackbars queued through `SnackbarService`. */
@Component({
  selector: 'kpmg-snackbar-outlet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SnackbarComponent, SnackbarContainerComponent],
  host: { style: 'display: contents' },
  template: `
    <kpmg-snackbar-container [position]="position()">
      @for (s of service.snackbars(); track s.id) {
        <kpmg-snackbar
          [message]="s.message"
          [header]="s.header"
          [description]="s.description"
          [size]="s.size ?? 'single-line'"
          [outlined]="!!s.outlined"
          [action]="s.action"
          [closeable]="s.closeable ?? true"
          [autoHideDuration]="s.autoHideDuration ?? null"
          [items]="s.items"
          (actionClick)="s.onAction?.($event)"
          (closed)="service.hide(s.id); s.onClose?.()"
        />
      }
    </kpmg-snackbar-container>
  `,
})
export class SnackbarOutletComponent {
  protected readonly service = inject(SnackbarService);
  readonly position = input<SnackbarPosition>('bottom-left');
}
