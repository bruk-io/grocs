/** New ids for items, meals and correlation. Domain functions never generate ids; commands do, through this port. */
export interface IdGenerator {
  newId(): string;
}
