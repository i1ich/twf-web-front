import {
  TaskSetConstructorInputs,
  TaskSetConstructorReceivedForm,
  TaskSetConstructorSendForm,
} from "./task-set-constructor.types";
import {convertMathInput, MathInputFormat,} from "../../utils/kotlin-lib-functions";
import {
  ExpressionInput,
  GoalType,
  TaskConstructorInputs,
  TaskConstructorReceivedForm
} from "../task-constructor/task-constructor.types";
import {
  RuleConstructorInputs,
  RuleConstructorReceivedForm,
  RuleConstructorSendForm
} from "../rule-constructor/rule-constructor.types";
import {convertInputStringListSeparatedByCommasToArray} from "../../redux/constructor-jsons/constructor-jsons.utils";
import {RulePackLink} from "../rule-pack-constructor/rule-pack-constructor.types";
import {
  ComputationGoalType,
  ReductionGoalType,
  TaskType
} from "../../components/constructor-fields/constructor-fields.type";
import CONSTRUCTOR_JSONS_INITIAL_STATE from "../../redux/constructor-jsons/constructor-jsons.state";

class TaskSetConstructorFormatter {
  public static convertReceivedFormToConstructorInputs(
    data: TaskSetConstructorReceivedForm
  ): TaskSetConstructorInputs {
    // @ts-ignore
    return {
      ...data,
      tasks: data.tasks.map((task: TaskConstructorReceivedForm) => {

        let taskType: TaskType;

        switch (task.goalType) {
          case GoalType.EXPRESSION:
            taskType = TaskType.PROOF;
            break;
          case GoalType.COMPUTATION:
            taskType = TaskType.COMPUTATION;
            break;
          default:
            taskType = TaskType.REDUCTION;
        }

        if (task.otherGoalData === null) {
          task.otherGoalData = {}
        }

        let computationGoalType = "";
        let reductionGoalType = "";

        if (task.otherGoalData.numberType) {
          computationGoalType = ComputationGoalType.NUMBER_TYPE;
          reductionGoalType = ReductionGoalType.NUMBER_TYPE;
        }
        if (task.otherGoalData.hiddenGoalExpressions) {
          computationGoalType = ComputationGoalType.CONCRETE_ANSWERS;
          reductionGoalType = ReductionGoalType.CONCRETE_ANSWERS;
        }
        if (task.otherGoalData.operationWeight) {
          computationGoalType = ComputationGoalType.WEIGHT;
          reductionGoalType = ReductionGoalType.WEIGHT;
        }
        if (task.goalPattern) {
          computationGoalType = ComputationGoalType.PATTERN;
          reductionGoalType = ReductionGoalType.PATTERN;
        }
        if (task.goalType == GoalType.FACTORIZATION) {
          reductionGoalType = ReductionGoalType.FACTORIZATION;
        }
        if (task.goalType == GoalType.REDUCTION) {
          reductionGoalType = ReductionGoalType.REDUCTION;
        }
        if (task.goalType == GoalType.POLYNOM) {
          reductionGoalType = ReductionGoalType.POLYNOMIAL;
        }

        const taskCopy: TaskConstructorInputs = {
          ...task,
          taskType: taskType,
          computationGoalType: computationGoalType,
          reductionGoalType: reductionGoalType,
          goalExpression: {format: MathInputFormat.TEX, expression: ""},
          rulePacks: []
        };
        const otherGoalDataDefault = {
          comparisonType: "=",
          minMultipliersNumber: 1,
          listOfVariables: "",
          hiddenGoalExpressions: [""]
        }

        taskCopy.otherGoalData = {...otherGoalDataDefault, ...taskCopy.otherGoalData};

        taskCopy.otherGoalData.hiddenGoalExpressions = taskCopy.otherGoalData.hiddenGoalExpressions.map((expr: string) => {
          return {
            format: MathInputFormat.TEX,
            expression: expr ? convertMathInput(MathInputFormat.STRUCTURE_STRING, MathInputFormat.TEX, expr) : expr
          }
        })

        // format expression inputs
        taskCopy.originalExpression = {
          format: MathInputFormat.TEX,
          expression: task.originalExpressionTex,
        };

        taskCopy.goalExpression = {
          format: MathInputFormat.TEX,
          expression: task.goalExpressionTex,
        };

        taskCopy.rulePacks = task.rulePacks.map(
          (rulePack: any) => rulePack.rulePackCode
        );

        taskCopy.taskCreationType = taskCopy.countOfAutoGeneratedTasks > 0 ? "auto" : "manual";

        if (taskCopy.rules) {
          taskCopy.rules = taskCopy.rules.map((rule: RuleConstructorReceivedForm) => {
            if (rule.leftStructureString && !rule.left) {
              rule.left = {
                format: MathInputFormat.TEX,
                expression: convertMathInput(MathInputFormat.STRUCTURE_STRING
                  , MathInputFormat.TEX, rule.leftStructureString)
              };
            }
            if (rule.rightStructureString && !rule.right) {
              rule.right = {
                format: MathInputFormat.TEX,
                expression: convertMathInput(MathInputFormat.STRUCTURE_STRING
                  , MathInputFormat.TEX, rule.rightStructureString)
              };
            }
            let formattedRule: RuleConstructorInputs = {...rule};
            return formattedRule;
          });

          if (taskCopy.rules.length == 0) {
            taskCopy.rules = CONSTRUCTOR_JSONS_INITIAL_STATE.taskSet.tasks[0].rules;
          }
        }

        [
          // "otherGoalData",
          "solution",
          "solutionsStepsTree",
          "hints",
          "otherCheckSolutionData",
          "otherAutoGenerationData",
          "interestingFacts",
          "otherAwardData",
          "nextRecommendedTasks",
          "otherData",
        ].forEach((key: string) => {
          if ((task as any)[key] != null) {
            (taskCopy as any)[key] = JSON.stringify((task as any)[key])
          }
        });

        return taskCopy;
      }),
    };
  }

  public static convertConstructorInputsToSendForm(
    data: TaskSetConstructorInputs
  ): TaskSetConstructorSendForm {
    let res = {
      ...data,
      tasks: []
    } as TaskSetConstructorSendForm;
    if (data.tasks) {
      res.tasks = data.tasks.map((task: TaskConstructorInputs) => {
        const taskCopy: TaskConstructorReceivedForm = {
          ...task,
          originalExpressionPlainText: "",
          originalExpressionTex: "",
          originalExpressionStructureString: "",
          goalExpressionPlainText: "",
          goalExpressionTex: "",
          goalExpressionStructureString: "",
          rulePacks: [],
          tags: []
        };
        taskCopy.namespaceCode = data.namespaceCode;

        if (taskCopy.originalExpression.format === MathInputFormat.TEX) {
          taskCopy.originalExpressionTex = taskCopy.originalExpression.expression;
          taskCopy.originalExpressionPlainText = convertMathInput(
            MathInputFormat.TEX,
            MathInputFormat.PLAIN_TEXT,
            taskCopy.originalExpression.expression
          );
          taskCopy.originalExpressionStructureString = convertMathInput(
            MathInputFormat.TEX,
            MathInputFormat.STRUCTURE_STRING,
            taskCopy.originalExpression.expression
          );
        } else if (taskCopy.originalExpression.format === MathInputFormat.PLAIN_TEXT) {
          taskCopy.originalExpressionPlainText = taskCopy.originalExpression.expression;
          taskCopy.originalExpressionTex = convertMathInput(
            MathInputFormat.PLAIN_TEXT,
            MathInputFormat.TEX,
            taskCopy.originalExpression.expression
          );
          taskCopy.originalExpressionStructureString = convertMathInput(
            MathInputFormat.PLAIN_TEXT,
            MathInputFormat.STRUCTURE_STRING,
            taskCopy.originalExpression.expression
          );
        } else if (taskCopy.originalExpression.format === MathInputFormat.STRUCTURE_STRING) {
          taskCopy.originalExpressionStructureString = taskCopy.originalExpression.expression;
          taskCopy.originalExpressionPlainText = convertMathInput(
            MathInputFormat.STRUCTURE_STRING,
            MathInputFormat.PLAIN_TEXT,
            taskCopy.originalExpression.expression
          );
          taskCopy.originalExpressionTex = convertMathInput(
            MathInputFormat.STRUCTURE_STRING,
            MathInputFormat.TEX,
            taskCopy.originalExpression.expression
          );
        }

        if (taskCopy.goalExpression != null) {
          if (taskCopy.goalExpression.expression === null) {
            taskCopy.goalExpression = null;
          } else {
            if (taskCopy.goalExpression.format === MathInputFormat.TEX) {
              taskCopy.goalExpressionTex = taskCopy.goalExpression.expression;
              taskCopy.goalExpressionPlainText = convertMathInput(
                MathInputFormat.TEX,
                MathInputFormat.PLAIN_TEXT,
                task.goalExpression.expression
              );
              taskCopy.goalExpressionStructureString = convertMathInput(
                MathInputFormat.TEX,
                MathInputFormat.STRUCTURE_STRING,
                taskCopy.goalExpression.expression
              );
            } else if (taskCopy.goalExpression.format === MathInputFormat.PLAIN_TEXT) {
              taskCopy.goalExpressionPlainText = taskCopy.goalExpression.expression;
              taskCopy.goalExpressionTex = convertMathInput(
                MathInputFormat.PLAIN_TEXT,
                MathInputFormat.TEX,
                taskCopy.goalExpression.expression
              );
              taskCopy.goalExpressionStructureString = convertMathInput(
                MathInputFormat.PLAIN_TEXT,
                MathInputFormat.STRUCTURE_STRING,
                taskCopy.goalExpression.expression
              );
            } else if (taskCopy.goalExpression.format === MathInputFormat.STRUCTURE_STRING) {
              taskCopy.goalExpressionStructureString = taskCopy.goalExpression.expression;
              taskCopy.goalExpressionPlainText = convertMathInput(
                MathInputFormat.STRUCTURE_STRING,
                MathInputFormat.PLAIN_TEXT,
                taskCopy.goalExpression.expression
              );
              taskCopy.goalExpressionTex = convertMathInput(
                MathInputFormat.STRUCTURE_STRING,
                MathInputFormat.TEX,
                taskCopy.goalExpression.expression
              );
            }
          }
        }

        if (task.rulePacks) {
          taskCopy.rulePacks = convertInputStringListSeparatedByCommasToArray(
            task.rulePacks
          ).map((rulePackCode: string) => {
            return {
              rulePackCode: rulePackCode,
              namespaceCode: taskCopy.namespaceCode,
            } as RulePackLink;
          });
        }

        [
          // "otherGoalData",
          "solution",
          "otherCheckSolutionData",
          "otherAwardData",
          "otherAutoGenerationData",
          "otherData",
          "nextRecommendedTasks",
          "solutionsStepsTree",
          "interestingFacts",
          "hints",
        ].forEach((key: string) => {
          if ((task as any)[key] === "") {
            (taskCopy as any)[key] = null;
          } else if ((task as any)[key] != null) {
            console.log(`field ${key} is not null and blank, it is: `, (task as any)[key]);
            (taskCopy as any)[key] = JSON.parse((task as any)[key])
          }
        });

        if (task.rules) {
          taskCopy.rules = task.rules.map((rule: RuleConstructorInputs) => {
            const formattedRule: RuleConstructorSendForm = {...rule};

            if (!rule.left && !rule.right) {
              return formattedRule;
            }

            // @ts-ignore
            const left = rule.left as ExpressionInput;
            formattedRule.leftStructureString = convertMathInput(
              left.format,
              MathInputFormat.STRUCTURE_STRING,
              rule.left!!.expression
            );
            // @ts-ignore
            const right = rule.right as ExpressionInput;
            formattedRule.rightStructureString = convertMathInput(
              right.format,
              MathInputFormat.STRUCTURE_STRING,
              rule.right!!.expression
            );
            return formattedRule;
          });
        }
        return taskCopy
      });
    }

    if (!res.otherData) {
      res.otherData = null;
    }

    console.log(res);
    // @ts-ignore
    return res;
  }
}

export default TaskSetConstructorFormatter;
