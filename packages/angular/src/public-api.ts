/*
 * Public API surface of @designkpmg/angular
 */
export { ButtonComponent } from './lib/button/button.component';
export type { ButtonVariant, ButtonSize, ButtonType } from './lib/button/button.component';

export { IconButtonComponent } from './lib/icon-button/icon-button.component';
export type {
  IconButtonVariant,
  IconButtonSize,
  IconButtonShape,
  IconButtonType,
} from './lib/icon-button/icon-button.component';

export { BadgeComponent } from './lib/badge/badge.component';
export type { BadgeSize, BadgeStyleType, BadgeState, BadgePlacement } from './lib/badge/badge.component';

export { ChipComponent } from './lib/chip/chip.component';
export type { ChipType, ChipStyleType, ChipState } from './lib/chip/chip.component';

export { CheckboxComponent } from './lib/checkbox/checkbox.component';
export type { CheckboxSize, CheckboxState, CheckboxType } from './lib/checkbox/checkbox.component';

export { SwitchComponent } from './lib/switch/switch.component';
export type { SwitchState, SwitchLabelPlacement } from './lib/switch/switch.component';

export { TextareaComponent } from './lib/textarea/textarea.component';
export type { TextareaVariant, TextareaState, TextareaResize } from './lib/textarea/textarea.component';

export { TooltipComponent } from './lib/tooltip/tooltip.component';
export type {
  TooltipTheme,
  TooltipVariant,
  TooltipPlacement,
  TooltipAlign,
  TooltipCaretSize,
  TooltipTrigger,
  TooltipAction,
  TooltipItem,
} from './lib/tooltip/tooltip.component';

export { BannerComponent } from './lib/banner/banner.component';
export type { BannerState, BannerVariant, BannerProgressType } from './lib/banner/banner.component';

export { BreadcrumbsComponent } from './lib/breadcrumbs/breadcrumbs.component';
export type { BreadcrumbItem, BreadcrumbItemEvent, BreadcrumbsSize } from './lib/breadcrumbs/breadcrumbs.component';

export { DividersComponent } from './lib/dividers/dividers.component';
export type { DividerOrientation, DividerTheme, DividerWidth } from './lib/dividers/dividers.component';

export { FileUploaderComponent } from './lib/file-uploader/file-uploader.component';
export type { FileUploaderSize, FileUploaderState } from './lib/file-uploader/file-uploader.component';

export { ListComponent, ListItemComponent } from './lib/list/list.component';
export type {
  ListStyleType,
  ListSize,
  ListLeading,
  ListTrailing,
  ListElementProps,
  ListItemData,
} from './lib/list/list.component';

export { ProgressIndicatorComponent } from './lib/progress-indicator/progress-indicator.component';
export type { ProgressVariant, ProgressType, ProgressSize } from './lib/progress-indicator/progress-indicator.component';

export { SliderComponent } from './lib/slider/slider.component';
export type { SliderVariant, SliderState } from './lib/slider/slider.component';

export {
  SnackbarComponent,
  SnackbarContainerComponent,
  SnackbarOutletComponent,
  SnackbarService,
} from './lib/snackbar/snackbar.component';
export type { SnackbarSize, SnackbarPosition, SnackbarMediaItem, SnackbarOptions } from './lib/snackbar/snackbar.component';

export { TabComponent, TabItemComponent } from './lib/tab/tab.component';
export type { TabSize, TabItemState, TabId, TabItemData, TabChange } from './lib/tab/tab.component';

export { MenuIconComponent } from './lib/menu/menu-icon.component';
export type { MenuIconName } from './lib/menu/menu-icon.component';
export { MenuComponent, MenuItemComponent, MenuGroupComponent, MenuDividerComponent } from './lib/menu/menu.component';
export type {
  MenuType,
  MenuDensity,
  MenuPlacement,
  MenuItemType,
  MenuItemState,
  MenuTriggerContext,
} from './lib/menu/menu.component';
export { DropdownBaseComponent, DropdownItemGroupComponent, DropdownMenuComponent } from './lib/menu/dropdown-menu.component';
export type { DropdownStyle, DropdownSize, DropdownBaseState, DropdownItemData } from './lib/menu/dropdown-menu.component';
export { NavigationMenuComponent } from './lib/menu/navigation-menu.component';
export type { NavigationItemData } from './lib/menu/navigation-menu.component';
export { OverflowMenuComponent } from './lib/menu/overflow-menu.component';
export { AssistantMenuComponent, AssistantCardComponent } from './lib/menu/assistant-menu.component';
export type { AssistantCardData, AssistantSection } from './lib/menu/assistant-menu.component';
