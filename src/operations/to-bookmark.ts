import { Nodes } from '../models/nodes';
import { Range } from '../models/range';

export function toBookmark(range: Range, bookmark: { anchor: Nodes, focus: Nodes }): void {
  const anchor = bookmark.anchor;
  const focus = bookmark.focus;
  // Only the anchor is removed because the focus doesn't exist, which is not correct case.
  if (anchor.length > 0 && focus.length === 0) {
    anchor.remove();
    return;
  }
  if (focus.length > 0 && anchor.length === 0) {
    range.setStartAfter(focus);
    range.collapseToStart();
    focus.remove();
    return;
  }
  if (anchor.length > 0 && focus.length > 0) {
    const anchorRange = new Range();
    anchorRange.selectNode(anchor);
    // The anchor node is after the focus node.
    if (anchorRange.compareAfterPoint(focus) === -1) {
      range.setStartAfter(focus);
      focus.remove();
      range.setEndAfter(anchor);
      anchor.remove();
    } else {
      range.setStartAfter(anchor);
      anchor.remove();
      range.setEndAfter(focus);
      focus.remove();
    }
  }
}
