export interface ApprovalRates {
  [group: string]: number;
}

export interface AuditData {
  ratio: number;
  status: string;
  rates: ApprovalRates;
}
