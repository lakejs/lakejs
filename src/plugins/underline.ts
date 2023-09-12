import type LakeCore from '../main';

const tagName = 'u';

export default (editor: LakeCore) => {
  editor.commands.add('underline', () => {
    editor.focus();
    const appliedTags = editor.selection.getTags();
    if (appliedTags.find(item => item.name === tagName)) {
      editor.selection.removeMark(`<${tagName} />`);
    } else {
      editor.selection.addMark(`<${tagName} />`);
    }
    editor.select();
  });
  editor.keystroke.setKeydown('$mod+KeyU', event => {
    event.preventDefault();
    editor.commands.execute('underline');
  });
};
