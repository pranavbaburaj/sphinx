import {Guild, GuildMember, Message, User} from 'discord.js';
import {SphinxException} from './error';

class SphinxDuplicateMessage {
  private message: Message;
  private author: undefined | User;
  private server: Guild | null;

  /**
   * @constructor
   *
   * @param {Message} message The message class
   */
  constructor(message: Message) {
    this.message = message;
    this.server = this.message.guild;
    this.author =
      this.server == null
        ? this.message.author
        : this.server.members.cache
            .filter((value: GuildMember) => {
              return value.user.username == this.message.author.username;
            })
            .first()?.user;
  }

  /**
   * @public
   *
   * Fethc the last twenty messages from the channel
   * and filter them by the author and the content of
   * the message
   *
   * if the length of the collection is above the
   * limit, throw a warning message
   *
   * @returns {boolean} dummy return
   */
  public findDuplicateMessage = async () => {
    const messages = await this.message.channel.messages.fetch({limit: 20});
    let userMessages = Array.from(
      messages
        .filter((message: Message) => {
          if (message.author.bot) {
            return false;
          }
          return (
            message.author.username == this.message.author.username &&
            message.content.toLowerCase() == this.message.content.toLowerCase()
          );
        })
        .keys()
    );
    if (userMessages.length - 1 >= 5) {
      this.message.delete();
      const exception = new SphinxException(
        `${this.author?.tag} repeated a message 5 times. The message has been deleted`,
        this.message
      ).evokeSphinxException();
    }
    return false;
  };
}

/**
 *
 * @param message The message object
 * @returns {boolean}
 */
export const isDuplicateMessage = (message: Message): Boolean => {
  const checkDuplicateMessage = new SphinxDuplicateMessage(
    message
  ).findDuplicateMessage();
  return false;
};
