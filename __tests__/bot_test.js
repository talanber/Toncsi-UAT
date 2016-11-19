jest
  .dontMock('../bot.js');

process.env.WIT_TOKEN = 'VFD7X3EUFNWFFP7XAMRB2YJLQTHCDAUI';
const bot = require('../bot.js');

describe('Bot tests', () => {

  it('Bot creation', () => {
    const client = bot.getWit(); // Just testing the creation  
    expect(client).not.toBeNull();
  });
});
