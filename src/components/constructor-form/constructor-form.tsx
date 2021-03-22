// libs and hooks
import React, { Dispatch, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
// custom components
import ConstructorSelect from "../constructor-select/constructor-select.component";
import ConstructorInput from "../constructor-input/constructor-input.component";
import MixedInput from "../mixed-input/mixed-input.component";
import ConstructorUndoRedoPanel from "../constructor-undo-redo-panel/constructor-undo-redo-panel.component";
// redux
import { connect, ConnectedProps } from "react-redux";
import { createStructuredSelector } from "reselect";
import { selectCurrentTaskSetHistoryChange } from "../../redux/constructor-history/constructor-history.selectors";
import {
  selectNamespaceJSON,
  selectRulePackJSON,
  selectTaskSetJSON,
} from "../../redux/constructor-jsons/constructor-jsons.selectors";
import {
  addOneLineChangeToHistory,
  redoHistory,
  undoHistory,
} from "../../redux/constructor-history/constructor-history.actions";
import {
  updateNamespaceJSON,
  updateRulePackJSON,
  updateTaskSetJSON,
} from "../../redux/constructor-jsons/constructor-jsons.actions";
// types
import { ConstructorJSONType } from "../../redux/constructor-jsons/constructor-jsons.types";
import { MathInputFormat } from "../../utils/kotlin-lib-functions";
import { RootState } from "../../redux/root-reducer";
import { TaskSetConstructorInputs } from "../../constructors/task-set-constructor/task-set-constructor.types";
import { RulePackConstructorInputs } from "../../constructors/rule-pack-constructor/rule-pack-constructor.types";
import { NamespaceConstructorInputs } from "../../constructors/namespace-constructor/namespace-constructor.types";
import {
  ConstructorHistoryItem,
  OneLineHistoryChange,
} from "../../redux/constructor-history/constructor-history.types";
import {
  ConstructorFormInput,
  ConstructorFormProps,
} from "./constructor-form.types";
// utils
import { isExpressionInput, isSelectInput } from "../../constructors/utils";

const ConstructorForm = ({
  // constructor form props
  inputs,
  constructorType,
  // redux props
  currentHistoryChange,
  addOneLineChangeToHistory,
  undo,
  redo,
  updateTaskSetJSON,
  updateNamespaceJSON,
  updateRulePackJSON,
}: ConstructorFormProps & ConnectedProps<typeof connector>) => {
  // react-hook-form core functions from parent component's context
  // ConstructorForm should be wrapped inside FormProvider component
  const { setValue, watch, reset, getValues } = useFormContext();

  const [undoOrRedoIsTriggered, setUndoOrRedoIsTriggered] = useState(false);

  const addToHistory = (
    name: string,
    oldVal: string | string[],
    newVal: string | string[],
    constructorType: ConstructorJSONType
  ): void => {
    addOneLineChangeToHistory({
      oldVal: {
        propertyPath: name,
        value: oldVal,
      },
      newVal: {
        propertyPath: name,
        value: newVal,
      },
      constructorType,
    });
  };

  const updateReduxJSON = (() => {
    switch (constructorType) {
      case ConstructorJSONType.NAMESPACE:
        return updateNamespaceJSON;
      case ConstructorJSONType.RULE_PACK:
        return updateRulePackJSON;
      case ConstructorJSONType.TASK_SET:
        return updateTaskSetJSON;
    }
  })();

  const onChangeInputValue = (
    name: string,
    oldVal: string | string[],
    newVal: string | string[],
    constructorType: ConstructorJSONType
  ): void => {
    addToHistory(name, oldVal, newVal, constructorType);
    setValue(name, newVal);
  };

  useEffect(() => {
    if (undoOrRedoIsTriggered) {
      if (currentHistoryChange?.type === "ONE_LINE_CHANGE") {
        setValue(
          currentHistoryChange.item.propertyPath,
          currentHistoryChange.item.value
        );
      } else if (currentHistoryChange?.type === "MULTIPLE_LINES_CHANGE") {
        reset(currentHistoryChange.item);
      }
      setUndoOrRedoIsTriggered(false);
    }
  }, [undoOrRedoIsTriggered]);

  return (
    <div
      onBlur={() => {
        // update current JSON when users clicks/taps outside of form
        // @ts-ignore
        updateReduxJSON(getValues());
      }}
    >
      <ConstructorUndoRedoPanel
        undo={() => {
          undo(constructorType);
          setUndoOrRedoIsTriggered(true);
        }}
        redo={() => {
          redo(constructorType);
          setUndoOrRedoIsTriggered(true);
        }}
      />
      {inputs.map((input: ConstructorFormInput) => {
        const { name } = input;
        // current value from react-hook-form
        const watchValue = isExpressionInput(input) ? null : watch(name);

        if (isSelectInput(input)) {
          return (
            <ConstructorSelect
              {...input}
              key={name}
              value={watchValue}
              onChange={(value: string | string[]) => {
                onChangeInputValue(name, watchValue, value, constructorType);
              }}
            />
          );
        } else if (isExpressionInput(input)) {
          return (
            <MixedInput
              {...input}
              key={name}
              expression={watch(name + ".expression")}
              format={watch(name + ".format")}
              onChangeExpression={(value: string) => {
                onChangeInputValue(
                  name + ".expression",
                  watch(name + ".expression"),
                  value,
                  constructorType
                );
              }}
              onChangeFormat={(value: MathInputFormat) => {
                onChangeInputValue(
                  name + ".format",
                  watch(name + ".format"),
                  value,
                  constructorType
                );
              }}
            />
          );
        } else {
          return (
            <ConstructorInput
              {...input}
              key={name}
              value={watchValue}
              onChange={(value: string | string[]) => {
                onChangeInputValue(name, watchValue, value, constructorType);
              }}
              constructorType={ConstructorJSONType.TASK_SET}
            />
          );
        }
      })}
    </div>
  );
};

// connecting redux
const mapState = createStructuredSelector<
  RootState,
  {
    currentHistoryChange: ConstructorHistoryItem | undefined;
    taskSetJSON: TaskSetConstructorInputs;
    namespaceJSON: NamespaceConstructorInputs;
    rulePackJSON: RulePackConstructorInputs;
  }
>({
  currentHistoryChange: selectCurrentTaskSetHistoryChange,
  taskSetJSON: selectTaskSetJSON,
  namespaceJSON: selectNamespaceJSON,
  rulePackJSON: selectRulePackJSON,
});

const mapDispatch = (dispatch: Dispatch<any>) => ({
  addOneLineChangeToHistory: (item: OneLineHistoryChange) =>
    dispatch(addOneLineChangeToHistory(item)),
  undo: (constructorType: ConstructorJSONType) =>
    dispatch(undoHistory(constructorType)),
  redo: (constructorType: ConstructorJSONType) =>
    dispatch(redoHistory(constructorType)),
  updateTaskSetJSON: (value: TaskSetConstructorInputs) =>
    dispatch(updateTaskSetJSON(value)),
  updateRulePackJSON: (value: RulePackConstructorInputs) =>
    dispatch(updateRulePackJSON(value)),
  updateNamespaceJSON: (value: NamespaceConstructorInputs) =>
    dispatch(updateNamespaceJSON(value)),
});

const connector = connect(mapState, mapDispatch);

export default connector(ConstructorForm);
