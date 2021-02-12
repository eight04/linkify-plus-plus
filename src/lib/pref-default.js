module.exports = function() {
  return {
    fuzzyIp: true,
    embedImage: true,
    embedImageExcludeElement: ".hljs, .highlight, .brush\\:",
    ignoreMustache: false,
    unicode: false,
    mail: true,
    newTab: false,
    standalone: false,
    boundaryLeft: "{[(\"'",
    boundaryRight: "'\")]},.;?!",
    excludeElement: ".highlight, .editbox, .brush\\:, .bdsug, .spreadsheetinfo",
    includeElement: "",
    timeout: 10000,
    maxRunTime: 100,
    customRules: "",
  };
};
