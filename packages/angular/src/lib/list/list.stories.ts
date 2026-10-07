import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ListComponent, ListItemComponent } from './list.component';

const items = [
  { id: 1, title: 'Jane Smith', supportingText: 'Engagement lead', secondaryText: 'London', leading: 'avatar' as const, leadingProps: { initials: 'JS' }, trailing: 'chevron' as const, interactive: true },
  { id: 2, title: 'Sam Patel', supportingText: 'Senior associate', secondaryText: 'Mumbai', leading: 'avatar' as const, leadingProps: { initials: 'SP' }, trailing: 'chevron' as const, interactive: true, selected: true },
  { id: 3, title: 'Alex Kim', supportingText: 'Analyst', secondaryText: 'Singapore', leading: 'checkbox' as const, leadingProps: { checked: true }, trailing: 'checkbox' as const },
  { id: 4, title: 'Disabled row', supportingText: 'Not available', leading: 'radio' as const, disabled: true },
];

const meta: Meta<ListComponent> = {
  title: 'Components/List',
  component: ListComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ListComponent, ListItemComponent] })],
  parameters: { layout: 'padded' },
  args: { styleType: 'outlined', size: 'medium', divided: false, items },
  argTypes: {
    styleType: { control: 'radio', options: ['outlined', 'elevated', 'filled'] },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    divided: { control: 'boolean' },
    items: { control: 'object' },
  },
  render: (args) => ({
    props: args,
    template: `<div style="width: 420px"><kpmg-list [styleType]="styleType" [size]="size" [divided]="divided" [items]="items" /></div>`,
  }),
};

export default meta;
type Story = StoryObj<ListComponent>;

export const Outlined: Story = {};
export const Elevated: Story = { args: { styleType: 'elevated' } };
export const Filled: Story = { args: { styleType: 'filled', divided: true } };
export const Small: Story = { args: { size: 'small' } };
export const Large: Story = { args: { size: 'large' } };

export const Declarative: Story = {
  render: () => ({
    template: `
      <div style="width: 420px">
        <kpmg-list divided>
          <li kpmg-list-item title="Inbox" supportingText="3 new messages" trailing="chevron" interactive></li>
          <li kpmg-list-item title="Drafts" supportingText="1 draft" trailing="chevron" interactive></li>
          <li kpmg-list-item title="Archive" supportingText="Read-only" disabled></li>
        </kpmg-list>
      </div>`,
  }),
};
