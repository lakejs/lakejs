const blockAttributeRules = {
  id: /^[\w-]+$/,
  class: /^[\w-]+$/,
  style: {
    'text-align': /^left|center|right|justify$/i,
    'margin-left': /^\d+px$/i,
  },
};

export const defaultRules = {
  h1: blockAttributeRules,
  h2: blockAttributeRules,
  h3: blockAttributeRules,
  h4: blockAttributeRules,
  h5: blockAttributeRules,
  h6: blockAttributeRules,
  p: blockAttributeRules,
  blockquote: blockAttributeRules,
  span: {
    style: {
      color: /^\S+$/,
      'background-color': /^\S+$/,
    },
  },
  strong: {},
  i: {},
  u: {},
  s: {},
  sub: {},
  sup: {},
  code: {},
  a: {
    href: /^\S+$/,
    target: /^\S+$/,
  },
};
