import { KorailSession } from "../src";

describe("KorailSession", () => {
  test("code", () => {
    const session = new KorailSession();

    return session.code().then((response) => {
      expect(response.status).toBe(200);
    });
  });

  test("login", () => {
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
      expect(response.status).toBe(200);
    });
  });

  test("myTicketList", () => {
    const session = new KorailSession();

    return session.myTicketList().then((response) => {
      expect(response.status).toBe(200);
    });
  });
});
