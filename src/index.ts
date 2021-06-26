import * as zulipInit from 'zulip-js';
import { Zulip, ZulipMsg, messageLoop, reply, react, botName } from './zulip';
import { parseCommand, Play } from './command';
import { RedisParrot } from './parrot';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

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
        case 'play':
          await play(msg, command);
          break;
        case 'help':
          await help(msg);
          break;
      }
    } catch (err) {
      console.log(err);
      await react(z, msg, 'cross_mark');
    }
  };

  const play = async (msg: ZulipMsg, cmd: Play) => {
    const params = new URLSearchParams();
    params.append('clock.limit', '' + cmd.min * 60);
    params.append('clock.increment', '' + cmd.inc);
    if (cmd.rated) params.append('rated', 'true');
    const res = await fetch('https://lichess.org/api/challenge/open', {
      method: 'post',
      body: params,
    });
    const c = (await res.json()).challenge;
    await reply(
      z,
      msg,
      `Let's play ${c.timeControl.show} ${c.rated ? 'rated' : 'casual'} ${c.url} <- Anyone can join!`
    );
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
        '- `' + mention + ' add key message` Save a message with a key',
        '- `' + mention + ' key` Repeat the message associated with this key',
        '- `' + mention + ' del key` Delete the message associated with this key',
        '- `' + mention + ' play 3+2` Create a casual 3+2 open challenge for anyone to join',
        '- `' + mention + ' play 5+0 rated` Create a rated 5+0 open challenge for anyone to join',
        '- `' + mention + ' fortune` Get a Linux kernel fortune message',
      ].join('\n')
    );
  };

  await messageLoop(z, messageHandler);
})();
