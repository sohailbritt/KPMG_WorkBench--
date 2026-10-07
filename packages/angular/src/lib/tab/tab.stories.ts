import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TabComponent, TabItemComponent } from './tab.component';

const items = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity', badge: 3 },
  { id: 'settings', label: 'Settings' },
  { id: 'archive', label: 'Archive', disabled: true },
];

const meta: Meta<TabComponent> = {
  title: 'Components/Tab',
  component: TabComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [TabComponent, TabItemComponent] })],
  parameters: { layout: 'padded' },
  args: { size: 'small', bordered: true, fullWidth: false, items },
  argTypes: {
    size: { control: 'radio', options: ['small', 'large'] },
    bordered: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    items: { control: 'object' },
    actions: { control: false },
  },
  render: (args) => ({
    props: args,
    template: `<kpmg-tab [size]="size" [bordered]="bordered" [fullWidth]="fullWidth" [items]="items" />`,
  }),
};

export default meta;
type Story = StoryObj<TabComponent>;

export const Small: Story = {};
export const Large: Story = { args: { size: 'large' } };
export const FullWidth: Story = { args: { fullWidth: true } };

export const Declarative: Story = {
  render: () => ({
    template: `
      <kpmg-tab defaultValue="a">
        <button kpmg-tab-item tabId="a" label="First"></button>
        <button kpmg-tab-item tabId="b" label="Second" [badge]="12"></button>
        <button kpmg-tab-item tabId="c">Third</button>
      </kpmg-tab>`,
  }),
};
