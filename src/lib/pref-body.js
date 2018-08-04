module.exports = getMessage => {
  return [
    {
      key: "fuzzyIp",
      type: "checkbox",
      label: getMessage("optionsFuzzyIpLabel")
    },
    {
      key: "ignoreMustache",
      type: "checkbox",
      label: getMessage("optionsIgnoreMustache")
    },
    {
      key: "embedImage",
      type: "checkbox",
      label: getMessage("optionsEmbedImageLabel"),
      children: [
        {
          key: "embedImageExcludeElement",
          type: "textarea",
          label: getMessage("optionsEmbedImageLabel"),
          parse: validateSelector
        }
      ]
    },
    {
      key: "unicode",
      type: "checkbox",
      label: getMessage("optionsUnicodeLabel")
    },
    {
      key: "newTab",
      type: "checkbox",
      label: getMessage("optionsNewTabLabel")
    },
    {
      key: "standalone",
      type: "checkbox",
      label: getMessage("optionsStandaloneLabel"),
      children: [
        {
          key: "boundaryLeft",
          type: "text",
          label: getMessage("optionsBoundaryLeftLabel")
        },
        {
          key: "boundaryRight",
          type: "text",
          label: getMessage("optionsBoundaryRightLabel")
        }
      ]
    },
    {
      key: "excludeElement",
      type: "textarea",
      label: getMessage("optionsExcludeElementLabel"),
      parse: validateSelector
    },
    {
      key: "includeElement",
      type: "textarea",
      label: getMessage("optionsIncludeElementLabel"),
      parse: validateSelector
    },
    {
      key: "timeout",
      type: "number",
      label: getMessage("optionsTimeoutLabel")
    },
    {
      key: "maxRunTime",
      type: "number",
      label: getMessage("optionsMaxRunTimeLabel")
    },
    {
      key: "customRules",
      type: "textarea",
      label: getMessage("optionsCustomRulesLabel"),
      parse: value => {
        value = value.trim();
        if (!value) {
          return [];
        }
        return value.split(/\s*\n\s*/g);
      },
      format: value => value.join("\n")
    }
  ];
  
  function validateSelector(value) {
    document.documentElement.matches(value);
    return value;
  }
};
