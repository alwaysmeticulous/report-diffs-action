import Joi from "joi";
import YAML from "yaml";
import { ProjectTarget } from "./types";

interface ProjectTargetSchema {
  "app-url": string;
  "api-token": string;
  skip: boolean;
}

interface ProjectsYamlSchema {
  [key: string]: ProjectTargetSchema;
}

const projectTargetSchema = Joi.object<ProjectTargetSchema>({
  "app-url": Joi.string().required(),
  "api-token": Joi.string().required(),
  skip: Joi.boolean().default(false).optional().label("skip"),
});

const projectsYamlSchema = Joi.object<ProjectsYamlSchema>().pattern(
  Joi.string(),
  projectTargetSchema
);

export const parseProjectsYaml: (projectsYaml: string) => ProjectTarget[] = (
  projectsYaml
) => {
  const data = YAML.parse(projectsYaml);

  // Validate the parsed projects data.
  const { error, value } = projectsYamlSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    throw new Error(`Invalid projects-yaml: ${error.message}`);
  }

  return Object.entries(value).map(([name, project]) => ({
    name,
    apiToken: project["api-token"],
    appUrl: project["app-url"],
    skip: project.skip,
  }));
};
