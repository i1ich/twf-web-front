// @ts-ignore
// import twf_js from '../../public/kotlin-lib/twf_js';
import {RulePackConstructorReceivedForm} from "../constructors/rule-pack-constructor/rule-pack-constructor.types";
import {TaskConstructorReceivedForm} from "../constructors/task-constructor/task-constructor.types";

const twf_js = (window as any)['twf_js'];

// LIB API FUNCTIONS
// format -> expression
export const stringToExpression = twf_js.stringToExpression;
const structureStringToExpression = twf_js.structureStringToExpression;
const texToExpression = twf_js.stringToExpression;
// const getUserLogInPlainText = twf_js.getUserLogInPlainText;

// expression -> format
const expressionToTexString = twf_js.expressionToTexString;
const expressionToStructureString = twf_js.expressionToStructureString;
const expressionToString = twf_js.expressionToString;

class MathInputConvertingError extends Error {
  constructor(message: any) {
    super(message);
    this.name = "MathInputConvertingError";
  }
}

export enum MathInputFormat {
  TEX = "TEX",
  STRUCTURE_STRING = "STRUCTURE_STRING",
  PLAIN_TEXT = "PLAIN_TEXT",
}

export const convertMathInput = (
  from: MathInputFormat,
  to: MathInputFormat,
  expression: string
): string | any => {
  try {
    const expressionInLibFormat: any = (() => {
      if (from === MathInputFormat.PLAIN_TEXT) {
        return stringToExpression(expression);
      } else if (from === MathInputFormat.STRUCTURE_STRING) {
        return structureStringToExpression(expression);
      } else if (from === MathInputFormat.TEX) {
        // lib understands '//' as '/' in classic TEX
        return texToExpression(expression.replace(/\//g, "//"));
      }
    })();
    if (expressionInLibFormat.nodeType.name$ === "ERROR") {
      throw new MathInputConvertingError(expressionInLibFormat.value);
    }
    if (to === MathInputFormat.PLAIN_TEXT) {
      return expressionToString(expressionInLibFormat);
    } else if (to === MathInputFormat.STRUCTURE_STRING) {
      return expressionToStructureString(expressionInLibFormat);
    } else if (to === MathInputFormat.TEX) {
      return expressionToTexString(expressionInLibFormat);
    }
  } catch (e: any) {
    console.error("ERROR WHILE DOING MATH CONVERTING", e.message, e);
    return "ERROR WHILE GETTING ERROR FROM MATH INPUT: " + e.message
  }
};

export const getErrorFromMathInput = (
  format: MathInputFormat,
  expression: string
): string | null => {
  try {
    const expressionInLibFormat: any = (() => {
      if (format === MathInputFormat.PLAIN_TEXT) {
        return stringToExpression(expression);
      } else if (format === MathInputFormat.STRUCTURE_STRING) {
        return structureStringToExpression(expression);
      } else if (format === MathInputFormat.TEX) {
        // lib understands '//' as '/' in classic TEX
        return texToExpression(expression.replace(/\//g, "//"));
      }
    })();
    return expressionInLibFormat.nodeType.name$ === "ERROR"
      ? expressionInLibFormat.value
      : null;
  } catch (e: any) {
    console.error("ERROR WHILE GETTING ERROR FROM MATH INPUT", e.message, e);
    return "ERROR WHILE GETTING ERROR FROM MATH INPUT: " + e.message
  }
};

export const checkTex = (
  fullExpression: string,
  task: TaskConstructorReceivedForm,
  rulesPacks: RulePackConstructorReceivedForm[]
) => {
  try {

    let rulesPacksCodes = rulesPacks.flatMap(rulePack => rulePack.rulePacks?.flatMap(rule => rule.rulePackCode));

    let rulesItr = rulesPacks.flatMap(rulePack => rulePack.rules?.flatMap(rule =>
      twf_js.createRuleITR(
        rule.code,
        rule.nameEn,
        rule.nameRu,
        rule.descriptionShortEn,
        rule.descriptionShortRu,
        rule.descriptionEn,
        rule.descriptionRu,
        twf_js.createExpressionFrontInput(rule.leftStructureString, MathInputFormat.STRUCTURE_STRING),
        twf_js.createExpressionFrontInput(rule.rightStructureString, MathInputFormat.STRUCTURE_STRING),
        rule.priority,
        rule.isExtending,
        rule.matchJumbledAndNested,
        rule.simpleAdditional,
        rule.basedOnTaskContext,
        rule.normalizationType,
        rule.weight,
        task.subjectType
      )
    ));

    let taskItr = twf_js.createTaskITR(
      task.taskCreationType,
      task.code,
      task.namespaceCode,
      task.nameEn,
      task.nameRu,
      task.descriptionShortEn,
      task.descriptionShortRu,
      task.descriptionEn,
      task.descriptionRu,
      task.subjectType,
      task.tags,
      twf_js.createExpressionFrontInput(task.originalExpression.expression, task.originalExpression.format),
      task.goalType,
      task.goalExpression !== null ? twf_js.createExpressionFrontInput(task.goalExpression.expression, task.goalExpression.format) : null,
      task.goalPattern,
      undefined,
      task.otherGoalData == null ? undefined : JSON.stringify(task.otherGoalData),
      rulesPacksCodes,
      rulesItr,
      task.stepsNumber,
      task.time,
      task.difficulty,
      twf_js.createExpressionFrontInput(fullExpression, MathInputFormat.TEX),
      task.solutionsStepsTree == null ? undefined : JSON.stringify(task.solutionsStepsTree),
      task.interestingFacts == null ? undefined : JSON.stringify(task.interestingFacts),
      task.nextRecommendedTasks == null ? undefined : JSON.stringify(task.nextRecommendedTasks),
      task.hints == null ? undefined : JSON.stringify(task.hints),
      task.otherCheckSolutionData == null ? undefined : JSON.stringify(task.otherCheckSolutionData),
      task.countOfAutoGeneratedTasks,
      task.otherAutoGenerationData == null ? undefined : JSON.stringify(task.otherAutoGenerationData),
      task.otherAwardData == null ? undefined : JSON.stringify(task.otherAwardData),
      task.otherData == null ? undefined : JSON.stringify(task.otherData),
    );

    let rulePacksItr = twf_js.createRulePackITR(
      task.code,
      undefined,
      task.namespaceCode,
      task.nameEn,
      task.nameRu,
      task.descriptionShortEn,
      task.descriptionShortRu,
      task.descriptionEn,
      task.descriptionRu,
      task.subjectType,
      rulesPacksCodes,
      rulesItr
    )

    return twf_js.checkSolutionInTex(fullExpression, taskItr, [rulePacksItr], undefined, undefined);
  } catch (e: any) {
    console.error("ERROR WHILE CHECKING TEX", e.message, e);
    // console.log(getUserLogInPlainText())
  }
};
