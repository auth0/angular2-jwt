import { expectType } from 'tsd';
import { JwtHelperService } from './index';

// tslint:disable-next-line:no-empty-interface
interface Token {}

const service = new JwtHelperService();

expectType<Token | null | Promise<Token | null>>(service.decodeToken<Token>());
expectType<Token | null>(service.decodeToken<Token>(''));
expectType<Token | null>(service.decodeToken<Token>('TEST_TOKEN'));
expectType<Promise<Token | null>>(service.decodeToken<Token>(Promise.resolve('')));

expectType<boolean | Promise<boolean>>(service.isTokenExpired());
expectType<boolean>(service.isTokenExpired(''));
expectType<boolean>(service.isTokenExpired('TEST_TOKEN'));
expectType<Promise<boolean>>(service.isTokenExpired(Promise.resolve('')));

expectType<boolean>(service.isTokenExpired('', 0));
expectType<boolean>(service.isTokenExpired('TEST_TOKEN', 0));
expectType<boolean>(service.isTokenExpired(null, 0));
expectType<boolean | Promise<boolean>>(service.isTokenExpired(undefined, 0));

expectType<null | Date | Promise<Date | null>>(service.getTokenExpirationDate());
expectType<null | Date>(service.getTokenExpirationDate(''));
expectType<null | Date>(service.getTokenExpirationDate('TEST_TOKEN'));
expectType<Promise<null | Date>>(service.getTokenExpirationDate(Promise.resolve('')));
