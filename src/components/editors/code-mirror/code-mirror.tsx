// libs and hooks
import React, { useEffect, useRef, useState } from "react";
import CodeMirror, { Position, TextMarker } from "codemirror";
// redux
import CONSTRUCTOR_JSONS_INITIAL_STATE from "../../../redux/constructor-jsons/constructor-jsons.state";
import { connect, ConnectedProps } from "react-redux";
import { createStructuredSelector } from "reselect";
import {
  selectNamespaceJSON,
  selectRulePackJSON,
  selectTaskSetJSON,
} from "../../../redux/constructor-jsons/constructor-jsons.selectors";
import {
  updateNamespaceJSON,
  updateRulePackJSON,
  updateTaskSetJSON,
} from "../../../redux/constructor-jsons/constructor-jsons.actions";
// codemirror core addons
import "codemirror/mode/javascript/javascript";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/search/search";
import "codemirror/addon/dialog/dialog";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/search/matchesonscrollbar";
import "codemirror/addon/search/matchesonscrollbar.css";
import "codemirror/addon/display/panel";
// codemirror third-party addons
import "codemirror-find-and-replace-dialog/dist/search.js";
import "codemirror-find-and-replace-dialog/dist/dialog.js";
import "codemirror-find-and-replace-dialog/dist/dialog.css";
// codemirror hints/lints
import "codemirror/addon/hint/javascript-hint";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/lint/json-lint";
import "codemirror/addon/lint/lint";
import "codemirror/addon/lint/lint.css";
// types
import { Dispatch } from "react";
import { ConstructorJSONsActionTypes } from "../../../redux/constructor-jsons/constructor-jsons.types";
import { NamespaceConstructorInputs } from "../../../constructors/namespace-constructor/namespace-constructor.types";
import { ConstructorType } from "../../../pages/constructor-page/constructor-page.types";
import { RootState } from "../../../redux/root-reducer";
import { RulePackConstructorInputs } from "../../../constructors/rule-pack-constructor/rule-pack-constructor.types";
import { TaskSetConstructorInputs } from "../../../constructors/task-set-constructor/task-set-constructor.types";
// styles
import "./code-mirror.scss";
import { edit } from "ace-builds";
import {
  getErrorFromMathInput,
  MathInputFormat,
} from "../../../utils/kotlin-lib-functions";

// jsonlint config
const jsonlint = require("jsonlint-mod");
// @ts-ignore
window["jsonlint"] = jsonlint;

export interface CodeMirrorProps {
  constructorType: ConstructorType;
}

export interface CodeMirrorWordPosition {
  from: Position;
  to: Position;
}

const CodeMirrorEditor = ({
  constructorType,
  rulePackJSON,
  namespaceJSON,
  taskSetJSON,
  updateNamespaceJSON,
  updateRulePackJSON,
  updateTaskSetJSON,
}: CodeMirrorProps & ConnectedProps<typeof connector>): JSX.Element => {
  const [editor, setEditor] = useState<any>(null);

  const entryPoint: React.Ref<any> = useRef();

  const currentReduxJSON = (() => {
    switch (constructorType) {
      case "namespace":
        return namespaceJSON;
      case "rulePack":
        return rulePackJSON;
      case "taskSet":
        return taskSetJSON;
    }
  })();

  const initialReduxJSON = (() => {
    switch (constructorType) {
      case "namespace":
        return CONSTRUCTOR_JSONS_INITIAL_STATE.namespace;
      case "rulePack":
        return CONSTRUCTOR_JSONS_INITIAL_STATE.rulePack;
      case "taskSet":
        return CONSTRUCTOR_JSONS_INITIAL_STATE.taskSet;
    }
  })();

  const updateCurrentReduxJSON = (() => {
    switch (constructorType) {
      case "namespace":
        return updateNamespaceJSON;
      case "rulePack":
        return updateRulePackJSON;
      case "taskSet":
        return updateTaskSetJSON;
    }
  })();

  const getWordPositions = (
    editor: CodeMirror.Editor,
    word: string
  ): CodeMirrorWordPosition[] => {
    // initializing cursor at the start of the document
    // @ts-ignore *getSearchCursor method is an addon and not type checked in original CodeMirror
    const cursor = editor.getSearchCursor(
      word,
      { line: 0, ch: 0 },
      {
        caseFold: true,
        multiline: true,
      }
    );
    const wordPositions: CodeMirrorWordPosition[] = [];
    cursor.find();
    while (cursor.from() && cursor.to()) {
      wordPositions.push({
        from: cursor.from(),
        to: cursor.to(),
      });
      cursor.findNext();
    }
    return wordPositions;
  };

  // TODO: refactor function, remove inner function, make it clean
  const getExcessiveProps = (doc: string): string[] => {
    try {
      JSON.parse(doc);
    } catch {
      return [];
    }
    const excessiveProps: string[] = [];
    const addExcessiveProps = (editorValue: any, initialValue: any) => {
      const editorProps = Object.keys(editorValue);
      const allowedProps = Object.keys(initialValue);
      editorProps.forEach((prop: string) => {
        if (!allowedProps.includes(prop)) {
          excessiveProps.push(prop);
        } else if (
          Array.isArray(editorValue[prop]) &&
          Array.isArray(initialValue[prop]) &&
          editorValue[prop].length !== 0 &&
          initialValue[prop].length !== 0
        ) {
          editorValue[prop].forEach((value: any) => {
            addExcessiveProps(value, initialValue[prop][0]);
          });
        } else if (typeof editorValue[prop] === "object") {
          addExcessiveProps(editorValue[prop], initialValue[prop]);
        }
      });
    };
    addExcessiveProps(JSON.parse(doc), initialReduxJSON);
    return excessiveProps;
  };

  const setErrorLineAndGutter = (
    editor: CodeMirror.Editor,
    from: Position,
    to: Position,
    msg: string
  ): void => {
    editor.markText(from, to, {
      className: "CodeMirror-lint-mark-error",
      title: msg,
    });
    const marker: HTMLDivElement = document.createElement("div");
    marker.setAttribute("class", "CodeMirror-lint-marker-error");
    marker.setAttribute("data-toggle", "tooltip");
    marker.setAttribute("data-placement", "right");
    marker.setAttribute("title", msg);
    editor.setGutterMarker(from.line, "gutter-error", marker);
  };

  const destroyAllErrors = (editor: CodeMirror.Editor): void => {
    editor.clearGutter("gutter-error");
    editor.getAllMarks().forEach((mark: TextMarker) => {
      mark.clear();
    });
  };

  // TODO: refactor function, remove inner function, make it clean
  const getAllExpressions = (
    editor: CodeMirror.Editor
  ): { format: string; expression: string }[] => {
    const editorObj = JSON.parse(editor.getValue());
    const expressions: { format: string; expression: string }[] = [];
    const getExpression = (obj: any) => {
      if (typeof obj === "object") {
        if (obj.hasOwnProperty("format") && obj.hasOwnProperty("expression")) {
          expressions.push({
            format: obj.format,
            expression: obj.expression,
          });
        } else {
          Object.keys(obj).forEach((prop: string) => {
            if (typeof obj[prop] === "object") {
              if (
                obj[prop].hasOwnProperty("format") &&
                obj[prop].hasOwnProperty("expression")
              ) {
                expressions.push({
                  format: obj[prop].format,
                  expression: obj[prop].expression,
                });
              } else {
                getExpression(obj[prop]);
              }
            }
          });
        }
      }
    };
    getExpression(editorObj);
    return expressions;
  };

  useEffect(() => {
    if (entryPoint.current) {
      const editor = CodeMirror(entryPoint.current, {
        value: JSON.stringify(currentReduxJSON, null, 2),
        mode: "application/ld+json",
        lineNumbers: true,
        tabSize: 2,
        gutters: ["CodeMirror-lint-markers", "gutter-error"],
        showHint: true,
        lint: true,
        matchBrackets: true,
        lineWrapping: true,
        autoCloseBrackets: true,
      });
      editor.on("change", () => {
        try {
          updateCurrentReduxJSON(JSON.parse(editor.getValue()));
        } catch {}
        destroyAllErrors(editor);
        // set excessive props errors
        getExcessiveProps(editor.getValue()).forEach(
          (excessiveProp: string) => {
            getWordPositions(editor, excessiveProp).forEach(
              (foundPosition: CodeMirrorWordPosition) => {
                setErrorLineAndGutter(
                  editor,
                  foundPosition.from,
                  foundPosition.to,
                  "Unexpected property"
                );
              }
            );
          }
        );
        getAllExpressions(editor).forEach((expression) => {
          if (
            expression.format !== MathInputFormat.TEX &&
            expression.format !== MathInputFormat.PLAIN_TEXT &&
            expression.format !== MathInputFormat.STRUCTURE_STRING
          ) {
            getWordPositions(editor, expression.format).forEach(
              (foundPosition: CodeMirrorWordPosition) => {
                setErrorLineAndGutter(
                  editor,
                  foundPosition.from,
                  foundPosition.to,
                  "Invalid expression format"
                );
              }
            );
          } else {
            getWordPositions(editor, expression.expression).forEach(
              (foundPosition: CodeMirrorWordPosition) => {
                const error = getErrorFromMathInput(
                  expression.format as MathInputFormat,
                  expression.expression
                );
                if (error) {
                  setErrorLineAndGutter(
                    editor,
                    foundPosition.from,
                    foundPosition.to,
                    error
                  );
                }
              }
            );
          }
        });
      });
      setEditor(editor);
    }
  }, []);

  return (
    <div className="code-mirror">
      <div
        style={{ height: "70vh", width: "100%", marginLeft: "2rem" }}
        ref={entryPoint}
        id="entry-point"
      />
    </div>
  );
};

const mapStateToProps = createStructuredSelector<
  RootState,
  {
    namespaceJSON: NamespaceConstructorInputs;
    rulePackJSON: RulePackConstructorInputs;
    taskSetJSON: TaskSetConstructorInputs;
  }
>({
  namespaceJSON: selectNamespaceJSON,
  rulePackJSON: selectRulePackJSON,
  taskSetJSON: selectTaskSetJSON,
});

const mapDispatchToProps = (
  dispatch: Dispatch<ConstructorJSONsActionTypes>
) => ({
  updateNamespaceJSON: (namespaceJSON: NamespaceConstructorInputs) => {
    return dispatch(updateNamespaceJSON(namespaceJSON));
  },
  updateTaskSetJSON: (taskSetJSON: TaskSetConstructorInputs) => {
    return dispatch(updateTaskSetJSON(taskSetJSON));
  },
  updateRulePackJSON: (rulePackJSON: RulePackConstructorInputs) => {
    return dispatch(updateRulePackJSON(rulePackJSON));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CodeMirrorEditor);
