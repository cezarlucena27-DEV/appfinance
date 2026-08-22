import { SegmentsService } from './segments.service';
export declare class SegmentsController {
    private segmentsService;
    constructor(segmentsService: SegmentsService);
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        icon: string;
    }[]>;
}
