import { KorailSession } from "../src";
import { TrainType } from "../src/types/TrainType";

describe("KorailSession", () => {
  test("code", () => {
    const session = new KorailSession();

    return session.code().then((response) => {
      expect(response.status).toBe(200);
    });
  });

  test.only("login", () => {
    const session = new KorailSession();

    return session
      .login(process.env.KORAIL_ID!, process.env.KORAIL_PW!)
      .then((response) => {
        expect(response).toBe(process.env.KORAIL_ID!);
      });
  });

  test("logout", () => {
    const session = new KorailSession();

    return session
      .login(process.env.KORAIL_ID!, process.env.KORAIL_PW!)
      .then(() =>
        session.myTicketList().then((before) =>
          session.logout().then(() =>
            session.myTicketList().then((after) => {
              expect(before.data.strResult).toBe("SUCC");
              expect(after.data.strResult).toBe("FAIL");
            })
          )
        )
      );
  });

  test("stationdata", () => {
    const session = new KorailSession();

    return session.stationdata().then((response) => {
      expect(response).toBe(200);
    });
  });

  test("myTicketList", () => {
    const session = new KorailSession();

    return session.myTicketList().then((response) => {
      expect(response.status).toBe(200);
    });
  });

  test("scheduleView", () => {
    const session = new KorailSession();

    return session
      .scheduleView({
        dep: "서울",
        arr: "부산",
        txtGoAbrdDt: "20240515",
        train_type: TrainType.KTX,
      })
      .then((response) => {
        expect(response.status).toBe(200);
      });
  });

  test("reserve", () => {
    const session = new KorailSession();

    return session
      .login(process.env.KORAIL_ID!, process.env.KORAIL_PW!)
      .then(() =>
        session
          .scheduleView({
            dep: "서울",
            arr: "부산",
            txtGoAbrdDt: "20240506",
            train_type: TrainType.KTX,
          })
          .then(async (response) => {
            const available = response.data.trn_infos.trn_info.find(
              (train) => train.h_rsv_psb_flg === "Y"
            );

            if (!available) {
              throw new Error("No available train");
            }

            const { data } = await session.reserve(available);

            expect(data).toBe(200);
          })
      );
  });
});
