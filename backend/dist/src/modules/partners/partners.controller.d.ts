import { PartnersService } from './partners.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';
export declare class PartnersController {
    private partnersService;
    constructor(partnersService: PartnersService);
    findAll(req: any): Promise<{
        owned: ({
            partner: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            ownerId: string;
            status: string;
            permission: string;
            partnerId: string;
        })[];
        of: ({
            owner: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            ownerId: string;
            status: string;
            permission: string;
            partnerId: string;
        })[];
    }>;
    create(dto: CreatePartnerDto, req: any): Promise<{
        partner: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ownerId: string;
        status: string;
        permission: string;
        partnerId: string;
    }>;
    update(id: string, dto: UpdatePartnerDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        ownerId: string;
        status: string;
        permission: string;
        partnerId: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        ownerId: string;
        status: string;
        permission: string;
        partnerId: string;
    }>;
}
