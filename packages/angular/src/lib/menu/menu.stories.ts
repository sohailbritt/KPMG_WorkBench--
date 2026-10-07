import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MenuComponent, MenuDividerComponent, MenuGroupComponent, MenuItemComponent } from './menu.component';
import { DropdownItemGroupComponent, DropdownMenuComponent } from './dropdown-menu.component';
import { NavigationMenuComponent } from './navigation-menu.component';
import { OverflowMenuComponent } from './overflow-menu.component';
import { AssistantMenuComponent } from './assistant-menu.component';

const meta: Meta<MenuComponent> = {
  title: 'Components/Menu',
  component: MenuComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        MenuComponent,
        MenuItemComponent,
        MenuGroupComponent,
        MenuDividerComponent,
        DropdownMenuComponent,
        DropdownItemGroupComponent,
        NavigationMenuComponent,
        OverflowMenuComponent,
        AssistantMenuComponent,
      ],
    }),
  ],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<MenuComponent>;

const frame = (body: string) => `<div style="min-height: 460px; min-width: 460px">${body}</div>`;

/** Core `kpmg-menu`, rendered inline. */
export const Inline: Story = {
  render: () => ({
    template: frame(`
      <kpmg-menu inline width="280">
        <button kpmg-menu-item label="Open" description="Open in a new tab"></button>
        <button kpmg-menu-item label="Duplicate"></button>
        <hr kpmg-menu-divider />
        <div kpmg-menu-group title="Danger zone">
          <button kpmg-menu-item label="Delete" destructive></button>
        </div>
      </kpmg-menu>`),
  }),
};

export const Dropdown: Story = {
  render: () => ({
    template: frame(`<kpmg-dropdown-menu triggerLabel="Options" [items]="[
      { label: 'Option 1', value: 'a' }, { type: 'divider' }, { label: 'Option 2', value: 'b' }, { label: 'Disabled', value: 'c', disabled: true }
    ]" [selectedValues]="['a']" />`),
  }),
};

export const DropdownCard: Story = {
  render: () => ({
    template: frame(`<kpmg-dropdown-menu baseStyle="card" triggerLabel="Header" [items]="[{ label: 'Option 1', value: 'a' }, { label: 'Option 2', value: 'b' }]" />`),
  }),
};

export const DropdownItemList: Story = {
  render: () => ({ template: frame(`<div style="width: 280px"><kpmg-dropdown-item-group type="item-list" /></div>`) }),
};

export const Navigation: Story = {
  render: () => ({
    template: frame(`<kpmg-navigation-menu brandLabel="KPMG" activeItem="home" [items]="[
      { label: 'Home', value: 'home' },
      { label: 'Projects', value: 'projects', badge: 4 },
      { type: 'divider' },
      { type: 'group', title: 'Admin', items: [{ label: 'Users', value: 'users' }, { label: 'Billing', value: 'billing', disabled: true }] }
    ]" />`),
  }),
};

export const NavigationInline: Story = {
  render: () => ({
    template: frame(`<kpmg-navigation-menu inline [items]="[{ label: 'Home', value: 'home' }, { label: 'Reports', value: 'reports' }]" activeItem="reports" />`),
  }),
};

export const Overflow: Story = {
  render: () => ({ template: frame(`<kpmg-overflow-menu />`) }),
};

export const OverflowItemList: Story = {
  render: () => ({ template: frame(`<kpmg-overflow-menu groupType="item-list" size="small" />`) }),
};

export const Assistant: Story = {
  render: () => ({ template: frame(`<kpmg-assistant-menu [defaultOpen]="true" />`) }),
};
