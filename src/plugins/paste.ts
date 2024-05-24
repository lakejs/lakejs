import type { Editor } from '..';
import { blockTagNames } from '../config/tag-names';
import { getElementRules } from '../config/element-rules';
import {
  wrapNodeList, changeTagName, fixNumberedList,
  removeBr, query, getBox, normalizeValue,
} from '../utils';
import { Nodes } from '../models/nodes';
import { HTMLParser } from '../parsers/html-parser';
import { TextParser } from '../parsers/text-parser';
import { uploadFile } from '../ui/upload';

const blockSelector = Array.from(blockTagNames).join(',');

function getPasteElementRules(): any {
  const rules = getElementRules();
  rules.div = rules.p;
  for (const key of Object.keys(rules)) {
    const attributeRules = rules[key];
    delete attributeRules.id;
    delete attributeRules.class;
  }
  return rules;
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
    if (node.isMark || node.isText || node.isBookmark || node.isInlineBox) {
      nodeList.push(node);
    } else {
      wrapNodeList(nodeList);
      nodeList = [];
    }
    node = nextNode;
  }
  wrapNodeList(nodeList);
}

function insertFirstNode(editor: Editor, otherNode: Nodes): void {
  const range = editor.selection.range;
  const boxNode = range.startNode.closest('lake-box');
  if (boxNode.length > 0) {
    const box = getBox(boxNode);
    if (box.type === 'inline') {
      if (range.isBoxStart) {
        range.setStartBefore(boxNode);
        range.collapseToStart();
      } else if (range.isBoxEnd) {
        range.setStartAfter(boxNode);
        range.collapseToStart();
      } else {
        editor.selection.removeBox();
      }
    } else {
      const paragraph = query('<p />');
      if (range.isBoxStart) {
        boxNode.before(paragraph);
        range.shrinkAfter(paragraph);
      } else if (range.isBoxEnd) {
        boxNode.after(paragraph);
        range.shrinkAfter(paragraph);
      } else {
        editor.selection.removeBox();
      }
    }
  }
  const block = range.startNode.closestBlock();
  if (otherNode.isBlockBox) {
    const box = getBox(otherNode);
    const value = otherNode.attr('value') !== '' ? box.value : undefined;
    editor.selection.insertBox(box.name, value);
    otherNode.remove();
    return;
  }
  if (otherNode.first().length > 0) {
    removeBr(block);
  }
  if (block.isEmpty && block.name === 'p') {
    block.replaceWith(otherNode);
    otherNode.find('lake-box').each(node => {
      getBox(node).render();
    });
    range.shrinkAfter(otherNode);
    return;
  }
  let child = otherNode.first();
  while(child.length > 0) {
    if (child.name === 'li') {
      child = child.first();
    }
    const nextSibling = child.next();
    editor.selection.insertNode(child);
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
  if (range.getBlocks().length === 0) {
    selection.setBlocks('<p />');
  }
  insertFirstNode(editor, firstNode);
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
    if (parts.start) {
      range.setEndAfter(parts.start);
      range.collapseToEnd();
    }
    if (parts.end && parts.end.isEmpty) {
      parts.end.remove();
    }
    selection.insertFragment(fragment);
    editor.renderBoxes();
    range.shrinkAfter(lastNode);
  }
  fixNumberedList(editor.container.children().filter(node => node.isBlock));
  editor.history.save();
}

export default (editor: Editor) => {
  if (editor.readonly) {
    return;
  }
  editor.event.on('paste', event => {
    const { requestTypes } = editor.config.image;
    const range = editor.selection.range;
    if (range.isInsideBox) {
      return;
    }
    event.preventDefault();
    const dataTransfer = (event as ClipboardEvent).clipboardData;
    if (!dataTransfer) {
      return;
    }
    editor.selection.deleteContents();
    // upload file
    if (dataTransfer.files.length > 0) {
      for (const file of dataTransfer.files) {
        if (requestTypes.indexOf(file.type) >= 0) {
          uploadFile({
            editor,
            name: file.type.indexOf('image/') === 0 ? 'image' : 'file',
            file,
            onError: error => editor.config.onMessage('error', error),
          });
        }
      }
      return;
    }
    const types = dataTransfer.types;
    const isPlainText = (types.length === 1 && types[0] === 'text/plain');
    if (isPlainText) {
      const content = dataTransfer.getData('text/plain');
      const textParser = new TextParser(content);
      const fragment = textParser.getFragment();
      editor.event.emit('beforepaste', fragment);
      pasteFragment(editor, fragment);
      return;
    }
    const content = normalizeValue(dataTransfer.getData('text/html'));
    const rules = getPasteElementRules();
    const htmlParser = new HTMLParser(content, rules);
    const fragment = htmlParser.getFragment();
    editor.event.emit('beforepaste', fragment);
    fixClipboardData(fragment);
    pasteFragment(editor, fragment);
  });
};
