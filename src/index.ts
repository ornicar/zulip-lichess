import * as zulipInit from 'zulip-js';
import { Zulip, ZulipMsg, messageLoop, reply, send, react, ZulipDestPrivate, botName } from './zulip';
import { parseCommand } from './command';
import fetch from 'node-fetch';

(async () => {
  const z: Zulip = await zulipInit.default({ zuliprc: 'zuliprc' });

  const messageHandler = async (msg: ZulipMsg) => {
    console.log(`Command: ${msg.command}`);
    try {
      const command = parseCommand(msg.command, msg);
      switch (command.verb) {
        case 'hi':
          reply(z, msg, ':wave: Why hello there!');
          break;
        case 'fortune':
          await fortune(msg);
          break;
        case 'help':
          await help(msg);
          break;
      }
    } catch (err) {
      console.log(err);
      await reply(z, msg, 'Sorry, I could not parse that. Try the help command, maybe?');
    }
  };

  const fortune = async (msg: ZulipMsg) => {
    const res = await fetch('https://api.ef.gy/fortune');
    const text = await res.text();
    await reply(z, msg, text);
  };

  const help = async (msg: ZulipMsg) => {
    const name = await botName(z);
    const mention = `@${name}`;
    await reply(z, msg, ['- `' + mention + ' fortune` get a Linux kernel fortune message'].join('\n'));
  };

  await messageLoop(z, messageHandler);
})();
