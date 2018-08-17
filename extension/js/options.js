function createView({root, pref, body, translate = {}, getNewScope = () => ""}) {
  translate = Object.assign({
    inputNewScopeName: "Add new scope",
    learnMore: "Learn more",
    import: "Import",
    export: "Export",
    pasteSettings: "Paste settings",
    copySettings: "Copy settings"
  }, translate);
  const toolbar = createToolbar();
  const nav = createNav();
  const form = createForm(body);
  
  root.append(toolbar.frag, nav.frag, form.frag);
  
  pref.on("scopeChange", nav.updateScope);
  nav.updateScope(pref.getCurrentScope());
  
  pref.on("scopeListChange", nav.updateScopeList);
  nav.updateScopeList(pref.getScopeList());
  
  pref.on("change", form.updateInputs);
  form.updateInputs(pref.getAll());
  
  return destroy;
  
  function createToolbar() {
    const container = document.createElement("div");
    container.className = "webext-pref-toolbar";
    
    const importButton = document.createElement("button");
    importButton.className = "webext-pref-import browser-style";
    importButton.type = "button";
    importButton.textContent = translate.import;
    importButton.onclick = () => {
      Promise.resolve()
        .then(() => {
          const settings = JSON.parse(prompt(translate.pasteSettings));
          return pref.import(settings);
        })
        .catch(err => alert(err.message));
    };
    
    const exportButton = document.createElement("button");
    exportButton.className = "webext-pref-export browser-style";
    exportButton.type = "button";
    exportButton.textContent = translate.export;
    exportButton.onclick = () => {
      pref.export()
        .then(settings => {
          prompt(translate.copySettings, JSON.stringify(settings));
        })
        .catch(err => alert(err.message));
    };
    
    container.append(importButton, exportButton);
    return {frag: container};
  }
  
  function destroy() {
    root.innerHTML = "";
    pref.off("scopeChange", nav.updateScope);
    pref.off("scopeListChange", nav.updateScopeList);
    pref.off("change", form.updateInputs);
  }
  
  function createForm(body) {
    const container = document.createElement("div");
    container.className = "webext-pref-body";
    
    const _body = createBody({body});
    container.append(..._body.frag);
    
    return Object.assign(_body, {updateInputs, frag: container});
    
    function updateInputs(changes) {
      for (const [key, value] of Object.entries(changes)) {
        _body.inputs[key].setValue(value);
      }
    }
  }
  
  function createNav() {
    const container = document.createElement("div");
    container.className = "webext-pref-nav";
    
    const select = document.createElement("select");
    select.className = "browser-style";
    select.onchange = () => {
      pref.setCurrentScope(select.value);
    };
    
    const deleteButton = document.createElement("button");
    deleteButton.className = "browser-style";
    deleteButton.type = "button";
    deleteButton.textContent = "x";
    deleteButton.onclick = () => {
      pref.deleteScope(pref.getCurrentScope())
        .catch(err => {
          alert(err.message);
        });
    };
    
    const addButton = document.createElement("button");
    addButton.className = "browser-style";
    addButton.type = "button";
    addButton.textContent = "+";
    addButton.onclick = () => {
      addNewScope().catch(err => {
        alert(err.message);
      });
        
      function addNewScope() {
        const scopeName = prompt(translate.inputNewScopeName, getNewScope()).trim();
        if (!scopeName) {
          return Promise.reject(new Error("the value is empty"));
        }
        return pref.addScope(scopeName)
          .then(() => pref.setCurrentScope(scopeName));
      }
    };
    
    container.append(select, deleteButton, addButton);
    
    return {
      updateScope,
      updateScopeList,
      frag: container
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
      container.className = `webext-pref-${el.type} browser-style`;
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
    
    const body = createBody({
      body: el.children,
      hLevel: hLevel + 1
    });
    
    const frag = [header];
    if (el.help) {
      frag.push(createHelp(el.help));
    }
    frag.push(...body.frag);
    
    return {
      inputs: body.inputs,
      frag
    };
  }
  
  function createCheckbox(el) {
    const input = document.createElement("input");
    const inputs = {};
    input.id = `pref-${el.key}`;
    input.type = el.type;
    if (el.type === "checkbox") {
      // checkbox
      input.onchange = () => {
        pref.set(el.key, input.checked);
      };
    } else {
      // radio
      input.name = `pref-${el.parentKey}`;
      input.onchange = () => {
        if (input.checked) {
          pref.set(el.parentKey, el.value);
        }
      };
    }
    
    const frag = [
      input,
      createLabel(el.label, input.id)
    ];
    
    if (el.learnMore) {
      frag.push(createLearnMore(el.learnMore));
    }
    if (el.help) {
      frag.push(createHelp(el.help));
    }
    const childContainer = el.children && el.children.length ?
      createChildContainer(el.children) : null;
    if (childContainer) {
      frag.push(childContainer);
    }
    
    return {
      inputs,
      frag,
      setValue: value => {
        input.checked = value;
        if (childContainer) {
          childContainer.disabled = !input.checked;
        }
      }
    };
    
    function createChildContainer(children) {
      const container = document.createElement("fieldset");
      container.className = "webext-pref-checkbox-children";
      container.disabled = true;
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
      container.className = "webext-pref-checkbox browser-style";
      
      const checkbox = createCheckbox(Object.assign({}, option, {
        key: `${el.key}-${option.value}`,
        parentKey: el.key
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
    
    let currentValue;
    
    return {
      inputs,
      frag,
      setValue: value => {
        if (currentValue) {
          radioMap[currentValue].setValue(false);
        }
        radioMap[value].setValue(true);
        currentValue = value;
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
      input.append(...Object.entries(el.options).map(([key, value]) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = value;
        return option;
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
      const value = el.type !== "select" || !el.multiple ? input.value :
        [...input.selectedOptions].map(i => i.value);
      if (el.validate) {
        let err;
        try {
          el.validate(value);
        } catch (_err) {
          err = _err;
        }
        input.setCustomValidity(err ? err.message : "");
        if (err) {
          return;
        }
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
        if (el.type !== "select" || !el.multiple) {
          input.value = value;
        } else {
          const set = new Set(value);
          for (const option of input.options) {
            option.selected = set.has(option.value);
          }
        }
        if (el.validate) {
          input.setCustomValidity("");
        }
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
    label.htmlFor = id;
    return label;
  }
  
  function createLearnMore(url) {
    const a = document.createElement("a");
    a.className = "webext-pref-learn-more";
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
  let domain = "";
  
  createView({
    pref,
    body: prefBody(browser.i18n.getMessage),
    root: document.querySelector(".pref-root"),
    translate: {
      inputNewScopeName: "Add new domain"
    },
    getNewScope: () => domain
  });
  
  const port = browser.runtime.connect({
    name: "optionsPage"
  });
  port.onMessage.addListener(message => {
    if (message.method === "domainChange") {
      domain = message.domain;
      pref.setCurrentScope(pref.getScopeList().includes(domain) ? domain : "global");
    }
  });
});
