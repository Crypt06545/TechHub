const isPlainObject = (val) =>
  Object.prototype.toString.call(val) === "[object Object]";

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (isPlainObject(value)) {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      cleaned[key] = sanitizeValue(value[key]);
    }
    return cleaned;
  }

  return value;
};

export const sanitizeInputs = (req, res, next) => {
  if (req.body && isPlainObject(req.body)) {
    req.body = sanitizeValue(req.body);
  }

  // req.query / req.params are getter-only in Express 5 — mutate in place
  if (req.query && isPlainObject(req.query)) {
    const cleanedQuery = sanitizeValue(req.query);
    for (const key of Object.keys(req.query)) delete req.query[key];
    Object.assign(req.query, cleanedQuery);
  }

  if (req.params && isPlainObject(req.params)) {
    const cleanedParams = sanitizeValue(req.params);
    for (const key of Object.keys(req.params)) delete req.params[key];
    Object.assign(req.params, cleanedParams);
  }

  next();
};
