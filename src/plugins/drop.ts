import type { Editor } from '..';
import { query } from '../utils/query';
import { Nodes } from '../models/nodes';
import { Box } from '../models/box';
import { uploadImage } from '../ui/upload';

export default (editor: Editor) => {
  if (editor.readonly) {
    return;
  }
  let draggedNode: Nodes | null = null;
  let dropIndication: Nodes | null = null;
  let targetBlock: Nodes | null = null;
  let dropPosition: 'top' | 'bottom' = 'bottom';
  editor.container.on('dragstart', event => {
    draggedNode = null;
    const dragEvent = event as DragEvent;
    const targetNode = query(dragEvent.target as Element);
    const boxNode = targetNode.closest('lake-box');
    if (boxNode.length === 0) {
      return;
    }
    const box = new Box(boxNode);
    if (box.type === 'inline') {
      return;
    }
    const dataTransfer = dragEvent.dataTransfer;
    if (!dataTransfer) {
      return;
    }
    dataTransfer.effectAllowed = 'move';
    dataTransfer.setData('text/html', boxNode.clone(false).outerHTML());
    draggedNode = boxNode;
    dropIndication = query('<div class="lake-drop-indication" />');
    dropIndication.css({
      position: 'absolute',
      height: '2px',
      display: 'none',
    });
    editor.overlayContainer.append(dropIndication);
    dropIndication.on('dragover', e => {
      const transfer = (e as DragEvent).dataTransfer;
      if (transfer) {
        transfer.dropEffect = 'move';
      }
    });
    dropIndication.on('drop', () => {});
  });
  editor.container.on('dragover', event => {
    const dragEvent = event as DragEvent;
    const dataTransfer = dragEvent.dataTransfer;
    if (!dataTransfer) {
      return;
    }
    if (!dropIndication) {
      return;
    }
    dragEvent.preventDefault();
    const targetNode = query(dragEvent.target as Element);
    if (!targetNode.isInside) {
      return;
    }
    dataTransfer.dropEffect = 'move';
    const targetBoxNode = targetNode.closest('lake-box');
    if (targetBoxNode.length > 0) {
      if (targetBoxNode.attr('type') === 'block') {
        targetBlock = targetBoxNode;
      } else {
        targetBlock = targetBoxNode.closestBlock();
      }
    } else {
      targetBlock = targetNode.closestBlock();
    }
    const containerRect = (editor.container.get(0) as Element).getBoundingClientRect();
    let targetBlcokRect = (targetBlock.get(0) as Element).getBoundingClientRect();
    dropPosition = 'bottom';
    let left = targetBlcokRect.x - containerRect.x;
    let top = targetBlcokRect.y + targetBlcokRect.height - containerRect.y + (parseInt(targetBlock.computedCSS('margin-bottom'), 10) / 2);
    if (dragEvent.clientY < targetBlcokRect.y + (targetBlcokRect.height / 2)) {
      const prevBlock = targetBlock.prev();
      if (prevBlock.length > 0 && prevBlock.isBlock || (prevBlock.isBox && prevBlock.attr('type') === 'block')) {
        targetBlock = prevBlock;
        targetBlcokRect = (targetBlock.get(0) as Element).getBoundingClientRect();
        left = targetBlcokRect.x - containerRect.x;
        top = targetBlcokRect.y + targetBlcokRect.height - containerRect.y + (parseInt(targetBlock.computedCSS('margin-bottom'), 10) / 2);
      } else {
        dropPosition = 'top';
        top = targetBlcokRect.y - containerRect.y - (parseInt(editor.container.computedCSS('padding-top'), 10) / 2);
      }
    }
    dropIndication.css({
      top: `${top}px`,
      left: `${left}px`,
      width: `${targetBlcokRect.width}px`,
      display: 'block',
    });
  });
  editor.container.on('dragend', () => {
    dropIndication?.remove();
    dropIndication = null;
  });
  editor.container.on('drop', event => {
    dropIndication?.remove();
    dropIndication = null;
    const dragEvent = event as DragEvent;
    const dataTransfer = dragEvent.dataTransfer;
    if (!dataTransfer) {
      return;
    }
    const { requestTypes } = editor.config.image;
    const html = dataTransfer.getData('text/html');
    dataTransfer.clearData('text/html');
    if (draggedNode && targetBlock && draggedNode.get(0) !== targetBlock.get(0) && html !== '') {
      dragEvent.preventDefault();
      new Box(draggedNode).unmount();
      draggedNode.remove();
      const range = editor.selection.range;
      if (targetBlock.isBox) {
        if (dropPosition === 'top') {
          range.selectBoxStart(targetBlock);
        } else {
          range.selectBoxEnd(targetBlock);
        }
      } else {
        range.selectNodeContents(targetBlock);
        if (dropPosition === 'top') {
          range.collapseToStart();
        } else {
          range.collapseToEnd();
        }
      }
      const box = new Box(query(html));
      editor.insertBox(box.name, box.value);
      editor.history.save();
      return;
    }
    if (dataTransfer.files.length > 0) {
      dragEvent.preventDefault();
      for (const file of dragEvent.dataTransfer.files) {
        if (requestTypes.indexOf(file.type) >= 0) {
          uploadImage({
            editor,
            file,
          });
        }
      }
    }
  });
};
