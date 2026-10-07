import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, moduleMetadata } from '@storybook/angular';
import { FileUploaderComponent } from './file-uploader.component';

const meta: Meta<FileUploaderComponent> = {
  title: 'Components/FileUploader',
  component: FileUploaderComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FileUploaderComponent] })],
  parameters: { layout: 'padded' },
  args: { size: 'medium', state: 'outline', multiple: true, disabled: false, subtext: 'PNG, JPG or PDF up to 10MB' },
  argTypes: {
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    state: { control: 'radio', options: ['outline', 'elevated', 'filled'] },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    icon: { control: false },
  },
  render: (args) => ({ props: args, template: `<div style="width: 420px"><kpmg-file-uploader ${argsToTemplate(args)} /></div>` }),
};

export default meta;
type Story = StoryObj<FileUploaderComponent>;

export const Outline: Story = {};
export const Elevated: Story = { args: { state: 'elevated' } };
export const Filled: Story = { args: { state: 'filled' } };
export const Small: Story = { args: { size: 'small' } };
export const Large: Story = { args: { size: 'large' } };
export const Disabled: Story = { args: { disabled: true } };
