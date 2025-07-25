import { setFailed, setOutput, info, warning, error } from "@actions/core";
import { ActionsService } from "../types";

export class DefaultActionsService implements ActionsService {
  setFailed(message: string): void {
    setFailed(message);
  }

  setOutput(name: string, value: string): void {
    setOutput(name, value);
  }

  info(message: string): void {
    info(message);
  }

  warning(message: string): void {
    warning(message);
  }

  error(message: string): void {
    error(message);
  }
}