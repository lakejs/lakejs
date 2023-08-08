import { expect } from 'chai';
import { forEach } from '../../src/utils';

describe('forEach of utils', () => {
  it('plain object', () => {
    const oldObject = {
      one: 1,
      two: 2,
      three: 3,
    };
    const newObject: any = {};
    forEach(oldObject, (key, value) => {
      newObject[key] = value;
    });
    expect(oldObject).to.deep.equal(newObject);
  });
});
