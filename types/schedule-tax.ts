export type MeasurementType = {
  _id: string;
  unitNameEn: string;
  unitNameAr: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type CreateScheduleTaxInput = {
  note: string;
  measurementId: string;
  fee: number;
  max: number;
  min: number;
};

export type ScheduleTaxType = {
  _id: string;
  note: string;
  measurementId: {
    _id: string;
    unitNameEn: string;
    unitNameAr: string;
  };
  fee: number;
  max: number;
  min: number;
};

export type UpdateScheduleTaxInput = CreateScheduleTaxInput & {
  _id: string;
};
