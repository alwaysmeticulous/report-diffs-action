interface GetInputFromEnvFn {
  (options: { name: string; required?: false; type: "number" }): number | null;
  (options: { name: string; required?: false; type: "string" }): string | null;
  (options: { name: string; required: true; type: "string" }): string;
  (options: { name: string; required: true; type: "number" }): number;
}

export const getInputFromEnv: GetInputFromEnvFn = ({
  name,
  required,
  type,
}) => {
  const environmentVariableName = name.toUpperCase().replaceAll("-", "_");
  const value = parseValue(process.env[environmentVariableName], type);
  if (required && isEmpty(value)) {
    throw new Error(`Input ${name} is required`);
  }
  if (value != null && typeof value !== type) {
    throw new Error(
      `Expected ${type} for input ${name}, but got ${typeof value}`
    );
  }

  // Typescript can't infer that if type === number value is a number etc., so
  // so we need to force cast here
  return value as any;
};

const parseValue = (
  value: string | undefined,
  type: "string" | "number"
): string | number | null => {
  if (value == null) {
    return null;
  }
  if (type === "string") {
    return value;
  } else if (type === "number") {
    const parsed = Number.parseInt(value);
    if (isNaN(parsed)) {
      return null;
    }
    return parsed;
  }
  return unknownType(type);
};

const unknownType = (type: never) => {
  throw new Error(
    `Only string or number inputs currently supported, but got ${type}`
  );
};

const isEmpty = (value: unknown) => {
  if (value == null) {
    return true;
  }
  if (typeof value === "string") {
    return value.length === 0;
  }
  return false;
};
