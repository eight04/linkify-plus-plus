module.exports = {
  transforms: [
    {
      name: "cleanMessage",
      transform: (context, content) => {
        const message = JSON.parse(content);
        const newMessage = {};
        for (const [key, value] of Object.entries(message)) {
          if (value.placeholders) {
            value.message = value.message.replace(/\$\w+\$/g, m => {
              const name = m.slice(1, -1).toLowerCase();
              return value.placeholders[name].content;
            });
          }
          if (/^options/.test(key)) {
            newMessage[key] = value.message;
          } else if (/^pref/.test(key)) {
            newMessage[key[4].toLowerCase() + key.slice(5)] = value.message;
          }
        }
        return JSON.stringify(newMessage, null, 2);
      }
    }
  ]
};
