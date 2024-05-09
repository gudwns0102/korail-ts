import { ModeOfOperation } from "aes-js";
import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { stringify } from "qs";
import { CookieJar } from "tough-cookie";
import { KorailError } from "./KorailError";
import { YYYYMMDD, hhmmss } from "./types";
import { AdultPassenger } from "./types/Passenger";
import {
  KoreailResponse,
  LoginResponse,
  LoginSuccessResponse,
  ScheduleViewSuccessResponse,
} from "./types/Response";
import { Schedule } from "./types/Schedule";
import type { Station } from "./types/Station";
import { TrainType } from "./types/TrainType";

export * from "./types";
export * from "./types/Response";
export * from "./types/Schedule";
export * from "./types/Station";

export class KorailSession {
  public _device = "AD";
  public _version = "190617001";
  public _key = "korail1234567890";

  public cookieJar: CookieJar;
  public instance: AxiosInstance;

  private eventListeners: {
    login: Array<(data: LoginSuccessResponse) => void>;
    logout: Array<() => void>;
  } = {
    login: [],
    logout: [],
  };

  constructor() {
    this.cookieJar = new CookieJar();

    this.instance = wrapper(
      axios.create({
        baseURL: "https://smart.letskorail.com/classes/",
        jar: this.cookieJar,
        withCredentials: true,
      })
    );
  }

  addEventListener(
    event: "login",
    callback: (data: LoginSuccessResponse) => void
  );
  addEventListener(event: "logout", callback: () => void);
  addEventListener(event, callback) {
    if (event === "login") {
      this.eventListeners.login.push(callback);
    } else if (event === "logout") {
      this.eventListeners.logout.push(callback);
    }
  }

  removeEventListener(event: "login", callback: (data: any) => void);
  removeEventListener(event: "logout", callback: () => void);
  removeEventListener(event, callback) {
    if (event === "login") {
      this.eventListeners.login = this.eventListeners.login.filter(
        (v) => v !== callback
      );
    } else if (event === "logout") {
      this.eventListeners.logout = this.eventListeners.logout.filter(
        (v) => v !== callback
      );
    }
  }

  checkLoggedIn = async () => {
    return (await this.code()).data.loginFlg === "Y";
  };

  code = async () => {
    return this.instance.post<
      KoreailResponse<{
        "app.login.cphd"?: {
          pwdAESCphd: "Y";
          idx: string;
          key: string;
        };
        loginFlg: "Y" | "N";
      }>
    >(
      "/com.korail.mobile.common.code.do",
      stringify({
        code: "app.login.cphd",
      })
    );
  };

  encryptPassword = async (password: string) => {
    const { data } = await this.code();

    if (data["app.login.cphd"] === undefined) {
      throw new Error("app.login.cphd is undefined");
    }

    const { idx, key } = data["app.login.cphd"];

    const BLOCK_SIZE = 16;

    const utf8encoder = new TextEncoder();
    const encrypt_key = utf8encoder.encode(key);
    const iv = utf8encoder.encode(key.slice(0, BLOCK_SIZE));
    const value = BLOCK_SIZE - (password.length % BLOCK_SIZE);

    const padded_data = new Uint8Array([
      ...utf8encoder.encode(password),
      ...new Array(value).fill(value),
    ]);

    const aesCbc = new ModeOfOperation.cbc(encrypt_key, iv);
    const result = aesCbc.encrypt(padded_data);

    return {
      idx,
      key,
      encrypted_password: btoa(
        btoa(
          Array.from(result.slice(0, BLOCK_SIZE))
            .map((v) => String.fromCharCode(v))
            .join("")
        )
      ),
    };
  };

  login = async (txtMemberNo: string, txtPwd: string) => {
    const { idx, encrypted_password } = await this.encryptPassword(txtPwd);

    const response = await this.instance.post<LoginResponse>(
      "/com.korail.mobile.login.Login",
      stringify({
        Device: "AD",
        Version: "231231001",
        txtInputFlg: "2",
        txtMemberNo,
        txtPwd: encrypted_password,
        idx,
      })
    );

    if ("strMbCrdNo" in response.data) {
      const data = response.data;
      this.eventListeners.login.forEach((v) => v(data));
      return response.data.strMbCrdNo || "";
    }

    throw new KorailError(response.data.h_msg_txt);
  };

  logout = async () => {
    await this.instance.get<KoreailResponse<{}>>(
      "/com.korail.mobile.common.logout"
    );

    this.eventListeners.logout.forEach((v) => v());

    return;
  };

  stationdata = async () => {
    const { data } = await this.instance.get<{
      stns: {
        stn: Array<Station>;
      };
    }>("/com.korail.mobile.common.stationdata");

    return data.stns.stn;
  };

  reservationView = () => {
    return this.instance.get<
      KoreailResponse<{
        jrny_infos: {
          jrny_info: Array<any>;
        };
      }>
    >("/com.korail.mobile.reservation.ReservationView", {
      params: {
        Device: this._device,
        Version: this._version,
        Key: this._key,
      },
    });
  };

  myTicketList = () => {
    return this.instance.get<KoreailResponse<{}>>(
      "/com.korail.mobile.myTicket.MyTicketList",
      {
        params: {
          Device: this._device,
          Version: this._version,
          Key: this._key,
          txtIndex: "1",
          h_page_no: "1",
          txtDeviceId: "",
          h_abrd_dt_from: "",
          h_abrd_dt_to: "",
        },
      }
    );
  };

  scheduleView = ({
    dep,
    arr,
    txtGoAbrdDt,
    txtGoHour = "000000",
    train_type = TrainType.ALL,
  }: {
    dep: string;
    arr: string;
    txtGoAbrdDt: YYYYMMDD;
    txtGoHour?: hhmmss;
    train_type?: TrainType;
  }) => {
    return this.instance.get<KoreailResponse<ScheduleViewSuccessResponse>>(
      "/com.korail.mobile.seatMovie.ScheduleView",
      {
        params: {
          Device: this._device,
          radJobId: "1",
          selGoTrain: train_type,
          txtCardPsgCnt: "0",
          txtGdNo: "",
          txtGoAbrdDt,
          txtGoEnd: arr,
          txtGoHour,
          txtGoStart: dep,
          txtJobDv: "",
          txtMenuId: "11",
          txtPsgFlg_1: 1,
          txtPsgFlg_2: 0,
          txtPsgFlg_8: 0,
          txtPsgFlg_3: 0,
          txtPsgFlg_4: "0",
          txtPsgFlg_5: "0",
          txtSeatAttCd_2: "000",
          txtSeatAttCd_3: "000",
          txtSeatAttCd_4: "015",
          txtTrnGpCd: train_type,
          Version: this._version,
        },
      }
    );
  };

  reserve = async (schedule: Schedule) => {
    const passengers = [new AdultPassenger()];

    const params = {
      Device: this._device,
      Version: this._version,
      Key: this._key,
      txtGdNo: "",
      txtJobId: "1101",
      txtTotPsgCnt: 1,
      txtSeatAttCd1: "000",
      txtSeatAttCd2: "000",
      txtSeatAttCd3: "000",
      txtSeatAttCd4: "015",
      txtSeatAttCd5: "000",
      hidFreeFlg: "N",
      txtStndFlg: "N",
      txtMenuId: "11",
      txtSrcarCnt: "0",
      txtJrnyCnt: "1",

      // 여정정보
      txtJrnySqno1: "001",
      txtJrnyTpCd1: "11",
      txtDptDt1: schedule.h_dpt_dt,
      txtDptRsStnCd1: schedule.h_dpt_rs_stn_cd,
      txtDptTm1: schedule.h_dpt_tm,
      txtArvRsStnCd1: schedule.h_arv_rs_stn_cd,
      txtTrnNo1: schedule.h_trn_no,
      txtRunDt1: schedule.h_run_dt,
      txtTrnClsfCd1: schedule.h_trn_clsf_cd,
      txtPsrmClCd1: "1",
      txtTrnGpCd1: schedule.h_trn_gp_cd,
      txtChgFlg1: "",

      // txtTotPsgCnt 만큼 반복
      // txtPsgTpCd1		: '1',		// 손님 종류 (어른, 어린이)
      // txtDiscKndCd1	: '000',	// 할인 타입 (경로, 동반유아, 군장병 등..)
      // txtCompaCnt1		: '1',		// 인원수
      // txtCardCode_1	: '',
      // txtCardNo_1		: '',
      // txtCardPw_1		: '',
    };

    passengers.forEach((psgr, idx) => {
      Object.assign(params, psgr.getDict(idx + 1));
    });

    return this.instance.get<KoreailResponse<{}>>(
      "/com.korail.mobile.certification.TicketReservation",
      {
        params,
      }
    );
  };
}
