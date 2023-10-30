import type { ParserServices, ParserServicesWithTypeInformation } from '@typescript-eslint/utils';

export type TypeServices = ParserServicesWithTypeInformation;

export function hasTypeServices(services: ParserServices | undefined): services is TypeServices {
  return services?.program != null;
}
