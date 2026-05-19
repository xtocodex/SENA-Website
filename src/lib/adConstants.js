export const PLACEMENT_LABELS = {
  'in-map':      'In Map',
  'ui-board':    'UI Board',
  'interactive': 'Interactive',
};

export const TYPE_LABELS = {
  'product-based':  'Product',
  'software-based': 'Software',
  'other':          'Other',
};

export const PROJECT_LABELS = {
  'sena':    'SENA',
  'option2': 'Option 2',
  'option3': 'Option 3',
};

export function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
