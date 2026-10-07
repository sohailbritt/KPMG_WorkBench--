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

export type SliderVariant = 'continuous' | 'discrete';
export type SliderState = 'enabled' | 'disabled' | 'hovered' | 'pressed';

/**
 * WorkBench Slider — mirrors packages/ui/src/components/Slider/Slider.jsx
 * (continuous + discrete). `value` is a model: bind `[(value)]`, or use
 * `defaultValue` for uncontrolled usage; `changed` also emits the native event.
 */
@Component({
  selector: 'kpmg-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { style: 'display: contents' },
  template: `
    <div [class]="classes()">
      @if (label() || subtext()) {
        <div class="kpmg-slider__header">
          @if (label()) { <span class="kpmg-slider__label">{{ label() }}</span> }
          @if (subtext()) { <span class="kpmg-slider__subtext">{{ subtext() }}</span> }
        </div>
      }
      <div class="kpmg-slider__wrapper">
        <div class="kpmg-slider__track-bg">
          <div class="kpmg-slider__track-fill" [style.width]="percentage() + '%'"></div>
          @if (shouldShowTicks() && ticks().length > 0) {
            <div class="kpmg-slider__ticks" aria-hidden="true">
              @for (tick of ticks(); track tick.value) {
                <span [class]="'kpmg-slider__tick' + (tick.percent <= percentage() ? ' kpmg-slider__tick--active' : '')" [style.left]="tick.percent + '%'"></span>
              }
            </div>
          }
        </div>
        @if (shouldShowIndicator()) {
          <div class="kpmg-slider__indicator-container" [style.left]="percentage() + '%'">
            @if (indicatorIcon(); as tpl) {
              <ng-container [ngTemplateOutlet]="tpl" />
            } @else {
              <div class="kpmg-slider__indicator-badge">
                <span class="kpmg-slider__indicator-text">{{ rounded() }}</span>
                <span class="kpmg-slider__indicator-arrow" aria-hidden="true"></span>
              </div>
            }
          </div>
        }
        <div class="kpmg-slider__thumb" [style.left]="percentage() + '%'" aria-hidden="true">
          @if (thumbIcon(); as tpl) {
            <ng-container [ngTemplateOutlet]="tpl" />
          } @else {
            <svg viewBox="0 0 24 24" [attr.width]="thumbSize()" [attr.height]="thumbSize()" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" [attr.fill]="isDisabled() ? 'var(--color-slider-disabled-thumb, #9090A2)' : 'var(--color-slider-thumb-fill, #1E49E2)'" />
            </svg>
          }
        </div>
        <input
          type="range"
          class="kpmg-slider__input"
          [attr.id]="sliderId()"
          [attr.name]="name()"
          [min]="min()"
          [max]="max()"
          [step]="activeStep()"
          [value]="clamped()"
          [disabled]="isDisabled()"
          [attr.aria-label]="ariaLabel() || label() || 'Slider'"
          [attr.aria-valuenow]="clamped()"
          [attr.aria-valuemin]="min()"
          [attr.aria-valuemax]="max()"
          (input)="onInput($event)"
        />
      </div>
    </div>
  `,
})
export class SliderComponent {
  readonly variant = input<SliderVariant>('continuous');
  /** Current value. Two-way bindable: `[(value)]`. */
  readonly value = model<number | undefined>(undefined);
  /** Initial value when `value` is not bound. */
  readonly defaultValue = input(50);
  readonly min = input(0);
  readonly max = input(100);
  /** Defaults to 1 (continuous) or 10 (discrete). */
  readonly step = input<number | undefined>(undefined);
  readonly state = input<SliderState | string>('enabled');
  /** Floating value badge above the thumb. */
  readonly showIndicator = input(false, { transform: booleanAttribute });
  /** Tick marks; defaults on for `discrete`. */
  readonly showTicks = input<boolean | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input<string | undefined>(undefined);
  readonly subtext = input<string | undefined>(undefined);
  readonly thumbIcon = input<TemplateRef<unknown> | null>(null);
  readonly indicatorIcon = input<TemplateRef<unknown> | null>(null);
  readonly sliderId = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly className = input('');

  /** Native input event plus the new numeric value. */
  readonly changed = output<{ event: Event; value: number }>();

  private readonly internal = linkedSignal(() => this.value() ?? this.defaultValue());

  private readonly isDiscrete = computed(() => this.variant() === 'discrete');
  protected readonly activeStep = computed(() => this.step() ?? (this.isDiscrete() ? 10 : 1));
  protected readonly clamped = computed(() => Math.min(Math.max(this.internal(), this.min()), this.max()));
  protected readonly rounded = computed(() => Math.round(this.clamped()));
  protected readonly percentage = computed(() =>
    this.max() > this.min() ? ((this.clamped() - this.min()) / (this.max() - this.min())) * 100 : 0,
  );

  protected readonly isDisabled = computed(() => this.disabled() || String(this.state()).toLowerCase() === 'disabled');
  private readonly stateNorm = computed(() => (this.isDisabled() ? 'disabled' : String(this.state() || 'enabled').toLowerCase()));
  protected readonly shouldShowIndicator = computed(
    () => this.showIndicator() || this.state() === 'Enabled with indicator' || this.state() === 'enabled_with_indicator',
  );
  protected readonly shouldShowTicks = computed(() => this.showTicks() ?? this.isDiscrete());
  protected readonly thumbSize = computed(() => (this.stateNorm() === 'pressed' || this.stateNorm() === 'hovered' ? 22 : 16));

  protected readonly ticks = computed(() => {
    const out: { value: number; percent: number }[] = [];
    const [min, max, step] = [this.min(), this.max(), this.activeStep()];
    if (this.shouldShowTicks() && max > min && step > 0) {
      const total = Math.floor((max - min) / step);
      for (let i = 0; i <= total; i++) {
        const v = min + i * step;
        out.push({ value: v, percent: ((v - min) / (max - min)) * 100 });
      }
    }
    return out;
  });

  protected readonly classes = computed(() =>
    [
      'kpmg-slider',
      `kpmg-slider--${this.variant()}`,
      `kpmg-slider--state-${this.stateNorm()}`,
      this.isDisabled() ? 'kpmg-slider--disabled' : '',
      this.shouldShowIndicator() ? 'kpmg-slider--has-indicator' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected onInput(event: Event): void {
    const next = Number((event.target as HTMLInputElement).value);
    this.internal.set(next);
    this.value.set(next);
    this.changed.emit({ event, value: next });
  }
}
