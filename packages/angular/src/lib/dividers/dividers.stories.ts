import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, moduleMetadata } from '@storybook/angular';
import { DividersComponent } from './dividers.component';

const meta: Meta<DividersComponent> = {
  title: 'Components/Dividers',
  component: DividersComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DividersComponent] })],
  parameters: { layout: 'padded' },
  args: { orientation: 'horizontal', theme: 'light', width: 'full' },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    theme: { control: 'radio', options: ['light', 'dark'] },
    width: {
      control: 'select',
      options: ['full', 'inset', 'inset-middle', 'inset-middle-small', 'inset-middle-medium', 'inset-middle-large', 'inset-middle-with-text'],
    },
  },
  render: (args) => ({
    props: args,
    template: `<div [style.height]="orientation === 'vertical' ? '80px' : 'auto'" style="width: 360px"><kpmg-divider ${argsToTemplate(args)} /></div>`,
  }),
};

export default meta;
type Story = StoryObj<DividersComponent>;

export const Full: Story = {};
export const Inset: Story = { args: { width: 'inset' } };
export const InsetMiddleMedium: Story = { args: { width: 'inset-middle-medium' } };
export const WithText: Story = { args: { width: 'inset-middle-with-text', text: 'Subheader' } };
export const Dark: Story = { args: { theme: 'dark' }, parameters: { backgrounds: { default: 'dark' } } };
export const Vertical: Story = { args: { orientation: 'vertical' } };
