import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, moduleMetadata } from '@storybook/angular';
import { SliderComponent } from './slider.component';

const meta: Meta<SliderComponent> = {
  title: 'Components/Slider',
  component: SliderComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SliderComponent] })],
  parameters: { layout: 'padded' },
  args: { variant: 'continuous', defaultValue: 50, min: 0, max: 100, showIndicator: false, disabled: false, label: 'Volume' },
  argTypes: {
    variant: { control: 'radio', options: ['continuous', 'discrete'] },
    state: { control: 'select', options: ['enabled', 'hovered', 'pressed', 'disabled'] },
    showIndicator: { control: 'boolean' },
    showTicks: { control: 'boolean' },
    disabled: { control: 'boolean' },
    thumbIcon: { control: false },
    indicatorIcon: { control: false },
  },
  render: (args) => ({ props: args, template: `<div style="width: 360px; padding-top: 40px"><kpmg-slider ${argsToTemplate(args)} /></div>` }),
};

export default meta;
type Story = StoryObj<SliderComponent>;

export const Continuous: Story = {};
export const WithIndicator: Story = { args: { showIndicator: true } };
export const Discrete: Story = { args: { variant: 'discrete', showIndicator: true } };
export const Disabled: Story = { args: { disabled: true } };
export const WithSubtext: Story = { args: { subtext: '0–100' } };
