import { testPlugin } from '../utils';

describe('plugin / code-block', () => {

  it('the cursor is at the beginning of the paragraph', () => {
    const content = `
    <p><focus />foo</p>
    `;
    const output = `
    <lake-box type="block" name="codeBlock" focus="right"></lake-box>
    <p>foo</p>
    `;
    testPlugin(
      content,
      output,
      editor => {
        editor.command.execute('codeBlock');
      },
    );
  });

  it('the cursor is at the end of the paragraph', () => {
    const content = `
    <p>foo<focus /></p>
    `;
    const output = `
    <p>foo</p>
    <lake-box type="block" name="codeBlock" focus="right"></lake-box>
    `;
    testPlugin(
      content,
      output,
      editor => {
        editor.command.execute('codeBlock');
      },
    );
  });

});
