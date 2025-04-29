import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function OneOrNone(
  property1: string,
  property2: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'OneOrNone',
      target: object.constructor,
      propertyName,
      constraints: [property1, property2],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const hasProperty1 = !!obj[property1];
          const hasProperty2 = !!obj[property2];

          return (
            (hasProperty1 || hasProperty2) && !(hasProperty1 && hasProperty2)
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `Hanya salah satu dari '${args.constraints[0]}' atau '${args.constraints[1]}' yang boleh diisi`;
        },
      },
    });
  };
}
