import { ChangeDetectionStrategy, Component, computed, input, booleanAttribute } from '@angular/core';

export type ProgressVariant = 'linear' | 'circular';
export type ProgressType = 'determinate' | 'indeterminate';
export type ProgressSize = 'large' | 'medium' | 'small';

const TRACK = 'var(--color-progress-track-inactive, #E3E3E8)';
const FILL = 'var(--color-progress-track-active, #1E49E2)';

/**
 * WorkBench ProgressIndicator — mirrors
 * packages/ui/src/components/ProgressIndicator/ProgressIndicator.jsx
 * (linear + circular, determinate + indeterminate).
 */
@Component({
  selector: 'kpmg-progress-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div
      [class]="classes()"
      [attr.id]="progressId()"
      role="progressbar"
      [attr.aria-valuenow]="isIndeterminate() ? null : rounded()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="computedAriaLabel()"
    >
      @if ((label() || showValue()) && isLinear()) {
        <div class="kpmg-progress__header">
          @if (label()) { <span class="kpmg-progress__label">{{ label() }}</span> }
          @if (showValue() && !isIndeterminate()) { <span class="kpmg-progress__value-text">{{ rounded() }}%</span> }
        </div>
      }
      @if (isLinear()) {
        <div
          [class]="'kpmg-progress__linear-track' + (isIndeterminate() ? ' kpmg-progress__linear-track--indeterminate' : '')"
          style="height: 4px"
          [style.background-color]="track"
        >
          <div
            [class]="'kpmg-progress__linear-fill' + (isIndeterminate() ? ' kpmg-progress__linear-fill--indeterminate' : '')"
            [style.width]="isIndeterminate() ? '40%' : clamped() + '%'"
            [style.background-color]="fill"
          ></div>
        </div>
      } @else {
        <div class="kpmg-progress__circular-wrapper">
          <div
            [class]="'kpmg-progress__circular-container kpmg-progress__circular-container--' + sizeNorm() + (isIndeterminate() ? ' kpmg-progress__circular-container--indeterminate' : '')"
            [style.width.px]="geometry().diameter"
            [style.height.px]="geometry().diameter"
          >
            <svg
              [attr.viewBox]="'0 0 ' + geometry().diameter + ' ' + geometry().diameter"
              [attr.width]="geometry().diameter"
              [attr.height]="geometry().diameter"
              [class]="'kpmg-progress__circular-svg' + (isIndeterminate() ? ' kpmg-progress__circular-svg--indeterminate' : '')"
            >
              <circle [attr.cx]="geometry().diameter / 2" [attr.cy]="geometry().diameter / 2" [attr.r]="geometry().radius" fill="none" [attr.stroke]="track" [attr.stroke-width]="geometry().strokeWidth" />
              <circle
                [attr.cx]="geometry().diameter / 2"
                [attr.cy]="geometry().diameter / 2"
                [attr.r]="geometry().radius"
                fill="none"
                [attr.stroke]="fill"
                [attr.stroke-width]="geometry().strokeWidth"
                [attr.stroke-dasharray]="geometry().circumference"
                [attr.stroke-dashoffset]="dashOffset()"
                stroke-linecap="round"
                [class]="'kpmg-progress__circular-arc' + (isIndeterminate() ? ' kpmg-progress__circular-arc--indeterminate' : '')"
              />
            </svg>
            @if (showValue() && !isIndeterminate() && sizeNorm() !== 'small') {
              <span class="kpmg-progress__circular-value">{{ rounded() }}%</span>
            }
          </div>
          @if (label() || subtext()) {
            <div class="kpmg-progress__circular-labels">
              @if (label()) { <span class="kpmg-progress__label">{{ label() }}</span> }
              @if (subtext()) { <span class="kpmg-progress__subtext">{{ subtext() }}</span> }
            </div>
          }
        </div>
      }
      @if (subtext() && isLinear()) {
        <span class="kpmg-progress__subtext">{{ subtext() }}</span>
      }
    </div>
  `,
})
export class ProgressIndicatorComponent {
  readonly variant = input<ProgressVariant | string>('linear');
  readonly type = input<ProgressType | string>('determinate');
  /** 0–100. */
  readonly progress = input(0);
  readonly size = input<ProgressSize | string>('large');
  readonly showValue = input(false, { transform: booleanAttribute });
  readonly label = input<string | undefined>(undefined);
  readonly subtext = input<string | undefined>(undefined);
  readonly progressId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly className = input('');

  protected readonly track = TRACK;
  protected readonly fill = FILL;

  protected readonly isLinear = computed(() => this.variant().toLowerCase() === 'linear');
  protected readonly isIndeterminate = computed(() => this.type().toLowerCase() === 'indeterminate');
  protected readonly clamped = computed(() => Math.min(Math.max(this.progress(), 0), 100));
  protected readonly rounded = computed(() => Math.round(this.clamped()));
  protected readonly sizeNorm = computed(() => (this.size() || 'large').toLowerCase());

  protected readonly geometry = computed(() => {
    const size = this.sizeNorm();
    const diameter = size === 'medium' ? 48 : size === 'small' ? 24 : 88;
    const strokeWidth = size === 'medium' ? 4 : size === 'small' ? 2.5 : 6;
    const radius = (diameter - strokeWidth) / 2;
    return { diameter, strokeWidth, radius, circumference: 2 * Math.PI * radius };
  });

  protected readonly dashOffset = computed(() => {
    const { circumference } = this.geometry();
    return this.isIndeterminate() ? circumference * 0.3 : circumference - (this.clamped() / 100) * circumference;
  });

  protected readonly computedAriaLabel = computed(
    () => this.ariaLabel() || this.label() || `${this.variant()} progress indicator`,
  );

  protected readonly classes = computed(() =>
    [
      'kpmg-progress',
      `kpmg-progress--${this.isLinear() ? 'linear' : 'circular'}`,
      `kpmg-progress--${this.isIndeterminate() ? 'indeterminate' : 'determinate'}`,
      `kpmg-progress--size-${this.sizeNorm()}`,
      this.className(),
    ]
      .filter(Boolean)
      .join(' '),
  );
}
