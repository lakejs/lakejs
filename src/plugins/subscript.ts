import type Editor from '..';

const tagName = 'sub';

export default (editor: Editor) => {
  editor.command.add('subscript', () => {
    editor.focus();
    const appliedTags = editor.selection.getTags();
    if (appliedTags.find(item => item.name === tagName)) {
      editor.selection.removeMark(`<${tagName} />`);
    } else {
      editor.selection.addMark(`<${tagName} />`);
    }
    editor.history.save();
    editor.select();
  });
};
