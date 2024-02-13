module.exports = getMessage => {
  return [
    {
      type: "section",
      label: getMessage("optionsTriggerLabel"),
      children: [
        {
          key: "triggerByPageLoad",
          type: "checkbox",
          label: getMessage("optionsTriggerByPageLoadLabel")
        },
        {
          key: "triggerByNewNode",
          type: "checkbox",
          label: getMessage("optionsTriggerByNewNodeLabel")
        },
        {
          key: "triggerByHover",
          type: "checkbox",
          label: getMessage("optionsTriggerByHoverLabel")
        },
        {
          key: "triggerByClick",
          type: "checkbox",
          label: getMessage("optionsTriggerByClickLabel")
        }
      ]
    },
    {
      key: "fuzzyIp",
      type: "checkbox",
      label: getMessage("optionsFuzzyIpLabel")
    },
    {
      key: "ignoreMustache",
      type: "checkbox",
      label: getMessage("optionsIgnoreMustacheLabel")
    },
    {
      key: "embedImage",
      type: "checkbox",
      label: getMessage("optionsEmbedImageLabel"),
      children: [
        {
          key: "embedImageExcludeElement",
          type: "textarea",
          label: getMessage("optionsEmbedImageExcludeElementLabel"),
          validate: validateSelector
        }
      ]
    },
    {
      key: "unicode",
      type: "checkbox",
      label: getMessage("optionsUnicodeLabel")
    },
    {
      key: "mail",
      type: "checkbox",
      label: getMessage("optionsMailLabel")
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
      validate: validateSelector
    },
    {
      key: "includeElement",
      type: "textarea",
      label: getMessage("optionsIncludeElementLabel"),
      validate: validateSelector
    },
    {
      key: "timeout",
      type: "number",
      label: getMessage("optionsTimeoutLabel"),
      help: getMessage("optionsTimeoutHelp")
    },
    {
      key: "maxRunTime",
      type: "number",
      label: getMessage("optionsMaxRunTimeLabel"),
      help: getMessage("optionsMaxRunTimeHelp")
    },
    {
      key: "customRules",
      type: "textarea",
      label: getMessage("optionsCustomRulesLabel")
    }
  ];
  
  function validateSelector(value) {
    if (value) {
      document.documentElement.matches(value);
    }
  }
};
