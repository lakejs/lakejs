import type { Editor } from '..';

export default (editor: Editor) => {
  if (editor.readonly) {
    return;
  }
  editor.command.add('specialCharacter', {
    execute: (value: string) => {
      editor.selection.insertContents(document.createTextNode(value));
      editor.history.save();
    },
  });
};
