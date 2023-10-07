import { testOperation } from '../utils';
import { splitMarks } from '../../src/operations/split-marks';

describe('operations.splitMarks()', () => {

  it('collapsed range: splits a text and a mark', () => {
    const content = `
    <p><strong>one<focus />two</strong></p>
    `;
    const output = `
    <p><strong>one</strong><focus /><strong>two</strong></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

  it('expanded range: splits a text and a mark', () => {
    const content = `
    <p><strong>one<anchor />two<focus />three</strong></p>
    `;
    const output = `
    <p><strong>one</strong><anchor /><strong>two</strong><focus /><strong>three</strong></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

  it('collapsed range: splits a mark at the beginning of the text', () => {
    const content = `
    <p><strong><focus />foo</strong></p>
    `;
    const output = `
    <p><focus /><strong>foo</strong></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

  it('expanded range: splits a mark at the beginning of the text', () => {
    const content = `
    <p><strong><anchor />foo<focus />bar</strong></p>
    `;
    const output = `
    <p><anchor /><strong>foo</strong><focus /><strong>bar</strong></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

  it('collapsed range: splits a mark at the end of the text', () => {
    const content = `
    <p><strong>foo<focus /></strong></p>
    `;
    const output = `
    <p><strong>foo</strong><focus /></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

  it('expanded range: splits a mark at the end of the text', () => {
    const content = `
    <p><strong>foo<anchor />bar<focus /></strong></p>
    `;
    const output = `
    <p><strong>foo</strong><anchor /><strong>bar</strong><focus /></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

  it('collapsed range: splits a mark among the marks', () => {
    const content = `
    <p><strong>beginning<em>one</em><focus /><em>two</em>end</strong></p>
    `;
    const output = `
    <p><strong>beginning<em>one</em></strong><focus /><strong><em>two</em>end</strong></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

  it('collapsed range: splits a mark without parent mark', () => {
    const content = `
    <p><em>one</em>two<em>th<focus />ree</em>four<em>five</em></p>
    `;
    const output = `
    <p><em>one</em>two<em>th</em><focus /><em>ree</em>four<em>five</em></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

  it('collapsed range: splits nested masks and a text', () => {
    const content = `
    <p><strong>beginning<em>one<focus />two</em>end</strong></p>
    `;
    const output = `
    <p><strong>beginning<em>one</em></strong><focus /><strong><em>two</em>end</strong></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

  it('collapsed range: splits nested masks without splitting text', () => {
    const content = `
    <p><strong>beginning<em><focus />foo</em>end</strong></p>
    `;
    const output = `
    <p><strong>beginning</strong><focus /><strong><em>foo</em>end</strong></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

  it('collapsed range: splits three levels of nested masks', () => {
    const content = `
    <p><strong>beginning<em>one<span><focus />two</span></em>end</strong></p>
    `;
    const output = `
    <p><strong>beginning<em>one</em></strong><focus /><strong><em><span>two</span></em>end</strong></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

  it('expanded range: splits three levels of nested masks', () => {
    const content = `
    <p><strong>beginning<em>one<span><anchor />two<focus /></span></em>end</strong></p>
    `;
    const output = `
    <p><strong>beginning<em>one</em></strong><anchor /><strong><em><span>two</span></em></strong><focus /><strong>end</strong></p>
    `;
    testOperation(
      content,
      output,
      range => {
        splitMarks(range);
      },
    );
  });

});
