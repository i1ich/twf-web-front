import React, { Component } from "react";

import "./profile-page.scss";
import { Progress } from "antd";
import "antd/dist/antd.compact.min.css";
import { RegisterFormInputs } from "../../forms/regiser-form/register-form.types";
import { getAuthToken } from "../../utils/local-storage/auth-token";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  errorDuplicateEmail,
  errorDuplicateLogin,
  errorUnknown,
  success
} from "../../forms/regiser-form/register-form.data";
import { NamespaceReceivedForm } from "../../constructors/namespace-constructor/namespace-constructor.types";

function SampleUserPage() {
  let token = getAuthToken();
  let s = "";
  let url = process.env.REACT_APP_SERVER_API;
  if (token != null)
    //s = token;
    s = "Vovochka"
  else
    s = "aassddff";
  axios({
    method: "post",
    url: url + "/log/user_statistics",
    headers: {
      Authorization: "Bearer " + getAuthToken()
    },
  })
    .then((res: AxiosResponse<NamespaceReceivedForm>) => {
      s = res.data.code;
    })
    .catch((e: AxiosError) => {
      console.warn(
        e.response,
        e.message
      );
      throw e;
    });


  return (

    <div className="ratings-section">
      <div className="container rounded bg-white mt-5">
        <div className="row">
          <div className="col-md-5 border-right">
            <div className="d-flex flex-column align-items-center text-center p-3 py-5"><img
              className="rounded-circle mt-5" width="150px"
              src="/static/media/strong-brain.eba5527d6e3f5a57ba63aac457debf49.svg" /><span
              className="font-weight-bold">Username</span><span
              className="text-black-50">username@mail.com.my</span><span> </span></div>
          </div>
          <div className="col-md-7 border-right ">
            <div className="p-3 py-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-right">Profile Settings</h4>
              </div>
              <div className="row mt-2">
                <div className="col-md-6"><label className="labels">Name</label><input type="text"
                                                                                       className="form-control"
                                                                                       placeholder={s}
                                                                                       value={s} /></div>
                <div className="col-md-6"><label className="labels">Surname</label><input type="text"
                                                                                          className="form-control"
                                                                                          value=""
                                                                                          placeholder="surname" /></div>
              </div>
              <div className="row mt-3">
                <div className="col-md-12"><label className="labels">Mobile Number</label><input type="text"
                                                                                                 className="form-control"
                                                                                                 placeholder="enter phone number"
                                                                                                 value="" /></div>
                <div className="col-md-12"><label className="labels">Address Line 1</label><input type="text"
                                                                                                  className="form-control"
                                                                                                  placeholder="enter address line 1"
                                                                                                  value="" /></div>
                <div className="col-md-12"><label className="labels">Address Line 2</label><input type="text"
                                                                                                  className="form-control"
                                                                                                  placeholder="enter address line 2"
                                                                                                  value="" /></div>
                <div className="col-md-12"><label className="labels">Postcode</label><input type="text"
                                                                                            className="form-control"
                                                                                            placeholder="enter address line 2"
                                                                                            value="" /></div>
                <div className="col-md-12"><label className="labels">State</label><input type="text"
                                                                                         className="form-control"
                                                                                         placeholder="enter address line 2"
                                                                                         value="" /></div>
                <div className="col-md-12"><label className="labels">Area</label><input type="text"
                                                                                        className="form-control"
                                                                                        placeholder="enter address line 2"
                                                                                        value="" /></div>
                <div className="col-md-12"><label className="labels">Email ID</label><input type="text"
                                                                                            className="form-control"
                                                                                            placeholder="enter email id"
                                                                                            value="" /></div>
                <div className="col-md-12"><label className="labels">Education</label><input type="text"
                                                                                             className="form-control"
                                                                                             placeholder="education"
                                                                                             value="" /></div>
              </div>
              <div className="row mt-3">
                <div className="col-md-6"><label className="labels">Country</label><input type="text"
                                                                                          className="form-control"
                                                                                          placeholder="country"
                                                                                          value="" /></div>
                <div className="col-md-6"><label className="labels">State/Region</label><input type="text"
                                                                                               className="form-control"
                                                                                               value=""
                                                                                               placeholder="state" />
                </div>
              </div>
              <div className="mt-5 text-center">
                <button className="navigation-bar__link navigation-bar__link--signin" type="button">Save Profile
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SampleUserPage;
