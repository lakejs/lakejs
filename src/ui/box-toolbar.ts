import { Editor } from '../editor';
import { NativeNode } from '../types/native';
import { BoxToolbarButtonItem, BoxToolbarDropdownItem, BoxToolbarItem } from '../types/box-toolbar';
import { query } from '../utils/query';
import { Nodes } from '../models/nodes';
import { Box } from '../models/box';
import { Button } from './button';
import { Dropdown } from './dropdown';

type ToolbarPlacement = 'top' | 'bottom';

type ToolbarConfig = {
  root: string | Nodes | NativeNode;
  editor: Editor;
  box: Box;
  items: (string | BoxToolbarItem)[];
  placement?: ToolbarPlacement;
};

const toolbarItemMap: Map<string, BoxToolbarItem> = new Map();

export class BoxToolbar {

  private root: Nodes;

  private editor: Editor;

  private box: Box;

  private items: (string | BoxToolbarItem)[];

  private placement: ToolbarPlacement = 'top';

  private buttonItemList: BoxToolbarButtonItem[] = [];

  private dropdownItemList: BoxToolbarDropdownItem[] = [];

  public container: Nodes;

  constructor(config: ToolbarConfig) {
    this.root = query(config.root);
    this.editor = config.editor;
    this.box = config.box;
    this.items = config.items;
    if (config.placement) {
      this.placement = config.placement;
    }
    this.container = query('<div class="lake-box-toolbar" />');
    this.root.addClass('lake-custom-properties');
  }

  private appendDivider(): void {
    this.container.append('<div class="lake-box-toolbar-divider" />');
  }

  private appendButton(item: BoxToolbarButtonItem): void {
    const button = new Button({
      root: this.container,
      name: item.name,
      icon: item.icon,
      tooltip: typeof item.tooltip === 'string' ? item.tooltip : item.tooltip(this.editor.locale),
      tabIndex: -1,
      onClick: () => {
        item.onClick(this.box, item.name);
      },
    });
    button.render();
  }

  private appendDropdown(item: BoxToolbarDropdownItem): void {
    const dropdown = new Dropdown({
      root: this.container,
      locale: this.editor.locale,
      name: item.name,
      icon: item.icon,
      accentIcon: item.accentIcon,
      downIcon: item.downIcon,
      defaultValue: item.defaultValue,
      tooltip: item.tooltip,
      width: item.width,
      menuType: item.menuType,
      menuItems: item.menuItems,
      tabIndex: -1,
      placement: this.placement === 'top' ? 'bottom' : 'top',
      onSelect: value => {
        item.onSelect(this.box, value);
      },
    });
    dropdown.render();
  }

  public updatePosition(): void {
    const boxNativeNode = this.box.node.get(0) as HTMLElement;
    const boxRect = boxNativeNode.getBoundingClientRect();
    const boxX = boxRect.x + window.scrollX;
    const boxY = boxRect.y + window.scrollY;
    const left = (boxX + boxRect.width / 2 - this.container.width() / 2).toFixed(1);
    const top = (boxY - this.container.height() - 6).toFixed(1);
    this.container.css('left', `${left}px`);
    this.container.css('top', `${top}px`);
  }

  // Renders a toolbar for the specified box.
  public render(): void {
    this.root.empty();
    this.root.append(this.container);
    this.items.forEach(name => {
      if (name === '|') {
        this.appendDivider();
        return;
      }
      let item;
      if (typeof name === 'string') {
        item = toolbarItemMap.get(name);
        if (!item) {
          return;
        }
      } else {
        item = name;
      }
      if (item.type === 'button') {
        this.buttonItemList.push(item);
        this.appendButton(item);
        return;
      }
      if (item.type === 'dropdown') {
        this.dropdownItemList.push(item);
        this.appendDropdown(item);
      }
    });
    this.updatePosition();
  }

  public unmount(): void {
    this.container.remove();
  }
}
