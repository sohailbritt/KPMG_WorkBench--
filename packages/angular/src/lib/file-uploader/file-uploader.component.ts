import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type FileUploaderSize = 'small' | 'medium' | 'large';
export type FileUploaderState = 'outline' | 'elevated' | 'filled';

/**
 * WorkBench FileUploader — mirrors packages/ui/src/components/FileUploader/FileUploader.jsx
 * (3 sizes × 3 states, drag & drop). `onFileSelect` → `filesSelected`;
 * `onDrop` → `filesDropped`. `icon` is an `<ng-template>` ref.
 */
@Component({
  selector: 'kpmg-file-uploader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { style: 'display: contents' },
  template: `
    <div
      [class]="classes()"
      role="button"
      [attr.tabindex]="disabled() ? -1 : 0"
      [attr.aria-disabled]="disabled()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      (click)="browse()"
      (keydown.enter)="browse()"
      (keydown.space)="$event.preventDefault(); browse()"
    >
      <input
        #fileInput
        type="file"
        class="kpmg-uploader__input"
        [attr.id]="inputId()"
        [attr.name]="name()"
        [attr.accept]="accept() ?? null"
        [multiple]="multiple()"
        aria-hidden="true"
        (change)="onInputChange($event)"
      />
      <div class="kpmg-uploader__icon-wrapper" aria-hidden="true">
        @if (icon(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" />
        } @else if (sizeNorm() === 'large') {
          <svg viewBox="0 0 64 64" width="64" height="64" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="kpmg-uploader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#AAB0F4" />
                <stop offset="50%" stop-color="#818AEE" />
                <stop offset="100%" stop-color="#5965E9" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="16" fill="url(#kpmg-uploader-grad)" />
          </svg>
        } @else {
          <svg viewBox="0 0 24 24" [attr.width]="sizeNorm() === 'small' ? 18 : 24" [attr.height]="sizeNorm() === 'small' ? 18 : 24" fill="none" [attr.stroke]="sizeNorm() === 'small' ? '#454554' : '#3D405B'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="12" y1="19" x2="12" y2="7" />
            <polyline points="5 12 12 5 19 12" />
            <line x1="5" y1="2" x2="19" y2="2" />
          </svg>
        }
      </div>
      <div class="kpmg-uploader__content">
        <span class="kpmg-uploader__prompt">
          <span class="kpmg-uploader__label-text">{{ label() }}</span>
          <span class="kpmg-uploader__link-text">{{ browseText() }}</span>
        </span>
        @if (subtext()) { <span class="kpmg-uploader__subtext">{{ subtext() }}</span> }
      </div>
    </div>
  `,
})
export class FileUploaderComponent {
  readonly size = input<FileUploaderSize | string>('medium');
  readonly state = input<FileUploaderState | string>('outline');
  readonly label = input('Drag and drop files or ');
  readonly browseText = input('browse on computer');
  readonly subtext = input<string | undefined>(undefined);
  /** Accepted formats, e.g. '.png,.jpg,.pdf'. */
  readonly accept = input<string | undefined>(undefined);
  readonly multiple = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly icon = input<TemplateRef<unknown> | null>(null);
  readonly inputId = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly className = input('');

  /** Files chosen via the picker or dropped. */
  readonly filesSelected = output<File[]>();
  /** The raw drop event plus its files. */
  readonly filesDropped = output<{ event: DragEvent; files: File[] }>();

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  protected readonly isDragOver = signal(false);
  protected readonly sizeNorm = computed(() => (this.size() || 'medium').toLowerCase());
  private readonly stateNorm = computed(() => (this.state() || 'outline').toLowerCase());

  protected readonly classes = computed(() =>
    [
      'kpmg-uploader',
      `kpmg-uploader--size-${this.sizeNorm()}`,
      `kpmg-uploader--state-${this.stateNorm()}`,
      this.isDragOver() ? 'kpmg-uploader--drag-over' : '',
      this.disabled() ? 'kpmg-uploader--disabled' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected browse(): void {
    if (this.disabled()) return;
    this.fileInput().nativeElement.click();
  }

  protected onInputChange(event: Event): void {
    if (this.disabled()) return;
    this.filesSelected.emit(Array.from((event.target as HTMLInputElement).files ?? []));
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled()) this.isDragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    if (this.disabled()) return;
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.filesDropped.emit({ event, files });
    this.filesSelected.emit(files);
  }
}
