import { NamespaceConstructorInputs } from "../../constructors/namespace-constructor/namespace-constructor.types";
import { TaskSetConstructorInputs } from "../../constructors/task-set-constructor/task-set-constructor.types";
import { RulePackConstructorInputs } from "../../constructors/rule-pack-constructor/rule-pack-constructor.types";

export interface ConstructorJSONs {
  isNamespaceJSONValid: boolean;
  isRulePackJSONValid: boolean;
  isTaskSetJSONValid: boolean;
  namespace: NamespaceConstructorInputs;
  taskSet: TaskSetConstructorInputs;
  rulePack: RulePackConstructorInputs;
  error: string;
}

export enum ConstructorJSONType {
  NAMESPACE = "NAMESPACE",
  TASK_SET = "TASK_SET",
  RULE_PACK = "RULE_PACK",
}

export type ConstructorInputs =
  | NamespaceConstructorInputs
  | TaskSetConstructorInputs
  | RulePackConstructorInputs;

// actions
export const UPDATE_NAMESPACE_JSON = "UPDATE_NAMESPACE_JSON";
export const UPDATE_TASK_SET_JSON = "UPDATE_TASK_SET_JSON";
export const UPDATE_RULE_PACK_JSON = "UPDATE_RULE_PACK_JSON";
export const SET_JSON_VALIDITY = "SET_JSON_VALIDITY";

export interface UpdateNamespaceJSONAction {
  type: typeof UPDATE_NAMESPACE_JSON;
  payload: NamespaceConstructorInputs;
}

export interface UpdateTaskSetJSONAction {
  type: typeof UPDATE_TASK_SET_JSON;
  payload: TaskSetConstructorInputs;
}

export interface UpdateRulePackJSONAction {
  type: typeof UPDATE_RULE_PACK_JSON;
  payload: RulePackConstructorInputs;
}

export interface SetJSONValidityAction {
  type: typeof SET_JSON_VALIDITY;
  payload: {
    JSONType: ConstructorJSONType;
    isValid: boolean;
    error: string;
  };
}

export type ConstructorJSONsActionTypes =
  | UpdateNamespaceJSONAction
  | UpdateTaskSetJSONAction
  | UpdateRulePackJSONAction
  | SetJSONValidityAction;
