// hooks and libs
import axios, { AxiosError, AxiosResponse } from "axios";
// utils
import { getAuthToken } from "../../utils/local-storage/auth-token";
import { ConstructorCreationMode, ReportStatisticsEntity } from "../common-types";
// types
import {
  TaskSetConstructorLinkReceivedForm,
  TaskSetConstructorReceivedForm,
  TaskSetConstructorSendForm,
} from "./task-set-constructor.types";
import { TaskContextForm } from "../../pages/solve-math-page/solve-math-page.types";
import { RulePackConstructorReceivedForm } from "../rule-pack-constructor/rule-pack-constructor.types";
import { TaskConstructorReceivedForm } from "../task-constructor/task-constructor.types";
import { getTimestampStringFromDate } from "../../utils/utils";

export enum GetOneTaskSetMode {
  PLAY = 0,
  SOLVE,
  EDIT,
  COUNT
}

export class TaskSetConstructorRequestsHandler {
  private static url = process.env.REACT_APP_SERVER_API + "/taskset";
  private static logRootUrl = process.env.REACT_APP_SERVER_API + "/log/";

  public static async getAll(): Promise<TaskSetConstructorReceivedForm[]> {
    return axios({
      method: "get",
      url: this.url,
      headers: {
        Authorization: "Bearer " + getAuthToken(),
      },
    })
      .then(
        (
          res: AxiosResponse<{ tasksets: TaskSetConstructorReceivedForm[] }>
        ) => {
          return res.data.tasksets;
        }
      )
      .catch((e: AxiosError) => {
        console.error("Error fetching all taskSets", e.message, e.response);
        throw e;
      });
  }

  public static async getAllLinks(): Promise<TaskSetConstructorLinkReceivedForm[]> {
    return axios({
      method: "get",
      url: this.url + "?form=cutted_link",
      headers: {
        Authorization: "Bearer " + getAuthToken(),
      },
    })
      .then(
        (
          res: AxiosResponse<{ tasksets: TaskSetConstructorLinkReceivedForm[] }>
        ) => {
          return res.data.tasksets;
        }
      )
      .catch((e: AxiosError) => {
        console.error("Error fetching all tasksets' links", e.message, e.response);
        throw e;
      });
  }

  public static async getOne(
    code: string,
    mode: GetOneTaskSetMode
  ): Promise<TaskContextForm> {
    let url = this.url;
    switch (mode) {
      case GetOneTaskSetMode.EDIT:
        url += "/edit/";
        break;
      case GetOneTaskSetMode.SOLVE:
        url += "/solve/SOLVE_MATH_WEB/solve/";
        break;
      case GetOneTaskSetMode.PLAY:
        url += "/play/SOLVE_MATH_WEB/play/";
        break;
    }
    url += code;

    return axios({
      method: "get",
      url: url,
      headers: {
        Authorization: "Bearer " + getAuthToken(),
      },
    })
      .then(
        (
          res: AxiosResponse<{
            taskset: TaskSetConstructorReceivedForm;
            rulePacks: RulePackConstructorReceivedForm[];
          }>
        ) => {
          res.data.taskset.tasks.forEach((task: TaskConstructorReceivedForm) => {
            if (!task.rules) {
              task.rules = []
            }
          });
          return {
            taskset: res.data.taskset,
            rulePacks: res.data.rulePacks,
          } as TaskContextForm;
        }
      )
      .catch((e: AxiosError) => {
        console.error(
          "Error fetching taskSet with code: " + code,
          e.message,
          e.response
        );
        throw e;
      });
  }

  public static async submitOne(
    creationMode: ConstructorCreationMode,
    data: TaskSetConstructorSendForm,
  ): Promise<Number> {
    return axios({
      method: "post",
      url: this.url + (creationMode === ConstructorCreationMode.CREATE ? "/create/" : "/update/"),
      data,
      headers: {
        Authorization: "Bearer " + getAuthToken(),
      },
    })
      .then((res: AxiosResponse) => {
        return res.status;
      })
      .catch((e: AxiosError) => {
        console.error(
          "Error posting taskSet with code: " + data.code,
          e.message,
          e.response
        );
        throw e;
      });
  }

  public static async getReport(tasksetCode: String): Promise<ReportStatisticsEntity[]> {
    return axios({
      method: "get",
      url: this.logRootUrl + `statistics_for_report?taskset=${tasksetCode}`,
      headers: {
        Authorization: "Bearer " + getAuthToken(),
      },
    }).then((res: AxiosResponse<ReportStatisticsEntity[]>) => {
      return res.data;
    }).catch((e: AxiosError) => {
      console.error(
        `Error trying to get taskset report. Taskset code: ${tasksetCode}`,
        e.response,
        e.message
      );
      throw e;
    });
  }

  public static async getReportByDateInterval(tasksetCode: String, startDate: Date | null, endDate: Date | null): Promise<ReportStatisticsEntity[]> {
    let url = this.logRootUrl + `statistics_for_report?taskset=${tasksetCode}`;
    if (startDate !== null && endDate !== null) {
      url += `&start_date=${getTimestampStringFromDate(startDate)}&end_date=${getTimestampStringFromDate(endDate)}`
    }

    return axios({
      method: "get",
      url: url,
      headers: {
        Authorization: "Bearer " + getAuthToken(),
      },
    }).then((res: AxiosResponse<ReportStatisticsEntity[]>) => {
      return res.data;
    }).catch((e: AxiosError) => {
      console.error(
        `Error trying to get taskset report. Taskset code: ${tasksetCode}`,
        e.response,
        e.message
      );
      throw e;
    });
  }
}
