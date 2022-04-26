@table("table_template")
export class TableTemplate extends Table {
  constructor(
    public account: Name = new Name(),
    public tokens: ExtendedAsset[] = [],
    public nfts: u64[] = [],
  ) {
    super();
  }

  @primary
  get primary(): u64 {
    return this.account.N;
  }

  static getTable(code: Name): TableStore<TableTemplate> {
    return new TableStore<TableTemplate>(code, code, Name.fromString("table_template"));
  }
}

