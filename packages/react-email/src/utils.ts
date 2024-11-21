export interface TMock {
  (key: string, options?: Record<string, unknown>): string;
  rich: (key: string, options?: Record<string, unknown>) => string;
}
const tMock: TMock = (key, _options) => key;
tMock.rich = (key, _options) => key;

export { tMock };

//
