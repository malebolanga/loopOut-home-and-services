const textFieldSelector = 'textarea, input[type="text"], input[type="search"]';
const excludedFieldContext = /\b(name|first|last|email|phone|telephone|tel|address|street|suburb|city|province|postal|postcode|zip|url|website|password|username|verification|otp|code|latitude|longitude)\b/i;

function shouldCorrectText(field) {
  const type = field instanceof HTMLInputElement ? field.type.toLowerCase() : 'textarea';
  if (type !== 'textarea' && type !== 'text' && type !== 'search') return false;

  const labelText = Array.from(field.labels || [])
    .map((label) => label.textContent || '')
    .join(' ');
  const labelledByText = (field.getAttribute('aria-labelledby') || '')
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent || '')
    .join(' ');
  const context = [
    field.name,
    field.id,
    field.placeholder,
    field.getAttribute('aria-label'),
    field.getAttribute('autocomplete'),
    labelText,
    labelledByText
  ].join(' ');

  return !excludedFieldContext.test(context);
}

function configureField(field) {
  if (!(field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement)) return;
  if (!field.matches(textFieldSelector)) return;

  const enabled = shouldCorrectText(field);
  if (!field.hasAttribute('spellcheck')) field.setAttribute('spellcheck', String(enabled));
  if (!field.hasAttribute('autocorrect')) field.setAttribute('autocorrect', enabled ? 'on' : 'off');
  if (enabled && field instanceof HTMLTextAreaElement && !field.hasAttribute('autocapitalize')) {
    field.setAttribute('autocapitalize', 'sentences');
  }
}

function configureSubtree(node) {
  if (!(node instanceof Element)) return;
  configureField(node);
  node.querySelectorAll(textFieldSelector).forEach(configureField);
}

export function installTextCorrection() {
  const root = document.getElementById('root');
  if (!root || root.dataset.textCorrectionInstalled === 'true') return;

  root.dataset.textCorrectionInstalled = 'true';
  configureSubtree(root);

  const observer = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach(configureSubtree));
  });
  observer.observe(root, { childList: true, subtree: true });
}
