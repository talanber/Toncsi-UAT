jest
  .dontMock('../bot.js');

process.env.WIT_TOKEN = 'OSPXNZRK36HNE7UV3QL2PD6IKFSBFG6I';
const bot = require('../bot.js');

describe('Bot tests', () => {

  it('Bot creation', () => {
    const client = bot.getWit(); // Just testing the creation  
    expect(client).not.toBeNull();
  });
});
