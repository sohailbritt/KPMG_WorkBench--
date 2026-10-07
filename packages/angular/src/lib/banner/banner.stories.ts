import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, moduleMetadata } from '@storybook/angular';
import { BannerComponent } from './banner.component';

const meta: Meta<BannerComponent> = {
  title: 'Components/Banner',
  component: BannerComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [BannerComponent] })],
  parameters: { layout: 'padded' },
  args: { variant: 'primary', state: 'default', title: 'Configuring', detail: '30%', dismissible: false },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'neutral', 'info', 'success', 'warning', 'critical'] },
    state: { control: 'radio', options: ['default', 'animated'] },
    progressType: { control: 'radio', options: [undefined, 'determinate', 'indeterminate'] },
    progress: { control: { type: 'range', min: 0, max: 100 } },
    icon: { control: false },
    action: { control: false },
  },
  render: (args) => ({ props: args, template: `<kpmg-banner ${argsToTemplate(args)} />` }),
};

export default meta;
type Story = StoryObj<BannerComponent>;

export const Primary: Story = {};
export const Neutral: Story = { args: { variant: 'neutral' } };
export const Info: Story = { args: { variant: 'info', title: 'Synchronizing data', detail: '60%' } };
export const Success: Story = { args: { variant: 'success', title: 'Completed', detail: '100%' } };
export const Warning: Story = { args: { variant: 'warning', title: 'Near threshold', detail: '85%' } };
export const Critical: Story = { args: { variant: 'critical', title: 'Validation error', detail: 'Error', showProgress: false } };
export const AnimatedIndeterminate: Story = { args: { state: 'animated', detail: undefined, progressType: 'indeterminate', showProgress: true } };
export const Dismissible: Story = { args: { dismissible: true } };
