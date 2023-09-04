import { expect } from 'chai';
import { query, normalizeValue, denormalizeValue, debug } from '../src/utils';
import { Nodes, Range } from '../src/models';
import { insertBookmark, toBookmark } from '../src/operations';
import LakeCore from '../src/main';

function removeBlanks(value: string) {
  value = value.replace(/>[\s\r\n]+</g, '><');
  return value.trim();
}

export function createContainer(content: string): { container: Nodes, range: Range} {
  const container = query('<div contenteditable="true"></div>').appendTo(document.body);
  container.html(normalizeValue(removeBlanks(content)));
  const range = new Range();
  const anchor = container.find('bookmark[type="anchor"]');
  const focus = container.find('bookmark[type="focus"]');
  toBookmark(range, {
    anchor,
    focus,
  });
  return {
    container,
    range,
  };
}

export function testOperation(
  content: string,
  output: string,
  callback: (range: Range) => void,
) {
  const { container, range } = createContainer(content);
  callback(range);
  insertBookmark(range);
  const html = denormalizeValue(container.html());
  container.remove();
  debug(html);
  expect(html).to.equal(removeBlanks(output));
}

export function testPlugin(
  content: string,
  output: string,
  callback: (editor: LakeCore) => void,
) {
  const { container } = createContainer(content);
  const editor = new LakeCore(container.get(0), {
    className: 'my-editor-container',
    defaultValue: removeBlanks(content),
  });
  editor.create();
  callback(editor);
  const html = editor.getValue();
  editor.remove();
  debug(html);
  expect(html).to.equal(removeBlanks(output));
}
