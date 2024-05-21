import { boxes } from '../../src/storage/boxes';
import { normalizeValue, query, getBox } from '../../src/utils';
import { Nodes } from '../../src/models/nodes';
import { Range } from '../../src/models/range';
import { Selection } from '../../src/managers/selection';

describe('managers / selection', () => {

  let container: Nodes;

  beforeEach(() => {
    boxes.set('inlineBox', {
      type: 'inline',
      name: 'inlineBox',
      render: () => '<img />',
    });
    boxes.set('blockBox', {
      type: 'block',
      name: 'blockBox',
      render: () => '<hr />',
    });
    container = query('<div contenteditable="true" />');
    query(document.body).append(container);
  });

  afterEach(() => {
    boxes.delete('inlineBox');
    boxes.delete('blockBox');
    container.remove();
  });

  it('sync method: sets the saved range to the selection', () => {
    const selection = new Selection(container);
    const range = new Range();
    container.html('<p>foo</p>');
    range.selectNodeContents(container.find('p'));
    selection.range = range;
    selection.sync();
    const rangeFromSelection = new Range(window.getSelection()?.getRangeAt(0));
    expect(rangeFromSelection.startNode.name).to.equal('p');
    expect(rangeFromSelection.startOffset).to.equal(0);
    expect(rangeFromSelection.endNode.name).to.equal('p');
    expect(rangeFromSelection.endOffset).to.equal(1);
  });

  it('updateByRange method: with the current selected range from the selection', () => {
    const selection = new Selection(container);
    const range = new Range();
    container.html('<p>foo</p>');
    range.selectNodeContents(container.find('p'));
    selection.range = range;
    selection.sync();
    selection.range = new Range();
    expect(selection.range.startNode.get(0)).to.equal(document);
    selection.updateByRange();
    expect(selection.range.startNode.name).to.equal('p');
    expect(selection.range.startOffset).to.equal(0);
    expect(selection.range.endNode.name).to.equal('p');
    expect(selection.range.endOffset).to.equal(1);
  });

  it('updateByBookmark method: with ordinary bookmark', () => {
    const content = `
    <p><anchor />foo<focus /></p>
    `;
    const selection = new Selection(container);
    container.html(normalizeValue(content.trim()));
    selection.updateByBookmark();
    expect(selection.range.startNode.name).to.equal('p');
    expect(selection.range.startOffset).to.equal(0);
    expect(selection.range.endNode.name).to.equal('p');
    expect(selection.range.endOffset).to.equal(1);
  });

  it('updateByBookmark method: with box-bookmark', () => {
    const content = `
    <lake-box type="block" name="blockBox" focus="end"></lake-box>
    `;
    const selection = new Selection(container);
    container.html(normalizeValue(content.trim()));
    selection.updateByBookmark();
    expect(selection.range.isBoxEnd).to.equal(true);
  });

  it('getAppliedItems method: is a collapsed range', () => {
    const content = `
    <p><strong>one<i>tw<focus />o</i>three</strong></p>
    `;
    const selection = new Selection(container);
    container.html(normalizeValue(content.trim()));
    selection.updateByBookmark();
    const appliedItems = selection.getAppliedItems();
    expect(appliedItems.length).to.equal(3);
    expect(appliedItems[0].name).to.equal('i');
    expect(appliedItems[1].name).to.equal('strong');
    expect(appliedItems[2].name).to.equal('p');
  });

  it('getAppliedItems method: is an expanded range', () => {
    const content = `
    <p><strong>one<i>tw<anchor />o</i>three</strong><focus /></p>
    `;
    const selection = new Selection(container);
    container.html(normalizeValue(content.trim()));
    selection.updateByBookmark();
    const appliedItems = selection.getAppliedItems();
    expect(appliedItems.length).to.equal(3);
    expect(appliedItems[0].name).to.equal('i');
    expect(appliedItems[1].name).to.equal('strong');
    expect(appliedItems[2].name).to.equal('p');
  });

  it('getAppliedItems method: gets attributes', () => {
    const content = `
    <p><span style="color: red;" class="foo">one<i>tw<focus />o</i>three</strong></p>
    `;
    const selection = new Selection(container);
    container.html(normalizeValue(content.trim()));
    selection.updateByBookmark();
    const appliedItems = selection.getAppliedItems();
    expect(appliedItems.length).to.equal(3);
    expect(appliedItems[0].name).to.equal('i');
    expect(appliedItems[1].name).to.equal('span');
    expect(appliedItems[1].attributes).to.deep.equal({style: 'color: red;', class: 'foo'});
    expect(appliedItems[2].name).to.deep.equal('p');
  });

  it('getAppliedItems method: should get strong tag', () => {
    const content = `
    <p>one<anchor /><i><strong>two</strong></i><focus />three</p>
    `;
    const selection = new Selection(container);
    container.html(normalizeValue(content.trim()));
    selection.updateByBookmark();
    const appliedItems = selection.getAppliedItems();
    expect(appliedItems.length).to.equal(3);
    expect(appliedItems[0].name).to.equal('p');
    expect(appliedItems[1].name).to.equal('i');
    expect(appliedItems[2].name).to.equal('strong');
  });

  it('selectBox method: by box', () => {
    const content = '<p>foo<lake-box type="inline" name="inlineBox"></lake-box>bar<focus /></p>';
    const selection = new Selection(container);
    container.html(normalizeValue(content.trim()));
    const boxNode = container.find('lake-box');
    const box = getBox(boxNode);
    box.render();
    selection.selectBox(box);
    expect(selection.range.isBoxCenter).to.equal(true);
  });

  it('selectBox method: by node', () => {
    const content = '<p>foo<lake-box type="inline" name="inlineBox"></lake-box>bar<focus /></p>';
    const selection = new Selection(container);
    container.html(normalizeValue(content.trim()));
    const boxNode = container.find('lake-box');
    const box = getBox(boxNode);
    box.render();
    selection.selectBox(boxNode);
    expect(selection.range.isBoxCenter).to.equal(true);
  });

  it('method: insertBox', () => {
    const selection = new Selection(container);
    selection.range.setStart(container, 0);
    selection.insertBox('inlineBox');
    expect(selection.range.isBoxEnd).to.equal(true);
  });

});
