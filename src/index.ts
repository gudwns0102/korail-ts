import axios, { AxiosInstance } from "axios";
import type { Station } from "./types/Station";
import { stringify } from "qs";
import { wrapper } from "axios-cookiejar-support";
import { ModeOfOperation } from "aes-js";
import { CookieJar } from "tough-cookie";

type KoreailResponse<T> = {
  strResult: "SUCC" | "FAIL";
  h_msg_cd: string;
  h_msg_txt: string;
} & T;

export class KorailSession {
  public _device = "AD";
  public _version = "190617001";
  public _key = "korail1234567890";

  public cookieJar: CookieJar;
  public instance: AxiosInstance;

  private eventListeners: {
    login: Array<(data: any) => void>;
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

  addEventListener(event: "login", callback: (data: any) => void);
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

  async checkLoggedIn() {
    return (await this.code()).data.loginFlg === "Y";
  }

  async code() {
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
  }

  async encryptPassword(password: string) {
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
  }

  async login(txtMemberNo: string, txtPwd: string) {
    const { idx, encrypted_password } = await this.encryptPassword(txtPwd);

    const response = await this.instance.post<KoreailResponse<{}>>(
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

    if (response.data.strResult === "SUCC") {
      this.eventListeners.login.forEach((v) => v(response.data));
    }

    return response;
  }

  async logout() {
    const response = await this.instance.get<KoreailResponse<{}>>(
      "/com.korail.mobile.common.logout"
    );

    this.eventListeners.logout.forEach((v) => v());

    return response;
  }

  stationdata() {
    return this.instance.get<{
      stns: {
        stn: Array<Station>;
      };
    }>("/com.korail.mobile.common.stationdata");
  }

  reservationView() {
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
  }

  myTicketList() {
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
  }
}
