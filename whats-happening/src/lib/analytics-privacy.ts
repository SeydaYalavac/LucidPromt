function withoutQueryOrHash(value: unknown) {
  if (typeof value !== "string") return value;
  if (value.startsWith("$")) return value;
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value.split(/[?#]/, 1)[0];
  }
}

export function scrubAutomaticAcquisitionProperties(
  properties: Record<string, unknown>,
) {
  for (const key of ["$current_url", "$initial_current_url", "$session_entry_url"]) {
    if (key in properties) properties[key] = withoutQueryOrHash(properties[key]);
  }

  for (const key of [
    "$referrer",
    "$initial_referrer",
    "$session_entry_referrer",
    "$referring_domain",
    "$initial_referring_domain",
  ]) {
    delete properties[key];
  }

  for (const key of Object.keys(properties)) {
    if (/^\$?(?:initial_)?utm_/i.test(key) || /^\$?(?:initial_)?(?:gclid|fbclid|msclkid)$/i.test(key)) {
      delete properties[key];
    }
  }

  for (const containerKey of ["$set", "$set_once"]) {
    const container = properties[containerKey];
    if (!container || typeof container !== "object") continue;
    for (const key of Object.keys(container)) {
      if (/^\$?(?:initial_)?utm_/i.test(key) || /^\$?(?:initial_)?(?:gclid|fbclid|msclkid)$/i.test(key)) {
        delete (container as Record<string, unknown>)[key];
      }
    }
  }

  const initialPersonInfo = properties.$initial_person_info;
  if (initialPersonInfo && typeof initialPersonInfo === "object") {
    const values = initialPersonInfo as Record<string, unknown>;
    delete values.r;
    if ("u" in values) values.u = withoutQueryOrHash(values.u);
  }

  const clientSessionProps = properties.$client_session_props;
  if (clientSessionProps && typeof clientSessionProps === "object") {
    const values = clientSessionProps as { props?: Record<string, unknown> };
    if (values.props) {
      delete values.props.r;
      if ("u" in values.props) values.props.u = withoutQueryOrHash(values.props.u);
    }
  }
}
