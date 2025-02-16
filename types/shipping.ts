export type ShippingPortFromAPI = {
  _id: string;
  nameAr: string;
  nameEn: string;
  port: string;
  countryId?: {
    _id: string;
    nameEn: string;
    nameAr: string;
    code: string;
  };
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type ShippingPort = ShippingPortFromAPI & { id: string };
