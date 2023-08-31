import { expect } from 'chai';
import { query } from '../../src/utils';
import { Nodes, Range } from '../../src/models';

describe('models.Range class', () => {

  let container: Nodes;

  beforeEach(() => {
    container = query('<div contenteditable="true"></div>').appendTo(document.body);
  });

  afterEach(() => {
    container.remove();
  });

  it('property: startNode', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const node = container.find('strong').first();
    range.setStart(node, 1);
    expect(range.startNode.get(0)).to.equal(node.get(0));
  });

  it('property: startOffset', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const node = container.find('strong').first();
    range.setStart(node, 1);
    expect(range.startOffset).to.equal(1);
  });

  it('property: endNode', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const node = container.find('strong').first();
    range.setEnd(node, 1);
    expect(range.endNode.get(0)).to.equal(node.get(0));
  });

  it('property: endOffset', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const node = container.find('strong').first();
    range.setEnd(node, 1);
    expect(range.endOffset).to.equal(1);
  });

  it('property: commonAncestor', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    range.selectNode(container.find('strong'));
    expect(range.commonAncestor.html()).to.equal('<strong>foo</strong>bar');
  });

  it('property: isCollapsed', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    range.selectNode(container.find('strong'));
    expect(range.isCollapsed).to.equal(false);
    range.collapseToEnd();
    expect(range.isCollapsed).to.equal(true);
  });

  it('method: get', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    expect(range.get().startContainer).to.equal(document);
  });

  it('method: comparePoint', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    range.selectNode(container.find('strong'));
    expect(range.comparePoint(container.find('strong'), 0)).to.equal(0);
    expect(range.comparePoint(container.find('strong').next(), 1)).to.equal(1);
    range.selectNode(container.find('strong').next());
    expect(range.comparePoint(container.find('strong'), 1)).to.equal(-1);
    expect(range.comparePoint(container, 0)).to.equal(-1);
    expect(range.comparePoint(container, 1)).to.equal(0);
    expect(range.comparePoint(container, 2)).to.equal(0);
    const fooTextNode = new Nodes(document.createTextNode('foo'));
    const barTextNode = new Nodes(document.createTextNode('bar'));
    container.empty();
    container.append(fooTextNode);
    container.append(barTextNode);
    range.setStartAfter(fooTextNode);
    range.collapseToStart();
    expect(range.comparePoint(fooTextNode, 3)).to.equal(-1);
  });

  it('method: compareBeforeNode', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    range.selectNode(container.find('strong'));
    range.collapseToEnd();
    expect(range.compareBeforeNode(container.find('strong'))).to.equal(-1);
    expect(range.compareBeforeNode(container.find('strong').next())).to.equal(1);
    range.selectNodeContents(container.find('strong'));
    expect(range.compareBeforeNode(container.find('strong'))).to.equal(-1);
    expect(range.compareBeforeNode(container.find('strong').first())).to.equal(0);
    expect(range.compareBeforeNode(container.find('strong').next())).to.equal(1);
  });

  it('method: compareAfterNode', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    range.selectNode(container.find('strong'));
    range.collapseToEnd();
    expect(range.compareAfterNode(container.find('strong'))).to.equal(0);
    expect(range.compareAfterNode(container.find('strong').next())).to.equal(1);
    range.selectNodeContents(container.find('strong'));
    expect(range.compareAfterNode(container.find('strong'))).to.equal(1);
    expect(range.compareAfterNode(container.find('strong').first())).to.equal(0);
    expect(range.compareAfterNode(container.find('strong').next())).to.equal(1);
    range.selectNode(container.find('strong').next());
    range.collapseToEnd();
    expect(range.compareAfterNode(container.find('strong'))).to.equal(-1);
    const fooTextNode = new Nodes(document.createTextNode('foo'));
    const barTextNode = new Nodes(document.createTextNode('bar'));
    container.empty();
    container.append(fooTextNode);
    container.append(barTextNode);
    range.setStartAfter(fooTextNode);
    range.collapseToStart();
    expect(range.compareAfterNode(fooTextNode)).to.equal(-1);
  });

  it('method: intersectsNode', () => {
    container.html('<p>outer start</p><p>foo<strong>bold</strong></p><h1>heading</h1><p><em>itelic</em>bar</p><p>outer end</p>');
    const range = new Range();
    range.setStart(container.find('strong').prev(), 1);
    range.setEnd(container.find('em').next(), 2);
    expect(range.intersectsNode(container.find('strong'))).to.equal(true);
    expect(range.intersectsNode(container.find('strong').first())).to.equal(true);
    expect(range.intersectsNode(container.find('strong').prev())).to.equal(true);
    expect(range.intersectsNode(container.find('em').next())).to.equal(true);
    expect(range.intersectsNode(container.find('p').eq(0))).to.equal(false);
    expect(range.intersectsNode(container.find('p').eq(0).first())).to.equal(false);
  });

  it('method: clone', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    range.selectNode(container.find('strong'));
    const newRange = range.clone();
    expect(range.startNode.name).to.equal(newRange.startNode.name);
    expect(range.startOffset).to.equal(newRange.startOffset);
    expect(range.endNode.name).to.equal(newRange.endNode.name);
    expect(range.endOffset).to.equal(newRange.endOffset);
    expect(range.commonAncestor.name).to.equal(newRange.commonAncestor.name);
    expect(range.isCollapsed).to.equal(newRange.isCollapsed);
  });

  it('method: setStart', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const node = container.find('strong').first();
    range.setStart(node, 1);
    expect(range.startNode.get(0)).to.equal(node.get(0));
    expect(range.startOffset).to.equal(1);
  });

  it('method: setStartBefore', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const node = container.find('strong');
    range.setStartBefore(node);
    expect(range.startNode.get(0)).to.equal(node.parent().get(0));
    expect(range.startOffset).to.equal(0);
  });

  it('method: setStartAfter', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const node = container.find('strong');
    range.setStartAfter(node);
    expect(range.startNode.get(0)).to.equal(node.parent().get(0));
    expect(range.startOffset).to.equal(1);
  });

  it('method: setEnd', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const nodes = container.find('strong').first();
    range.setEnd(nodes, 1);
    expect(range.endNode.get(0)).to.equal(nodes.get(0));
    expect(range.endOffset).to.equal(1);
  });

  it('method: setEndBefore', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const node = container.find('strong');
    range.setEndBefore(node);
    expect(range.endNode.get(0)).to.equal(node.parent().get(0));
    expect(range.endOffset).to.equal(0);
  });

  it('method: setEndAfter', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const node = container.find('strong');
    range.setEndAfter(node);
    expect(range.endNode.get(0)).to.equal(node.parent().get(0));
    expect(range.endOffset).to.equal(1);
  });

  it('method: collapseToStart', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const nodes = container.find('strong').first();
    range.setStart(nodes, 1);
    range.setEnd(nodes, 2);
    expect(range.isCollapsed).to.equal(false);
    range.collapseToStart();
    expect(range.isCollapsed).to.equal(true);
    expect(range.endNode.get(0)).to.equal(nodes.get(0));
    expect(range.endOffset).to.equal(1);
  });

  it('method: collapseToEnd', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const nodes = container.find('strong').first();
    range.setStart(nodes, 1);
    range.setEnd(nodes, 2);
    expect(range.isCollapsed).to.equal(false);
    range.collapseToEnd();
    expect(range.isCollapsed).to.equal(true);
    expect(range.endNode.get(0)).to.equal(nodes.get(0));
    expect(range.endOffset).to.equal(2);
  });

  it('method: selectNode', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    range.selectNode(container.find('strong'));
    expect(range.startNode.name).to.equal('div');
    expect(range.endNode.name).to.equal('div');
    expect(range.startOffset).to.equal(0);
    expect(range.endOffset).to.equal(1);
    expect(range.isCollapsed).to.equal(false);
  });

  it('method: selectNodeContents', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    range.selectNodeContents(container.find('strong'));
    expect(range.startNode.name).to.equal('strong');
    expect(range.endNode.name).to.equal('strong');
    expect(range.startOffset).to.equal(0);
    expect(range.endOffset).to.equal(1);
    expect(range.isCollapsed).to.equal(false);
  });

  it('reduce method: is not collapsed', () => {
    container.html('<div><p><strong>foo</strong></p></div>');
    const range = new Range();
    range.selectNode(container.find('p'));
    expect(range.startNode.name).to.equal('div');
    expect(range.endNode.name).to.equal('div');
    expect(range.startOffset).to.equal(0);
    expect(range.endOffset).to.equal(1);
    expect(range.isCollapsed).to.equal(false);
    range.reduce();
    expect(range.startNode.name).to.equal('strong');
    expect(range.endNode.name).to.equal('strong');
    expect(range.startOffset).to.equal(0);
    expect(range.endOffset).to.equal(1);
    expect(range.isCollapsed).to.equal(false);
  });

  it('reduce method: is collapsed', () => {
    container.html('<div><p><strong>foo</strong></p></div>');
    const range = new Range();
    range.selectNode(container.find('p'));
    range.collapseToStart();
    expect(range.startNode.name).to.equal('div');
    expect(range.endNode.name).to.equal('div');
    expect(range.startOffset).to.equal(0);
    expect(range.endOffset).to.equal(0);
    expect(range.isCollapsed).to.equal(true);
    range.reduce();
    expect(range.startNode.name).to.equal('strong');
    expect(range.endNode.name).to.equal('strong');
    expect(range.startOffset).to.equal(0);
    expect(range.endOffset).to.equal(0);
    expect(range.isCollapsed).to.equal(true);
  });

  it('reduce method: empty tag', () => {
    container.html('<div><p><em><strong></strong></em></p></div>');
    const range = new Range();
    range.selectNode(container.find('p'));
    range.collapseToStart();
    expect(range.startNode.name).to.equal('div');
    expect(range.endNode.name).to.equal('div');
    expect(range.startOffset).to.equal(0);
    expect(range.endOffset).to.equal(0);
    expect(range.isCollapsed).to.equal(true);
    range.reduce();
    expect(range.startNode.name).to.equal('strong');
    expect(range.endNode.name).to.equal('strong');
    expect(range.startOffset).to.equal(0);
    expect(range.endOffset).to.equal(0);
    expect(range.isCollapsed).to.equal(true);
  });

  it('insertNode method: insert an container', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const strong = container.find('strong');
    const textNode = strong.first();
    range.setStart(textNode, 1);
    range.setEnd(textNode, 2);
    const em = query('<em>insert node</em>');
    range.insertNode(em);
    expect(range.startNode.get(0)).to.equal(strong.get(0));
    expect(range.endNode.get(0)).to.equal(strong.get(0));
    expect(range.startOffset).to.equal(2);
    expect(range.endOffset).to.equal(2);
    expect(range.isCollapsed).to.equal(true);
    expect(strong.html()).to.equal('f<em>insert node</em>oo');
  });

  it('insertNode method: insert multi-container', () => {
    container.html('<strong>foo</strong>bar');
    const range = new Range();
    const strong = container.find('strong');
    const textNode = strong.first();
    range.setStart(textNode, 1);
    range.setEnd(textNode, 2);
    const nodes = query('<em>insert node</em><span>insert node</span>');
    range.insertNode(nodes);
    expect(range.startNode.get(0)).to.equal(strong.get(0));
    expect(range.endNode.get(0)).to.equal(strong.get(0));
    expect(range.startOffset).to.equal(3);
    expect(range.endOffset).to.equal(3);
    expect(range.isCollapsed).to.equal(true);
    expect(strong.html()).to.equal('f<em>insert node</em><span>insert node</span>oo');
  });

});
