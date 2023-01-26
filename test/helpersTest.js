const { assert } = require('chai');

const { findUserByEmail } = require('../helperFunctions');

const testUsers = {
  b3n4m5: {
    id: 'b3n4m5',
    email: "donkey@horse.com",
    password: 'mules-are-the-worst'
  },

  z1x2c3: {
    id: 'z1x2c3',
    email: 'porpoise@dolphin.com',
    password: 'whales-are-the-worst'
  }
};


describe('findUserByEmail', function() {
  it('should return a user with a valid email', function() {
    const user = findUserByEmail(testUsers, 'donkey@horse.com');
    const expectedUserID = testUsers['b3n4m5'];
    assert.deepEqual(user, expectedUserID);
  });
  it('should return null when passed an invalid email', function() {
    const user = findUserByEmail(testUsers, 'shark@fish.com');
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });
});



