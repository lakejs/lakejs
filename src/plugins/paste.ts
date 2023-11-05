import type Editor from '..';
import { blockTagNames } from '../constants/tag-names';
import { getDefaultRules } from '../constants/schema';
import { forEach, wrapNodeList, changeTagName, fixNumberedList } from '../utils';
import { HTMLParser, TextParser, Nodes, Selection } from '../models';

const blockSelector = Array.from(blockTagNames).join(',');

// In the specified block which is empty, removes <br /> element.
function removeBr(block: Nodes): void {
  const br = block.find('br');
  if (br.length > 0 && block.isEmpty) {
    br.remove();
  }
}

function fixNestedBlocks(block: Nodes): void {
  const nodeList = [ block ];
  for  (const node of block.getWalker()) {
    nodeList.push(node);
  }
  for (const node of nodeList) {
    if (node.name === 'div') {
      if (node.find(blockSelector).length > 0) {
        node.remove(true);
      } else {
        changeTagName(node, 'p');
      }
    } else if (node.isHeading || ['blockquote', 'li'].indexOf(node.name) >= 0) {
      node.find(blockSelector).remove(true);
    }
  }
}

function fixClipboardData(fragment: DocumentFragment): void {
  let node = new Nodes(fragment.firstChild);
  while (node.length > 0) {
    const nextNode = node.next();
    if (node.isBlock) {
      fixNestedBlocks(node);
    }
    node = nextNode;
  }
  let nodeList: Nodes[] = [];
  node = new Nodes(fragment.firstChild);
  while (node.length > 0) {
    const nextNode = node.next();
    if (node.isMark || node.isText || node.isBookmark) {
      nodeList.push(node);
    } else {
      wrapNodeList(nodeList);
      nodeList = [];
    }
    node = nextNode;
  }
  wrapNodeList(nodeList);
}

function insertFirstNode(selection: Selection, otherNode: Nodes): void {
  const range = selection.range;
  const block = range.startNode.closestBlock();
  if (otherNode.first().length > 0) {
    removeBr(block);
  }
  if (block.isEmpty && block.name === 'p') {
    block.replaceWith(otherNode);
    range.selectAfterNodeContents(otherNode);
    return;
  }
  let child = otherNode.first();
  while(child.length > 0) {
    if (child.name === 'li') {
      child = child.first();
    }
    const nextSibling = child.next();
    selection.insertNode(child);
    child = nextSibling;
  }
  otherNode.remove();
}

function pasteFragment(editor: Editor, fragment: DocumentFragment): void {
  const selection = editor.selection;
  const range = selection.range;
  if (fragment.childNodes.length === 0) {
    return;
  }
  const firstNode = new Nodes(fragment.firstChild);
  let lastNode = new Nodes(fragment.lastChild);
  if (selection.getBlocks().length === 0) {
    selection.setBlocks('<p />');
  }
  insertFirstNode(selection, firstNode);
  // remove br
  let child = new Nodes(fragment.firstChild);
  while (child.length > 0) {
    const next = child.next();
    if (child.name === 'br') {
      child.remove();
    }
    child = next;
  }
  lastNode = new Nodes(fragment.lastChild);
  // insert fragment
  if (fragment.childNodes.length > 0) {
    const parts = selection.splitBlock();
    if (parts.left) {
      range.setEndAfter(parts.left);
      range.collapseToEnd();
    }
    if (parts.right && parts.right.isEmpty) {
      parts.right.remove();
    }
    selection.insertFragment(fragment);
    range.selectAfterNodeContents(lastNode);
  }
  fixNumberedList(editor.container.children());
  editor.history.save();
  editor.select();
}

export default (editor: Editor) => {
  editor.container.on('paste', event => {
    event.preventDefault();
    const dataTransfer = (event as ClipboardEvent).clipboardData;
    if (!dataTransfer) {
      return;
    }
    editor.selection.deleteContents();
    const types = dataTransfer.types;
    const isPlainText = (types.length === 1 && types[0] === 'text/plain');
    if (isPlainText) {
      const content = dataTransfer.getData('text/plain');
      const textParser = new TextParser(content);
      const fragment = textParser.getFragment();
      pasteFragment(editor, fragment);
      return;
    }
    const content = dataTransfer.getData('text/html');
    const rules = getDefaultRules();
    rules.div = rules.p;
    forEach(rules, (key, attributeRules) => {
      delete attributeRules.id;
      delete attributeRules.class;
    });
    const htmlParser = new HTMLParser(content, rules);
    const fragment = htmlParser.getFragment();
    fixClipboardData(fragment);
    pasteFragment(editor, fragment);
  });
};
