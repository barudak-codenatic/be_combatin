import { Controller, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';

@Controller('module-progress')
@UseGuards(JwtGuard)
export class ModuleProgressController {
    
}
