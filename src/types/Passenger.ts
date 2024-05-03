type Data = {
  typecode?: string;
  count?: number;
  discountType?: string;
  card?: string;
  cardNo?: string;
  cardPw?: string;
};

class Passenger {
  public typecode: string;
  public count: number;
  public discountType: string;
  public card: string;
  public cardNo: string;
  public cardPw: string;
  public groupKey: string;

  constructor(data: Required<Data>) {
    this.typecode = data.typecode;
    this.count = data.count;
    this.discountType = data.discountType;
    this.card = data.card;
    this.cardNo = data.cardNo;
    this.cardPw = data.cardPw;

    this.groupKey = `${this.typecode}_${this.discountType}_${this.card}_${this.cardNo}_${this.cardPw}`;
  }

  merge = (other) => {
    if (this.groupKey === other.groupKey) {
      return new Passenger({
        typecode: this.typecode,
        count: this.count + other.count,
        discountType: this.discountType,
        card: this.card,
        cardNo: this.cardNo,
        cardPw: this.cardPw,
      });
    } else {
      throw new Error("groupKey is not equal");
    }
  };

  getDict = (index) => {
    const dict = {};
    dict[`txtPsgTpCd${index}`] = this.typecode;
    dict[`txtDiscKndCd${index}`] = this.discountType;
    dict[`txtCompaCnt${index}`] = this.count;
    dict[`txtCardCode_${index}`] = this.card;
    dict[`txtCardNo_${index}`] = this.cardNo;
    dict[`txtCardPw_${index}`] = this.cardPw;
    return dict;
  };
}

export class AdultPassenger extends Passenger {
  constructor(data: Data = {}) {
    super({
      typecode: "1",
      count: data.count || 1,
      discountType: data.discountType || "000",
      card: data.card || "",
      cardNo: data.cardNo || "",
      cardPw: data.cardPw || "",
    });
  }
}

export class ChildPassenger extends Passenger {
  constructor(data: Data = {}) {
    super({
      typecode: "3",
      count: data.count || 1,
      discountType: data.discountType || "000",
      card: data.card || "",
      cardNo: data.cardNo || "",
      cardPw: data.cardPw || "",
    });
  }
}

export class SeniorPassenger extends Passenger {
  constructor(data: Data = {}) {
    super({
      typecode: "1",
      count: data.count || 1,
      discountType: data.discountType || "131",
      card: data.card || "",
      cardNo: data.cardNo || "",
      cardPw: data.cardPw || "",
    });
  }
}
