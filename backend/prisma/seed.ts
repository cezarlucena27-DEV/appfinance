import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const segments = [
    { name: 'Motorista de App', icon: 'car' },
    { name: 'Freelancer', icon: 'laptop' },
    { name: 'Designer', icon: 'palette' },
    { name: 'Desenvolvedor', icon: 'code' },
    { name: 'Fotografo', icon: 'camera' },
    { name: 'Personal Trainer', icon: 'dumbbell' },
    { name: 'Barbeiro', icon: 'scissors' },
    { name: 'Manicure', icon: 'sparkles' },
    { name: 'Dentista', icon: 'heart' },
    { name: 'Advogado', icon: 'scale' },
    { name: 'Contador', icon: 'calculator' },
    { name: 'Professor', icon: 'book' },
    { name: 'Medico', icon: 'stethoscope' },
    { name: 'Enfermeiro', icon: 'activity' },
    { name: 'Vendedor', icon: 'shopping-bag' },
    { name: 'Entregador', icon: 'truck' },
    { name: 'Cozinheiro', icon: 'chef-hat' },
    { name: 'Eletricista', icon: 'zap' },
    { name: 'Encanador', icon: 'droplets' },
    { name: 'Pedreiro', icon: 'hammer' },
    { name: 'Cabeleireiro', icon: 'scissors' },
    { name: 'Esteticista', icon: 'flower' },
    { name: 'Psicologo', icon: 'brain' },
    { name: 'Nutricionista', icon: 'apple' },
    { name: 'Arquiteto', icon: 'ruler' },
    { name: 'Tradutor', icon: 'globe' },
    { name: 'Coach', icon: 'target' },
    { name: 'Consultor', icon: 'message-circle' },
    { name: 'Outro', icon: 'briefcase' },
  ];

  for (const segment of segments) {
    await prisma.segment.upsert({
      where: { name: segment.name },
      update: {},
      create: segment,
    });
  }

  console.log(`Seeded ${segments.length} segments`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
