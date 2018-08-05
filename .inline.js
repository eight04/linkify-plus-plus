module.exports = {
  transforms: [
    {
      name: "cleanMessage",
      transform: (context, content) => {
        const message = JSON.parse(content);
        const newMessage = {};
        for (const [key, value] of Object.entries(message)) {
          if (/^options/.test(key)) {
            newMessage[key] = value.message;
          }
        }
        return JSON.stringify(newMessage, null, 2);
      }
    }
  ]
};
