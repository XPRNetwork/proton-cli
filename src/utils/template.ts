import * as ejs from 'ejs';

export function render<T>(content: string, data: T) {
  return ejs.render(content, data as any);
}
