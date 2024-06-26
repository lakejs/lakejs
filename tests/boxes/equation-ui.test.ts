import { showBox } from '../utils';

const code = 'c = \\pm\\sqrt{a^2 + b^2}';

describe('boxes / equation-ui', () => {

  it('normal status', () => {
    showBox('equation', {
      code,
    }, box => {
      expect(box.name).to.equal('equation');
    });
  });

  it('normal status (read-only)', () => {
    showBox('equation', {
      code,
    }, box => {
      expect(box.name).to.equal('equation');
    }, true);
  });

  it('error status', () => {
    const katex = window.katex;
    window.katex = undefined;
    showBox('equation', {
      code,
    }, box => {
      expect(box.getContainer().find('.lake-equation-error').length).to.equal(1);
      window.katex = katex;
    });
  });

  it('error status (read-only): should not display', () => {
    const katex = window.katex;
    window.katex = undefined;
    showBox('equation', {
      code,
    }, box => {
      expect(box.node.computedCSS('display')).to.equal('none');
      window.katex = katex;
    }, true);
  });

});
