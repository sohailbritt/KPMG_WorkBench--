import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, moduleMetadata } from '@storybook/angular';
import { BreadcrumbsComponent } from './breadcrumbs.component';

const items = [
  { id: 'home', label: 'Home', href: '#' },
  { id: 'engagements', label: 'Engagements', href: '#' },
  { id: 'clients', label: 'Clients', href: '#', isStar: false },
  { id: 'acme', label: 'Acme Corp', href: '#', isChecked: true },
  { id: 'audit', label: 'Audit 2026' },
];

const meta: Meta<BreadcrumbsComponent> = {
  title: 'Components/Breadcrumbs',
  component: BreadcrumbsComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [BreadcrumbsComponent] })],
  parameters: { layout: 'padded' },
  args: { items, separator: '/', size: 'md', overflowTrigger: 'click' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    overflowTrigger: { control: 'radio', options: ['click', 'hover'] },
    items: { control: 'object' },
    circleCheckboxIcon: { control: false },
    starIcon: { control: false },
    checkIcon: { control: false },
  },
  render: (args) => ({ props: args, template: `<div style="min-height: 220px"><kpmg-breadcrumbs ${argsToTemplate(args)} /></div>` }),
};

export default meta;
type Story = StoryObj<BreadcrumbsComponent>;

export const Default: Story = {};
export const CollapsedClick: Story = { args: { maxItems: 3, itemsBeforeCollapse: 1 } };
export const CollapsedHover: Story = { args: { maxItems: 3, itemsBeforeCollapse: 1, overflowTrigger: 'hover' } };
export const CustomSeparator: Story = { args: { separator: '›' } };
