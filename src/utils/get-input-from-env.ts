interface GetInputFromEnvFn {
  (options: { name: string; required: true; type: "string" }): string;
  (options: { name: string; required?: false; type: "string" }): string | null;
  (options: { name: string; required: true; type: "int" }): number;
  (options: { name: string; required?: false; type: "int" }): number | null;
  (options: { name: string; required: true; type: "float" }): number;
  (options: { name: string; required?: false; type: "float" }): number | null;
  (options: { name: string; required: true; type: "boolean" }): boolean;
  (options: { name: string; required?: false; type: "boolean" }):
    | boolean
    | null;
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
  if (value != null && typeof value !== expectedValueType(type)) {
    throw new Error(
      `Expected ${type} for input ${name}, but got ${typeof value}`
    );
  }
  if (type === "string" && !required) {
    return value || null;
  }

  // Typescript can't infer that if type === number value is a number etc., so
  // so we need to force cast here
  return value as any;
};

const parseValue = (
  value: string | undefined,
  type: "string" | "int" | "float" | "boolean"
): string | number | boolean | null => {
  if (value == null) {
    return null;
  }
  if (type === "string") {
    return value;
  }
  if (type === "int") {
    const parsed = Number.parseInt(value);
    if (isNaN(parsed)) {
      return null;
    }
    return parsed;
  }
  if (type === "float") {
    const parsed = Number.parseFloat(value);
    if (isNaN(parsed)) {
      return null;
    }
    return parsed;
  }
  if (type === "boolean") {
    if (value != null && value != "" && value !== "true" && value !== "false") {
      throw new Error(
        "Boolean inputs must be equal to the string 'true' or the string 'false'"
      );
    }
    return value === "true";
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

const expectedValueType = (type: "string" | "int" | "float" | "boolean") => {
  if (type === "string") {
    return "string";
  }
  if (type === "int") {
    return "number";
  }
  if (type === "float") {
    return "number";
  }
  if (type === "boolean") {
    return "boolean";
  }
  return unknownType(type);
};
