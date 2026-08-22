import { SetMetadata } from '@nestjs/common';

export const ADMIN_PANEL_KEY = 'admin_panel';
export const AdminPanel = (panel: string) => SetMetadata(ADMIN_PANEL_KEY, panel);