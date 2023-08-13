import { NativeElement, NativeNode } from '../types/native';
import { forEach } from '../utils/for-each';
import { searchString } from '../utils/search-string';
import { camelCase } from '../utils/camel-case';
import { getCss } from '../utils/get-css';
import { getNodeList } from '../utils/get-node-list';

type EachCallback = (element: NativeNode, index: number) => boolean | void;
type EachElementCallback = (element: NativeElement, index: number) => boolean | void;

type EventItem = {
  type: string,
  listener: EventListener,
};

// eventData is a key-value object for storing all events.
// value is an array which include types and listeners.
const eventData: { [key: number]: EventItem[] } = {};

let lastNodeId = 0;

export class Nodes {
  nodeList: NativeNode[];
  length: number;

  constructor(node: NativeNode | NativeNode[]) {
    this.nodeList = Array.isArray(node) ? node : [node];
    for (let i = 0; i < this.nodeList.length; i++) {
      // lakeId is an expando for preserving node ID.
      // https://developer.mozilla.org/en-US/docs/Glossary/Expando
      if (!this.nodeList[i].lakeId) {
        this.nodeList[i].lakeId = ++lastNodeId;
      }
    }
    this.length = this.nodeList.length;
  }

  get(index: number): NativeNode {
    if (index === undefined) {
      index = 0;
    }
    return this.nodeList[index];
  }

  getAll(): NativeNode[] {
    return this.nodeList;
  }

  isElement(index: number): boolean {
    const node = this.get(index);
    return node.nodeType === NativeNode.ELEMENT_NODE;
  }

  isText(index: number): boolean {
    const node = this.get(index);
    return node.nodeType === NativeNode.TEXT_NODE;
  }

  eq(index: number): Nodes {
    const node = this.get(index);
    return new Nodes(node);
  }

  id(index: number): number {
    const node = this.get(index);
    return node.lakeId;
  }

  name(index: number): string {
    const node = this.get(index);
    return node.nodeName.toLowerCase();
  }

  each(callback: EachCallback): this {
    const nodes = this.getAll();
    for (let i = 0; i < nodes.length; i++) {
      if (callback(nodes[i], i) === false) {
        return this;
      }
    }
    return this;
  }

  eachElement(callback: EachElementCallback): this {
    const nodes = this.getAll();
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeType === NativeNode.ELEMENT_NODE) {
        if (callback(nodes[i] as NativeElement, i) === false) {
          return this;
        }
      }
    }
    return this;
  }

  find(selector: string): Nodes {
    const element = this.get(0) as NativeElement;
    const nodeList = element.querySelectorAll(selector);
    return new Nodes(Array.from(nodeList));
  }

  // The method returns the immediately preceding sibling of each element.
  prev(): Nodes {
    const element = this.get(0) as NativeElement;
    const list = [];
    if (element.previousSibling) {
      list.push(element.previousSibling);
    }
    return new Nodes(list);
  }

  // The method returns the immediately following sibling of each element.
  next(): Nodes {
    const element = this.get(0) as NativeElement;
    const list = [];
    if (element.nextSibling) {
      list.push(element.nextSibling);
    }
    return new Nodes(list);
  }

  on(type: string, listener: EventListener): this {
    return this.eachElement((element, index) => {
      element.addEventListener(type, listener, false);
      const elementId = this.id(index);
      if (!eventData[elementId]) {
        eventData[elementId] = [];
      }
      eventData[elementId].push({
        type,
        listener,
      });
    });
  }

  off(type?: string, listener?: EventListener): this {
    return this.eachElement((element, index) => {
      const elementId = this.id(index);
      const eventItems = eventData[elementId] || [];
      eventItems.forEach((item: EventItem, index: number) => {
        if (!type || type === item.type && (!listener || listener === item.listener)) {
          element.removeEventListener(item.type, item.listener, false);
          eventItems[index] = {
            type: '',
            listener: () => {},
          };
        }
      });
      eventData[elementId] = eventItems.filter((item: EventItem) => {
        return item.type !== '';
      });
    });
  }

  fire(type: string): this {
    return this.eachElement((element, index) => {
      const elementId = this.id(index);
      const eventItems = eventData[elementId];
      eventItems.forEach((item: EventItem) => {
        if (type === item.type) {
          item.listener.call(element, new Event(type));
        }
      });
    });
  }

  getEventListeners(index: number): EventItem[] {
    const elementId = this.id(index);
    return eventData[elementId];
  }

  hasAttr(attributeName: string): boolean {
    const element = this.get(0) as NativeElement;
    return element.hasAttribute(attributeName);
  }

  attr(attributeName: string): string;
  attr(attributeName: string, value: string): this;
  attr(attributeName: { [key: string]: string }): this;
  attr(attributeName: any, value?: any): any {
    if (typeof attributeName === 'object') {
      forEach(attributeName, (name, val) => {
        this.attr(name, val);
      });
      return this;
    }
    if (value === undefined) {
      const element = this.get(0) as NativeElement;
      return element.getAttribute(attributeName) || '';
    }
    return this.eachElement(element => {
      element.setAttribute(attributeName, value);
    });
  }

  removeAttr(attributeName: string): this {
    return this.eachElement(element => {
      element.removeAttribute(attributeName);
    });
  }

  hasClass(className: string): boolean {
    const element = this.get(0) as NativeElement;
    return searchString(element.className, className, ' ');
  }

  addClass(className: string | string[]): this {
    if (Array.isArray(className)) {
      className.forEach(name => {
        this.addClass(name);
      });
      return this;
    }
    return this.eachElement(element => {
      element.classList.add(className);
    });
  }

  removeClass(className: string | string[]): this {
    if (Array.isArray(className)) {
      className.forEach(name => {
        this.removeClass(name);
      });
      return this;
    }
    return this.eachElement(element => {
      element.classList.remove(className);
      if (element.className === '') {
        element.removeAttribute('class');
      }
    });
    return this;
  }

  css(propertyName: string): string;
  css(propertyName: { [key: string]: string }): this;
  css(propertyName: string, value: string): this;
  css(propertyName: any, value?: any): any {
    if (typeof propertyName === 'object') {
      forEach(propertyName, (name, val) => {
        this.css(name, val);
      });
      return this;
    }
    if (value === undefined) {
      const element = this.get(0) as NativeElement;
      return getCss(element, propertyName);
    }
    return this.eachElement(element => {
      element.style[camelCase(propertyName)] = value;
    });
  }

  show(displayType: string = 'block'): this {
    this.css('display', displayType);
    return this;
  }

  hide(): this {
    this.css('display', 'none');
    return this;
  }

  html(): string;
  html(value: string): this;
  html(value?: any): any {
    if (value === undefined) {
      const element = this.get(0) as NativeElement;
      return element.innerHTML;
    }
    return this.eachElement(element => {
      element.innerHTML = value;
    });
  }

  // The method removes all child nodes of each element.
  empty(): this {
    this.html('');
    return this;
  }

  // The method inserts the specified content as the first child of each element.
  prepend(content: string | NativeNode | Nodes): this {
    return this.eachElement(element => {
      let list: NativeNode[] = [];
      if (content instanceof Nodes) {
        list = content.getAll();
      } else {
        list = getNodeList(content);
      }
      list = list.reverse();
      list.forEach((node: NativeNode) => {
        if (element.firstChild) {
          element.insertBefore(node, element.firstChild);
        } else {
          element.appendChild(node);
        }
      });
    });
  }

  // The method inserts the specified content as the last child of each element.
  append(content: string | NativeNode | Nodes): this {
    return this.eachElement(element => {
      let list: NativeNode[] = [];
      if (content instanceof Nodes) {
        list = content.getAll();
      } else {
        list = getNodeList(content);
      }
      list.forEach((node: NativeNode) => {
        element.appendChild(node);
      });
    });
  }

  // The method inserts each element as the last child of the target.
  appendTo(target: string | NativeElement | Nodes): this {
    return this.each(node => {
      let targetNodes: Nodes;
      if (target instanceof Nodes) {
        targetNodes = target;
      } else {
        const list = getNodeList(target);
        targetNodes = new Nodes(list);
      }
      targetNodes.append(node);
    });
  }

  // The method inserts the specified content after each element.
  after(content: string | NativeNode | Nodes): this {
    return this.eachElement(element => {
      let list: NativeNode[] = [];
      if (content instanceof Nodes) {
        list = content.getAll();
      } else {
        list = getNodeList(content);
      }
      list = list.reverse();
      list.forEach((node: NativeNode) => {
        if (!element.parentNode) {
          return;
        }
        if (element.nextSibling) {
          element.parentNode.insertBefore(node, element.nextSibling);
        } else {
          element.parentNode.appendChild(node);
        }
      });
    });
  }

  // The method removes each element from the DOM.
  // keepChildren parameter:
  // A boolean value; true only removes each element and keeps all child nodes; false removes all nodes; if omitted, it defaults to false.
  remove(keepChildren: boolean = false): this {
    this.each(node => {
      if (!node.parentNode) {
        return;
      }
      if (keepChildren) {
        let child = node.firstChild;
        while (child) {
          const next = child.nextSibling;
          node.parentNode.insertBefore(child, node);
          child = next;
        }
      }
      node.parentNode.removeChild(node);
    });
    return this;
  }
}
