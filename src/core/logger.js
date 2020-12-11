const discord = require("discord.js");
const auth = require("./auth");
const colors = require("./colors").get;
const spacer = "​                                                          ​";

const hook = new discord.WebhookClient(
   auth.loggerWebhookID, auth.loggerWebhookToken
);

module.exports = function(type, data, subtype = null)
{
   const logTypes = {
      dev: devConsole,
      error: errorLog,
      warn: warnLog,
      custom: hookSend,
      guildJoin: logJoin,
      guildLeave: logLeave
   };

   if (logTypes.hasOwnProperty(type))
   {
      return logTypes[type](data, subtype);
   }
};

// -------------------
// Log data to console
// -------------------

const devConsole = function(data)
{
   if (auth.dev)
   {
      return console.log(data);
   }
};

// -----------
// Hook Sender
// -----------

const hookSend = function(data)
{
   const embed = new discord.RichEmbed({
      title: data.title,
      color: colors(data.color),
      description: data.msg,
      footer: {
         text: data.footer
      }
   });
   hook.send(embed).catch(err =>
   {
      console.error("hook.send error:\n" + err);
   });
};

// ------------
// Error Logger
// ------------

// eslint-disable-next-line complexity
function convertObjToString(obj)
{
   //create an array that will later be joined into a string.
   var string = [];

   //is object
   //    Both arrays and objects seem to return "object"
   //    when typeof(obj) is applied to them. So instead
   //    I am checking to see if they have the property
   //    join, which normal objects don't have but
   //    arrays do.
   if (obj === undefined)
   {
      return String(obj);
   }
   else if (typeof obj === "object" && obj.join === undefined)
   {
      for (const prop in obj)
      {
         if (obj.hasOwnProperty(prop))
         {string.push(prop + ": " + convertObjToString(obj[prop]));}
      }
      return "{" + string.join(",") + "}";

   //is array
   }
   else if (typeof obj === "object" && !(obj.join === undefined))
   {
      for (const prop in obj)
      {
         string.push(convertObjToString(obj[prop]));
      }
      return "[" + string.join(",") + "]";

   //is function
   }
   else if (typeof obj === "function")
   {
      string.push(obj.toString());

   //all other values can be done with JSON.stringify
   }
   else
   {
      string.push(JSON.stringify(obj));
   }

   return string.join(",");
}

const errorLog = function(error, subtype)
{
   let errorTitle = null;

   const errorTypes = {
      dm: ":skull_crossbones:  Discord - user.createDM",
      fetch: ":no_pedestrians:  Discord - client.fetchUser",
      send: ":postbox:  Discord - send",
      edit: ":crayon:  Discord - message.edit",
      react: ":anger:  Discord - message.react",
      typing: ":keyboard:  Discord - channel.startTyping",
      presence: ":loudspeaker:  Discord - client.setPresence",
      db: ":outbox_tray:  Database Error",
      uncaught: ":japanese_goblin:  Uncaught Exception",
      unhandled: ":japanese_ogre:  Unhandled promise rejection",
      warning: ":exclamation:  Proccess Warning",
      api: ":boom:  External API Error",
      shardFetch: ":pager:  Discord - shard.fetchClientValues"
   };

   if (errorTypes.hasOwnProperty(subtype))
   {
      errorTitle = errorTypes[subtype];
   }

   hookSend({
      title: errorTitle,
      color: "err",
      msg: "```json\n" + convertObjToString(error) + "\n```"
   });
};

// ---------------
// Warnings Logger
// ---------------

const warnLog = function(warning)
{
   hookSend({
      color: "warn",
      msg: warning
   });
};

// ---------------
// Guild Join Log
// --------------

const logJoin = function(guild)
{
   hookSend({
      color: "ok",
      title: "Joined Guild",
      msg:
         `:white_check_mark:  **${guild.name}**\n` +
         "```md\n> " + guild.id + "\n@" + guild.owner.user.username + "#" +
         guild.owner.user.discriminator + "\n```" + spacer + spacer
   });
};

// ----------------
// Guild Leave Log
// ----------------

const logLeave = function(guild)
{
   hookSend({
      color: "warn",
      title: "Left Guild",
      msg:
         `:regional_indicator_x:  **${guild.name}**\n` +
         "```md\n> " + guild.id + "\n@" + guild.owner.user.username + "#" +
         guild.owner.user.discriminator + "\n```" + spacer + spacer
   });
};
