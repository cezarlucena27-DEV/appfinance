"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPanel = exports.ADMIN_PANEL_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ADMIN_PANEL_KEY = 'admin_panel';
const AdminPanel = (panel) => (0, common_1.SetMetadata)(exports.ADMIN_PANEL_KEY, panel);
exports.AdminPanel = AdminPanel;
//# sourceMappingURL=admin-panel.decorator.js.map