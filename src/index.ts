import * as zulipInit from 'zulip-js';
import { Zulip, ZulipMsg, messageLoop, reply, send, react, ZulipDestPrivate, botName } from './zulip';
import { parseCommand } from './command';
import { RedisParrot } from './parrot';
import fetch from 'node-fetch';

(async () => {
  const z: Zulip = await zulipInit.default({ zuliprc: 'zuliprc' });
  const parrot = new RedisParrot();

  const messageHandler = async (msg: ZulipMsg) => {
    console.log(`Command: ${msg.command}`);
    try {
      const command = parseCommand(msg.command, msg);
      switch (command.verb) {
        case 'parrotAdd':
          parrot.add(command.key, command.value);
          react(z, msg, 'check_mark');
          break;
        case 'parrotGet':
          const value = await parrot.get(command.key);
          if (value) reply(z, msg, value);
          else react(z, msg, 'cross_mark');
          break;
        case 'parrotDel':
          const done = await parrot.del(command.key);
          react(z, msg, done ? 'check_mark' : 'cross_mark');
          break;
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
    await reply(
      z,
      msg,
      [
        '- `' + mention + ' add key message` Save a message with a key.',
        '- `' + mention + ' key` Repeat the message associated with this key.',
        '- `' + mention + ' del key` Delete the message associated with this key.',
        '- `' + mention + ' fortune` get a Linux kernel fortune message',
      ].join('\n')
    );
  };

  await messageLoop(z, messageHandler);
})();
