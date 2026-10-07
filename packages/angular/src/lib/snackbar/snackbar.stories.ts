import { Component, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, moduleMetadata } from '@storybook/angular';
import { SnackbarComponent, SnackbarOutletComponent, SnackbarService } from './snackbar.component';

@Component({
  selector: 'kpmg-snackbar-demo',
  imports: [SnackbarOutletComponent],
  template: `
    <button type="button" (click)="show()">Show snackbar</button>
    <kpmg-snackbar-outlet position="bottom-center" />
  `,
})
class SnackbarDemoComponent {
  private readonly snackbars = inject(SnackbarService);
  show(): void {
    this.snackbars.show({ message: 'Changes saved', action: 'Undo', autoHideDuration: 4000 });
  }
}

const meta: Meta<SnackbarComponent> = {
  title: 'Components/Snackbar',
  component: SnackbarComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SnackbarComponent, SnackbarDemoComponent] })],
  parameters: { layout: 'padded' },
  args: { open: true, size: 'single-line', message: 'Snackbar text goes here', action: 'Action', outlined: false, closeable: true },
  argTypes: {
    size: { control: 'select', options: ['single-line', 'two-line', 'extended', 'extended-header', 'extended-media'] },
    outlined: { control: 'boolean' },
    closeable: { control: 'boolean' },
    actionTemplate: { control: false },
  },
  render: (args) => ({ props: args, template: `<kpmg-snackbar ${argsToTemplate(args)} />` }),
};

export default meta;
type Story = StoryObj<SnackbarComponent>;

export const SingleLine: Story = {};
export const Outlined: Story = { args: { outlined: true } };
export const Extended: Story = { args: { size: 'extended' } };
export const ExtendedHeader: Story = { args: { size: 'extended-header', header: 'Upload complete' } };
export const ExtendedMedia: Story = { args: { size: 'extended-media', header: 'Recent files' } };

/** Imperative API: inject `SnackbarService` and render one `<kpmg-snackbar-outlet>`. */
export const Imperative: Story = {
  render: () => ({ template: `<kpmg-snackbar-demo />` }),
};
