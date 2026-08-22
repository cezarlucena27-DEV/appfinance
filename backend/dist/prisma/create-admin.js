"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = 'cezar.lucena27@gmail.com';
    const password = 'senha123';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`User ${email} already exists. Updating to platform_admin...`);
        const passwordHash = await bcrypt.hash(password, 12);
        await prisma.user.update({
            where: { email },
            data: {
                passwordHash,
                globalRole: 'platform_admin',
                isAdminApproved: true,
                isActive: true,
            },
        });
        console.log('Admin updated successfully.');
        return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: {
            name: 'Cezar Lucena',
            email,
            passwordHash,
            globalRole: 'platform_admin',
            isAdminApproved: true,
            isActive: true,
            onboardingCompleted: true,
        },
    });
    const workspace = await prisma.workspace.create({
        data: {
            name: 'Admin Workspace',
            ownerId: user.id,
            plan: 'free',
        },
    });
    await prisma.workspaceMember.create({
        data: {
            userId: user.id,
            workspaceId: workspace.id,
            role: 'master',
        },
    });
    console.log(`Admin created: ${email} (id: ${user.id})`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=create-admin.js.map