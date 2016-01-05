import chai from 'chai';
import Library from '../build/interframe.js';

chai.expect();

const expect = chai.expect;

var messenger;

describe('Interframe', function () {
  before(function () {
    messenger = new Interframe();
  });

  it('should return the name', () => {
    expect(messenger).to.be.defined();
  });
});