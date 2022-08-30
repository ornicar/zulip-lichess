import { sleep } from './util';

export interface Zulip {
  queues: any;
  events: any;
  users: any;
  messages: any;
  reactions: any;
}

export type UserId = number;

export interface ZulipOrigStream {
  type: 'stream';
  sender_id: UserId;
  stream_id: number;
  subject: string;
}

export interface ZulipOrigPrivate {
  type: 'private';
  sender_id: UserId;
  recipient_id: UserId;
}

export type ZulipOrig = ZulipOrigStream | ZulipOrigPrivate;

export interface ZulipMsgStream extends ZulipOrigStream {
  id: number;
  content: string;
  command: string;
}
export interface ZulipMsgPrivate extends ZulipOrigPrivate {
  id: number;
  content: string;
  command: string;
}

export type ZulipMsg = ZulipMsgStream | ZulipMsgPrivate;

export interface ZulipDestStream {
  type: 'stream';
  to: number | string;
  topic: string;
}

export interface ZulipDestPrivate {
  type: 'private';
  to: [UserId];
}

export type ZulipDest = ZulipDestStream | ZulipDestPrivate;

export const messageLoop = async (zulip: Zulip, handler: (msg: ZulipMsg) => Promise<void>) => {
  const q = await zulip.queues.register({ event_types: ['message'] });
  const me = await zulip.users.me.getProfile();
  if (!me.full_name) {
    console.log(me);
    throw 'Could not connect to zulip!';
  }
  let lastEventId = q.last_event_id;
  console.log(`Connected to zulip as @${me.full_name}, awaiting commands`);
  await send(zulip, { type: 'stream', to: 'zulip', topic: 'bots log' }, 'I started.');

  while (true) {
    const timeout = setTimeout(() => {
      console.log('events.retrieve timed out. Exiting...');
      process.exit();
    }, (q.event_queue_longpoll_timeout_seconds ?? 90) * 1_000);

    try {
      const res = await zulip.events.retrieve({
        queue_id: q.queue_id,
        last_event_id: lastEventId,
      });
      clearTimeout(timeout);

      if (res.result !== 'success') {
        console.error(`Got error response on events.retrieve: ${JSON.stringify(res)}`);
        if (res.code === 'BAD_EVENT_QUEUE_ID') return;
        await sleep(2000);
        continue;
      }

      res.events.forEach(async (event: any) => {
        lastEventId = event.id;
        if (event.type == 'heartbeat') {
          // console.log('Zulip heartbeat');
        } else if (event.message) {
          // ignore own messages
          if (event.message.sender_id != me.user_id) {
            const parts = event.message.content.trim().split(' ');
            // require explicit ping
            if (parts[0] == `@**${me.full_name}**`) {
              event.message.command = parts.slice(1).join(' ');
              await handler(event.message as ZulipMsg);
            }
          }
        } else console.log(event);
      });
    } catch (e) {
      console.error(e);
      clearTimeout(timeout);
      await sleep(2000);
      console.log('Retrying now.');
    }
  }
};

export const botName = async (zulip: Zulip): Promise<string> => {
  const me = await zulip.users.me.getProfile();
  return me.full_name;
};

const origToDest = (orig: ZulipOrig): ZulipDest => {
  return orig.type == 'stream'
    ? {
        type: 'stream',
        to: orig.stream_id,
        topic: orig.subject,
      }
    : {
        type: 'private',
        to: [orig.sender_id],
      };
};

export const send = async (zulip: Zulip, dest: ZulipDest, text: string) => {
  await zulip.messages.send({
    ...dest,
    content: text,
  });
};

export const reply = async (zulip: Zulip, to: ZulipMsg, text: string) => await send(zulip, origToDest(to), text);

export const react = async (zulip: Zulip, to: ZulipMsg, emoji: string) =>
  await zulip.reactions.add({
    message_id: to.id,
    emoji_name: emoji,
  });
