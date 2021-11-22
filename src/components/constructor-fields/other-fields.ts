import {ConstructorFormInput} from "../constructor-form/constructor-form.types";

export const getOtherFields = () : ConstructorFormInput[] => {
  return [
    {
      name: "stepsNumber",
      label: "Количество шагов",
      type: "number",
    },
    {
      name: "time",
      label: "Время",
      type: "number",
    },
    {
      name: "difficulty",
      label: "Сложность",
      type: "number",
    },
    {
      name: "solution",
      label: "Решение",
      type: "text",
      isExpressionInput: true,
    },
    {
      name: "goalPattern",
      label: "Патерн цели",
      type: "text",
    },
    {
      name: "countOfAutoGeneratedTasks",
      label: "Количество автогенерируемых подуровней",
      type: "number",
    },
    {
      name: "otherGoalData",
      label: "Дополнительная информация о цели задачи",
      type: "text",
      isTextArea: true,
    },
    {
      name: "otherCheckSolutionData",
      label: "Дополнительная информация о проверке решения",
      type: "text",
      isTextArea: true,
    },
    {
      name: "otherAwardData",
      label: "Дополнительная информация о награде",
      type: "text",
      isTextArea: true,
    },
    {
      name: "otherAutoGenerationData",
      label: "Дополнительная информация об автогенерации",
      type: "text",
      isTextArea: true,
    },
    {
      name: "solutionsStepsTree",
      label: "solutionsStepsTree",
      type: "text",
      isTextArea: true,
    },
    {
      name: "hints",
      label: "hints",
      type: "text",
      isTextArea: true,
    },
    {
      name: "interestingFacts",
      label: "interestingFacts",
      type: "text",
      isTextArea: true,
    },
    {
      name: "nextRecommendedTasks",
      label: "nextRecommendedTasks",
      type: "text",
      isTextArea: true,
    },
    {
      name: "otherData",
      label: "Дополнительная информация",
      type: "text",
      isTextArea: true,
    },
  ]
};