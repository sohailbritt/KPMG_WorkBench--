import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerTheme = 'light' | 'dark';
export type DividerWidth =
  | 'full'
  | 'inset'
  | 'inset-middle'
  | 'inset-middle-small'
  | 'inset-middle-medium'
  | 'inset-middle-large'
  | 'inset-middle-with-text';

/**
 * WorkBench Dividers — mirrors packages/ui/src/components/Dividers/Dividers.jsx
 * (18 Figma variants). Accepts the same case-insensitive values as React.
 */
@Component({
  selector: 'kpmg-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (hasText()) {
      <div
        [attr.role]="role()"
        [attr.aria-orientation]="ariaOrientation()"
        [class]="'kpmg-divider kpmg-divider--horizontal kpmg-divider--theme-' + theme_() + ' ' + widthClass() + ' ' + className()"
      >
        <div class="kpmg-divider-line-wrapper"><div class="kpmg-divider-line"></div></div>
        @if (text()) {
          <div class="kpmg-divider-text-container"><p class="kpmg-divider-text">{{ text() }}</p></div>
        }
      </div>
    } @else {
      <div
        [attr.role]="role()"
        [attr.aria-orientation]="ariaOrientation()"
        [class]="'kpmg-divider kpmg-divider--' + orientation_() + ' kpmg-divider--theme-' + theme_() + ' ' + widthClass() + ' ' + className()"
      >
        <div class="kpmg-divider-line"></div>
      </div>
    }
  `,
})
export class DividersComponent {
  readonly orientation = input<string>('horizontal');
  readonly theme = input<string>('light');
  readonly width = input<string>('full');
  readonly text = input<string | undefined>('Subheader');
  readonly role = input('separator');
  readonly ariaOrientationInput = input<DividerOrientation | undefined>(undefined, { alias: 'ariaOrientation' });
  readonly className = input('');

  private readonly isVertical = computed(() => this.orientation().toLowerCase() === 'vertical');
  protected readonly orientation_ = computed<DividerOrientation>(() => (this.isVertical() ? 'vertical' : 'horizontal'));
  protected readonly theme_ = computed<DividerTheme>(() => (this.theme().toLowerCase() === 'dark' ? 'dark' : 'light'));
  protected readonly ariaOrientation = computed(() => this.ariaOrientationInput() ?? this.orientation_());

  private readonly normalizedWidth = computed(() => this.width().toLowerCase().replace(/\s+/g, '-'));

  protected readonly hasText = computed(
    () =>
      !this.isVertical() &&
      (this.normalizedWidth().includes('with-text') || (!!this.text() && this.width().toLowerCase().includes('text'))),
  );

  protected readonly widthClass = computed(() => {
    const w = this.normalizedWidth();
    if (this.isVertical()) {
      if (w.includes('inset-middle')) return 'kpmg-divider--inset-middle';
      if (w.includes('inset')) return 'kpmg-divider--inset';
      return 'kpmg-divider--full';
    }
    if (this.hasText()) return 'kpmg-divider--inset-middle-with-text';
    if (w.includes('large')) return 'kpmg-divider--inset-middle-large';
    if (w.includes('medium')) return 'kpmg-divider--inset-middle-medium';
    if (w.includes('small')) return 'kpmg-divider--inset-middle-small';
    if (w === 'inset') return 'kpmg-divider--inset';
    return 'kpmg-divider--full';
  });
}
