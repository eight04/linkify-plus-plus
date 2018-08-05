function createView({root, pref, body, translate = {}}) {
  translate = Object.assign({
    inputNewScopeName: "Add new scope",
    learnMore: "Learn more"
  }, translate);
  const nav = createNav();
  const form = createForm(body);
  
  root.append(...nav.frag, ...form.frag);
  
  pref.on("scopeChange", nav.updateScope);
  nav.updateScope(pref.getCurrentScope());
  
  pref.on("scopeListChange", nav.updateScopeList);
  nav.updateScopeList(pref.getScopeList());
  
  pref.on("change", form.updateInputs);
  form.updateInputs(pref.getAll());
  
  return destroy;
  
  function destroy() {
    root.innerHTML = "";
    pref.off("scopeChange", nav.updateScope);
    pref.off("scopeListChange", nav.updateScopeList);
    pref.off("change", form.updateInputs);
  }
  
  function createForm(body) {
    const _body = createBody({body});
    return Object.assign(_body, {updateInputs});
    
    function updateInputs(changes) {
      for (const [key, value] of Object.entries(changes)) {
        _body.inputs[key].setValue(value);
      }
    }
  }
  
  function createNav() {
    const select = document.createElement("select");
    
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "x";
    deleteButton.onclick = () => {
      pref.deleteScope(pref.getCurrentScope())
        .catch(err => {
          alert(err.message);
        });
    };
    
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "+";
    addButton.onclick = () => {
      addNewScope().catch(err => {
        alert(err.message);
      });
        
      function addNewScope() {
        const scopeName = prompt(translate.inputNewScopeName).trim();
        if (!scopeName) {
          return Promise.reject(new Error("the value is empty"));
        }
        return pref.addScope(scopeName)
          .then(() => pref.setCurrentScope(scopeName));
      }
    };
    
    return {
      updateScope,
      updateScopeList,
      frag: [
        select,
        deleteButton,
        addButton
      ]
    };
    
    function updateScope(newScope) {
      select.value = newScope;
    }
    
    function updateScopeList(scopeList) {
      select.innerHTML = "";
      select.append(...scopeList.map(scope => {
        const option = document.createElement("option");
        option.value = scope;
        option.textContent = scope;
        return option;
      }));
    }
  }
  
  function createBody({body, hLevel = 3}) {
    const inputs = {};
    const frag = [];
    for (const el of body) {
      const container = document.createElement("div");
      container.className = `webext-pref-${el.type}`;
      Object.assign(
        el,
        el.type === "section" ? createSection({el, hLevel}) :
          el.type === "checkbox" ? createCheckbox(el) :
          el.type === "radiogroup" ? createRadioGroup(el) :
          createInput(el)
      );
      if (el.key) {
        inputs[el.key] = el;
      }
      if (el.inputs) {
        Object.assign(inputs, el.inputs);
      }
      container.append(...el.frag);
      frag.push(container);
    }
    return {
      inputs,
      frag
    };
  }
  
  function createSection({el, hLevel}) {
    const header = document.createElement(`h${hLevel}`);
    header.className = "webext-pref-header";
    header.textContent = el.label;
    body = createBody({
      body: el.children,
      hLevel: hLevel + 1
    });
    
    return {
      inputs: body.inputs,
      frag: [
        header,
        el.help && createHelp(el.help),
        ...body.frag
      ]
    };
  }
  
  function createCheckbox(el) {
    const input = document.createElement("input");
    const inputs = {};
    input.id = `pref-${el.key}`;
    input.type = el.type;
    if (el.type === "checkbox") {
      input.onchange = () => {
        let value = input.checked;
        if (el.parse) {
          value = el.parse(value);
        }
        pref.set(el.key, value);
      };
    } else {
      input.onchange = () => {
        let value = el.value;
        if (el.parentParse) {
          value = el.parentParse(value);
        }
        pref.set(el.parentKey, value);
      };
    }
    
    const box = document.createElement("div");
    box.className = "webext-pref-checkbox-box";
    
    box.append(createLabel(el.label, input.id));
    if (el.learnMore) {
      box.append(createLearnMore(el.learnMore));
    }
    if (el.help) {
      box.append(createHelp(el.help));
    }
    if (el.children && el.children.length) {
      box.append(createChildContainer(el.children));
    }
    
    return {
      // input,
      inputs,
      frag: [
        input,
        box
      ],
      setValue: value => {
        if (el.format) {
          value = el.format(value);
        }
        input.checked = value;
      }
    };
    
    function createChildContainer(children) {
      const container = document.createElement("fieldset");
      container.className = "webext-pref-checkbox-children";
      const body = createBody({body: children});
      container.append(...body.frag);
      Object.assign(inputs, body.inputs);
      return container;
    }
  }
  
  function createRadioGroup(el) {
    const frag = [];
    const inputs = {};
    
    const radios = el.children.map(option => {
      const container = document.createElement("div");
      container.className = "webext-pref-checkbox";
      
      const checkbox = createCheckbox(Object.assign({}, option, {
        key: `${el.key}-${option.value}`,
        parentKey: el.key,
        parentParse: el.parse
      }));
      
      Object.assign(inputs, checkbox.inputs);
      
      container.append(...checkbox.frag);
      return Object.assign(checkbox, {frag: container, key: option.value});
    });
    
    const radioMap = {};
    for (const radio of radios) {
      radioMap[radio.key] = radio;
    }
    
    if (el.label) {
      frag.push(createTitle(el.label));
    }
    if (el.learnMore) {
      frag.push(createLearnMore(el.learnMore));
    }
    if (el.help) {
      frag.push(createHelp(el.help));
    }
    frag.push(...radios.map(r => r.frag));
    
    return {
      inputs,
      frag,
      setValue: value => {
        if (el.format) {
          value = el.format(value);
        }
        radioMap[value].setValue(true);
      }
    };
    
    function createTitle(text) {
      const title = document.createElement("span");
      title.className = "webext-pref-radio-title";
      title.textContent = text;
      return title;
    }
  }
  
  function createInput(el) {
    const frag = [];
    let input;
    if (el.type === "select") {
      input = document.createElement("select");
      input.className = "browser-style";
      input.multiple = el.multiple;
      input.append(...Object.entries(input.options).map(([key, value]) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = value;
      }));
    } else if (el.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = "8";
      input.className = "browser-style";
    } else {
      input = document.createElement("input");
      input.type = el.type;
    }
    input.id = `pref-${el.key}`;
    input.onchange = () => {
      let value = input.value;
      if (el.parse) {
        value = el.parse(value);
      }
      pref.set(el.key, value);
    };
    
    frag.push(createLabel(el.label, input.id));
    if (el.learnMore) {
      frag.push(createLearnMore(el.learnMore));
    }
    frag.push(input);
    if (el.help) {
      frag.push(createHelp(el.help));
    }
    
    return {
      frag,
      setValue: value => {
        if (el.format) {
          value = el.format(value);
        }
        input.value = value;
      }
    };
  }
  
  function createHelp(text) {
    const help = document.createElement("div");
    help.className = "webext-pref-help";
    help.textContent = text;
    return help;
  }
  
  function createLabel(text, id) {
    const label = document.createElement("label");
    label.textContent = text;
    label.for = id;
    return label;
  }
  
  function createLearnMore(url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = translate.learnMore;
    return a;
  }
}

var prefBody = getMessage => {
  return [
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

/* global pref prefReady browser */

prefReady.then(() => {
  createView({
    pref,
    body: prefBody(browser.i18n.getMessage),
    root: document.querySelector(".pref-root")
  });
});
