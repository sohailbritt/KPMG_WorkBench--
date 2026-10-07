import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, moduleMetadata } from '@storybook/angular';
import { ProgressIndicatorComponent } from './progress-indicator.component';

const meta: Meta<ProgressIndicatorComponent> = {
  title: 'Components/ProgressIndicator',
  component: ProgressIndicatorComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ProgressIndicatorComponent] })],
  parameters: { layout: 'padded' },
  args: { variant: 'linear', type: 'determinate', progress: 60, size: 'large', showValue: true, label: 'Uploading' },
  argTypes: {
    variant: { control: 'radio', options: ['linear', 'circular'] },
    type: { control: 'radio', options: ['determinate', 'indeterminate'] },
    size: { control: 'radio', options: ['large', 'medium', 'small'] },
    progress: { control: { type: 'range', min: 0, max: 100 } },
    showValue: { control: 'boolean' },
  },
  render: (args) => ({ props: args, template: `<div style="width: 320px"><kpmg-progress-indicator ${argsToTemplate(args)} /></div>` }),
};

export default meta;
type Story = StoryObj<ProgressIndicatorComponent>;

export const Linear: Story = {};
export const LinearIndeterminate: Story = { args: { type: 'indeterminate' } };
export const LinearWithSubtext: Story = { args: { subtext: 'Almost there' } };
export const CircularLarge: Story = { args: { variant: 'circular' } };
export const CircularMedium: Story = { args: { variant: 'circular', size: 'medium' } };
export const CircularSmall: Story = { args: { variant: 'circular', size: 'small', label: undefined } };
export const CircularIndeterminate: Story = { args: { variant: 'circular', type: 'indeterminate' } };
