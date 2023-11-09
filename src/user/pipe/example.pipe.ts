import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ExamplePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('this is example pipe', value);
    return value;
  }
}
