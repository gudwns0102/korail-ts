import { Schedule } from "./Schedule";

export type KoreailResponse<T> = {
  strResult: "SUCC" | "FAIL";
  h_msg_cd: string;
  h_msg_txt: string;
} & T;

export type LoginSuccessResponse = {
  strDiscCrdReisuFlg: "N";
  strGoffStnCd: string;
  strAthnFlg2: "F";
  Key: string;
  /**
   * @example "서울"
   */
  strAbrdStnNm: string;
  strYouthAgrFlg: "6";
  strAthnFlg5: "Y";
  strCustClCd: "F";
  strAbrdStnCd: "0001";
  strPrsCnqeMsgCd: "";
  strAthnFlg: "N";
  strDiscCouponFlg: "N";
  strEvtTgtFlg: "S";
  strMbCrdNo: string;
  strCustMgSrtCd: "P";
  dlayDscpInfo: "N";
  /**
   * @example "부산"
   */
  strGoffStnNm: string;
  /**
   * @description 휴대폰 번호
   * @example "01012345678"
   */
  strCpNo: string;
  strCustLeadFlgNm: "";
  strCustDvCd: "B";
  notiTpCd: "";
  strLognTpCd1: "N";
  strCustNo: "RA1000470260";
  strSexDvCd: "M";
  encryptHMbCrdNo: string;
  strLognTpCd3: "N";
  strHdcpTpCd: "";
  strLognTpCd2: "Y";
  h_msg_cd: "IRZ000001";
  strLognTpCd5: "N";
  strLognTpCd4: "N";
  /**
   * @description 시용자 이름
   * @example "홍길동"
   */
  strCustNm: "홍길동";
  strLognTpCd6: "N";
  strResult: "SUCC";
  strHdcpTpCdNm: "";
  strCustId: "";
  strEmailAdr: "email";
  strHdcpFlg: "F";
  strCustSrtCd: "210";
  strSubtDcsClCd: "";
  encryptMbCrdNo: string;
  strAthnFlg7: "A";
  encryptCustNo: string;
  /**
   * @description 사용자 생년월일
   * @example "19900101"
   */
  strBtdt: string;
  strCustLeadFlg: "";
};

export type LoginResponse = KoreailResponse<
  | LoginSuccessResponse
  | {
      // 실패
    }
>;

export type ScheduleViewSuccessResponse = {
  trn_infos: {
    trn_info: Array<Schedule>;
  };
};
