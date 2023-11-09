import { SetMetadata } from '@nestjs/common';

// todo: bunu chatgpt analiz ettir
export const Public = () => SetMetadata('isPublic', true);
