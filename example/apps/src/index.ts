import { common } from '@common';
import { user, greeting } from '@bright/shared';

console.log(greeting(user));
console.log(greeting(common));

console.log(common);

export const greetingUser = greeting(user);
export const greetingCommon = greeting(common);