interface GetInputFromEnvFn {
  (options: { name: string; required?: false; type: "string" }): string | null;
  (options: { name: string; required: true; type: "string" }): string;
}

export const getInputFromEnv: GetInputFromEnvFn = ({
  name,
  required,
  type,
}) => {
  if (type !== "string") {
    throw new Error("Only string inputs currently supported");
  }
  const environmentVariableName = name.toUpperCase().replaceAll("-", "_");
  const value = process.env[environmentVariableName];
  if (required && isEmpty(value)) {
    throw new Error(`Input ${name} is required`);
  }
  if (value != null && typeof value !== type) {
    throw new Error(
      `Expected ${type} for input ${name}, but got ${typeof value}`
    );
  }

  // Typescript can't infer that value would never be null when required is true,
  // so we have to use a non-null assertion
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (value ?? null)!;
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
